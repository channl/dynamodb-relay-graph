/* @flow */
import { warning, invariant } from '../Global';
import type { Value, Model } from '../flow/Types';
import type { AttributeMap } from 'aws-sdk-promise';

export default class AWSKeyHelper {

  static fromModel(item: Model, indexedByAttributeName: ?string) {
    try {
      invariant(item, 'Argument \'item\' is null');

      let key = {};
      if (item.type.endsWith('Edge')) {
        this._setAWSAttribute('outID', item.outID, key);
        this._setAWSAttribute('inID', item.inID, key);
      } else {
        this._setAWSAttribute('id', item.id, key);
      }

      if (indexedByAttributeName != null) {
        this._setAWSAttribute(indexedByAttributeName, item[indexedByAttributeName], key);
      }

      return key;

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'TypeHelper',
        function: 'getAWSKeyFromModel',
        item, indexedByAttributeName}, null, 2));
      throw ex;
    }
  }

  static _setAWSAttribute(name: string, value: Value, awsItem: AttributeMap) {
    invariant(typeof name === 'string', 'Argument \'name\' is not a string');
    invariant(value, 'Argument \'value\' is null');
    invariant(awsItem, 'Argument \'awsItem\' is null');

    if (value instanceof Buffer) {
      awsItem[name] = { B: value};
      return;
    }

    if (typeof value === 'string') {
      awsItem[name] = { S: value};
      return;
    }

    if (typeof value === 'number') {
      awsItem[name] = { N: value.toString()};
      return;
    }

    invariant(false, 'Attribute type not supported');
  }
}
