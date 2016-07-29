/* @flow */
import { invariant } from '../Global';
import ValueHelper from '../query-helpers/ValueHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import { toGlobalId } from 'graphql-relay';
import type { Model, Value } from '../flow/Types';

export default class ModelHelper {

  static toAWSKey(item: Model, indexedByAttributeName: ?string) {
    invariant(item, 'Argument \'item\' is null');

    let key = {};
    if (item.type.endsWith('Edge')) {
      key.outID = ValueHelper.toAttributeValue(item.outID);
      key.inID = ValueHelper.toAttributeValue(item.inID);
    } else {
      key.id = ValueHelper.toAttributeValue(item.id);
    }

    if (indexedByAttributeName != null) {
      key[indexedByAttributeName] = ValueHelper.toAttributeValue(item[indexedByAttributeName]);
    }

    return key;
  }

  static toAWSItem(item: Model) {
    invariant(item, 'Argument \'item\' is null');

    let awsItem = {};
    Object.keys(item)
      .filter(key => key !== 'type')
      .forEach(key => { awsItem[key] = ValueHelper.toAttributeValue(item[key]); } );

    return awsItem;
  }

  static toGlobalId(model: Model): string {
    invariant(model, 'Argument \'model\' is null');

    if (model.type.endsWith('Edge')) {
      return toGlobalId(
        model.type,
        this._getGlobalIdParam(model.outID) + '___' + this._getGlobalIdParam(model.inID));
    }

    return toGlobalId(model.type, this._getGlobalIdParam(model.id));
  }

  static toCursor(item: Model, order: ?string): string {
    invariant(item, 'Argument \'item\' is null');

    let key = this.toAWSKey(item, order);
    return AttributeMapHelper.toCursor(key);
  }

  static _getGlobalIdParam(value: Value) {
    invariant(value, 'Argument \'value\' is null');

    if (value instanceof Buffer) {
      return 'B' + value.toString('base64');
    }

    if (typeof value === 'string') {
      return 'S' + value;
    }

    if (typeof value === 'number') {
      return 'N' + value.toString();
    }

    invariant(false, 'Attribute type not supported');
  }
}
