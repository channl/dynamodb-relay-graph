/* @flow */
import { invariant } from '../Global';
import AttributeValueHelper from '../query-helpers/AttributeValueHelper';
import type { Model } from '../flow/Types';
import type { AttributeMap } from 'aws-sdk-promise';

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

  static toModel(type: string, item: AttributeMap): Model {
    invariant(typeof type === 'string', 'Argument \'type\' is not a string');
    invariant(item, 'Argument \'item\' is null');

    let model = { type };
    for (let name in item) {
      if ({}.hasOwnProperty.call(item, name)) {
        let attr = item[name];
        // TODO Check the types of the values here
        if (typeof attr.S !== 'undefined') {
          model[name] = item[name].S;
        } else if (typeof attr.N !== 'undefined') {
          model[name] = parseInt(item[name].N, 10);
        } else if (typeof attr.B !== 'undefined') {
          model[name] = item[name].B;
        } else if (typeof attr.BOOL !== 'undefined') {
          model[name] = item[name].BOOL;
        }
      }
    }

    return model;
  }
}
