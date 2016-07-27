/* @flow */
import { warning, invariant } from '../Global';
import ValueHelper from '../query-helpers/ValueHelper';
import { toGlobalId } from 'graphql-relay';
import type { Model, Value } from '../flow/Types';

export default class ModelHelper {

  static toAWSItem(item: Model) {
    try {
      invariant(item, 'Argument \'item\' is null');

      let awsItem = {};

      let keys: string[] = Object.keys(item);
      for (let key of keys) {
        if (key === 'type') {
          // Skip over type because it's not stored in aws
          continue;
        }

        awsItem[key] = ValueHelper.toAttributeValue(item[key]);
      }

      return awsItem;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'TypeHelper',
        function: 'getAWSItemFromModel',
        item}, null, 2));
      throw ex;
    }
  }

  static toGlobalId(model: Model): string {
    try {
      invariant(model, 'Argument \'model\' is null');

      if (model.type.endsWith('Edge')) {
        return toGlobalId(
          model.type,
          this._getGlobalIdParam(model.outID) + '___' + this._getGlobalIdParam(model.inID));
      }

      return toGlobalId(model.type, this._getGlobalIdParam(model.id));

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'TypeHelper',
        function: 'getGlobalIdFromModel',
        model}, null, 2));
      throw ex;
    }
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
