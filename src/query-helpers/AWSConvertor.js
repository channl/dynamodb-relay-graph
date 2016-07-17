/* @flow */
import { warning, invariant } from '../Global';
import { fromGlobalId, toGlobalId } from 'graphql-relay';
import type { TypeAndKey, Model } from '../flow/Types';
import type { AttributeMap } from 'aws-sdk-promise';

export default class AWSConvertor {

  static fromCursor(cursor: string) {
    invariant(typeof cursor === 'string', 'Argument \'cursor\' is not a string');

    let b = new Buffer(cursor, 'base64');
    let json = b.toString('ascii');
    let item: Object = JSON.parse(json);

    // Create real buffer objects from the JSON
    // B.data versus B seems to be due to differences in Buffer implementation
    Object
      .keys(item)
      .map(name => item[name])
      .filter(a => typeof a.B !== 'undefined')
      .forEach(a => {
        a.B = typeof a.B.data !== 'undefined' ?
          new Buffer(a.B.data) :
          new Buffer(a.B);
      });

    return item;
  }

  static toCursor(item: Model, order: ?string) {
    invariant(item, 'Argument \'item\' is null');

    let key = this.getAWSKeyFromModel(item, order);
    let cursorData = JSON.stringify(key);
    let b = new Buffer(cursorData);
    return b.toString('base64');
  }

  static getTypeName(tableName: string) {
    invariant(typeof tableName === 'string', 'Argument \'tableName\' is not a string');
    return tableName.substr(0, tableName.length - 1);
  }

  static getTableName(type: string) {
    invariant(typeof type === 'string', 'Argument \'type\' is not a string');
    return type + 's';
  }

  static getAWSItemFromModel(item: Model) {
    try {
      invariant(item, 'Argument \'item\' is null');

      let awsItem = {};

      let keys: string[] = Object.keys(item);
      for (let key of keys) {
        if (key === 'type') {
          // Skip over type because it's not stored in aws
          continue;
        }

        let attrValue = item[key];
        if (attrValue instanceof Buffer) {
          awsItem[key] = { B: attrValue };
        } else if (typeof attrValue === 'string') {
          awsItem[key] = { S: attrValue };
        } else if (typeof attrValue === 'number') {
          awsItem[key] = { N: attrValue.toString() };
        } else {
          invariant('Attribute ' + key + ' type is not supported');
        }
      }

      return awsItem;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'AWSConvertor',
        function: 'getAWSItemFromModel',
        item}, null, 2));
      throw ex;
    }
  }

  static getGlobalIdFromModel(model: Model): string {
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
        class: 'AWSConvertor',
        function: 'getGlobalIdFromModel',
        model}, null, 2));
      throw ex;
    }
  }

  static getModelFromGlobalId(gid: string): Model {
    try {
      invariant(typeof gid === 'string', 'Argument \'gid\' is not a string');

      let {type, id} = fromGlobalId(gid);
      invariant(type, 'Argument \'type\' is null');
      invariant(id, 'Argument \'id\' is null');

      if (type.endsWith('Edge')) {

        let index = id.indexOf('___');
        invariant(index >= 0, 'Invalid global id for Edge');
        return {
          type,
          outID: this._getValueFromGlobalIdParam(id.slice(0, index)),
          inID: this._getValueFromGlobalIdParam(id.slice(index + 3))
        };
      }

      return {
        type,
        id: this._getValueFromGlobalIdParam(id),
      };
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'AWSConvertor', function: 'getModelFromGlobalId',
        gid}, null, 2));
      throw ex;
    }
  }

  static getTypeAndAWSKeyFromGlobalId(id: string): TypeAndKey {
    try {
      invariant(typeof id === 'string', 'Argument \'id\' is not a string');

      let model = this.getModelFromGlobalId(id);
      let key = this.getAWSKeyFromModel(model, null);
      return {
        type: model.type,
        key
      };

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'AWSConvertor',
        function: 'getTypeAndAWSKeyFromGlobalId',
        id}, null, 2));
      throw ex;
    }
  }

  static getModelFromAWSItem(type: string, item: AttributeMap): Model {
    try {
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
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'AWSConvertor',
        function: 'getModelFromAWSItem',
        type, item
      }));
      throw ex;
    }
  }

  static getAWSKeyFromModel(item: Model, indexedByAttributeName: ?string) {
    try {
      invariant(item, 'Argument \'item\' is null');

      let key = {};
      if (item.type.endsWith('Edge')) {
        this.setAWSAttribute('outID', item.outID, key);
        this.setAWSAttribute('inID', item.inID, key);
      } else {
        this.setAWSAttribute('id', item.id, key);
      }

      if (indexedByAttributeName != null) {
        this.setAWSAttribute(indexedByAttributeName, item[indexedByAttributeName], key);
      }

      return key;

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'AWSConvertor',
        function: 'getAWSKeyFromModel',
        item, indexedByAttributeName}, null, 2));
      throw ex;
    }
  }

  static setAWSAttribute(name: string,
    value: Buffer | number | string | boolean, awsItem: AttributeMap) {
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

  static _getGlobalIdParam(value: Buffer | string | number | boolean) {
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

  static _getValueFromGlobalIdParam(param: string) {
    try {
      invariant(typeof param === 'string', 'Argument \'param\' is not a string');

      if (param.startsWith('B')) {
        return new Buffer(param.slice(1), 'base64');
      }

      if (param.startsWith('S')) {
        return param.slice(1);
      }

      if (param.startsWith('N')) {
        return parseInt(param.slice(1), 10);
      }

      invariant(false, 'Attribute type not supported');
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'AWSConvertor',
        function: '_getValueFromGlobalIdParam',
        param}, null, 2));
      throw ex;
    }
  }
}
