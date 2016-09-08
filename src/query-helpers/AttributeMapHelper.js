/* @flow */
import { invariant } from '../Global';
import AttributeValueHelper from '../query-helpers/AttributeValueHelper';
import type { AttributeMap } from 'aws-sdk-promise';
// eslint-disable-next-line no-unused-vars
import type { AttrMapValueConvertor, AttrMapConvertor, Model } from '../flow/Types';

export default class AttributeMapHelper {

  static areEqual(a: AttributeMap, b: ?AttributeMap) {
    invariant(a != null, 'Argument \'a\' is null');

    if (b == null) {
      return false;
    }

    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }

    // $FlowIgnore
    if (Object.keys(a).some(key => !AttributeValueHelper.areEqual(a[key], b[key]))) {
      return false;
    }

    return true;
  }

  static isSupersetOf(superset: AttributeMap, base: AttributeMap) {
    invariant(superset != null, 'Argument \'superset\' is null');
    invariant(base != null, 'Argument \'base\' is null');

    if (Object.keys(base).some(key => !AttributeValueHelper.areEqual(base[key], superset[key]))) {
      return false;
    }

    return true;
  }

  static toCursor(key: AttributeMap): string {
    invariant(key, 'Argument \'key\' is null');

    let cursorData = JSON.stringify(key);
    let b = new Buffer(cursorData);
    return b.toString('base64');
  }

  static toModel(type: string, item: AttributeMap,
    valueConvertors?: AttrMapValueConvertor[], mapConvertors?: AttrMapConvertor[]): Model {
    invariant(typeof type === 'string', 'Argument \'type\' is not a string');
    invariant(item, 'Argument \'item\' is null');

    let baseValueConvertor = (typeName, attrName, source, target) => {
      if (typeof source[attrName].S !== 'undefined') {
        target[attrName] = source[attrName].S;
        return true;
      }
      if (typeof source[attrName].N !== 'undefined') {
        target[attrName] = parseInt(source[attrName].N, 10);
        return true;
      }
      if (typeof source[attrName].B !== 'undefined') {
        target[attrName] = source[attrName].B;
        return true;
      }
      if (typeof source[attrName].BOOL !== 'undefined') {
        target[attrName] = source[attrName].BOOL;
        return true;
      }

      return false;
    };

    let allValueConvertors: AttrMapValueConvertor[] = [];
    if (valueConvertors != null) {
      allValueConvertors.push(...valueConvertors);
    }
    allValueConvertors.push(baseValueConvertor);

    let model: Model = { id: '' };

    // Call the attribute map value convertors
    for (let name in item) {
      if ({}.hasOwnProperty.call(item, name)) {
        for(let convertor of allValueConvertors) {
          if (convertor(type, name, item, model)) {
            break;
          }
        }
      }
    }

    // Call the final attribute map convertors
    if (mapConvertors != null) {
      for(let convertor of mapConvertors) {
        convertor(type, item, model);
      }
    }

    // This should be the final fully converted model
    return model;
  }
}
