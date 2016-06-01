/* @flow */
import invariant from 'invariant';
import warning from 'warning';
import { fromGlobalId, toGlobalId } from 'graphql-relay';

export default class AWSConvertor {

  getTableName(type: string) {
    return type + 's';
  }

  getAWSItemFromModel(item: any) {
    try {
      invariant(item, 'Argument \'item\' is null');

      let awsItem = {};

      let keys: any = Object.keys(item);
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
          awsItem[key] = { N: attrValue };
        } else {
          invariant('Unsupported attribute value type');
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

  _getGlobalIdParam(value: any) {
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

  _getValueFromGlobalIdParam(param: string) {
    try {
      invariant(param, 'Argument \'param\' is null');

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

  getGlobalIdFromModel(model: any) {
    try {
      invariant(model, 'Argument \'model\' is null');

      if (model.type.endsWith('Edge')) {
        return toGlobalId(
          model.type,
          this._getGlobalIdParam(model.outID) + this._getGlobalIdParam(model.inID));
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

  getModelFromGlobalId(gid: string): any {
    try {
      invariant(gid, 'Argument \'gid\' is null');

      let {type, id} = fromGlobalId(gid);
      invariant(type, 'Argument \'type\' is null');
      invariant(id, 'Argument \'id\' is null');

      if (type.endsWith('Edge')) {
        return {
          type,
          outID: this._getValueFromGlobalIdParam(id.slice(0, 37)),
          inID: this._getValueFromGlobalIdParam(id.slice(37))
        };
      }

      return {
        type,
        id: this._getValueFromGlobalIdParam(id),
      };
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver', function: 'getModelFromGlobalId',
        gid}, null, 2));
      throw ex;
    }
  }

  getTypeAndAWSKeyFromGlobalId(id: string) {
    try {
      invariant(id, 'Argument \'id\' is null');

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

  getModelFromAWSItem(type: string, item: any): any {
    try {
      let model = { type };

      for (let name in item) {
        if ({}.hasOwnProperty.call(item, name)) {
          let attr = item[name];
          if (typeof attr.S !== 'undefined') {
            model[name] = item[name].S;
          } else if (typeof attr.N !== 'undefined') {
            model[name] = item[name].N;
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

  getAWSKeyFromModel(item: any, indexedByAttributeName: ?string) {
    try {
      invariant(item, 'Argument \'item\' is null');

      let key = {};
      if (item.type.endsWith('Edge')) {
        this.setAWSAttribute('outID', item.outID, key);
        this.setAWSAttribute('inID', item.inID, key);
      } else {
        this.setAWSAttribute('id', item.id, key);
      }

      if (typeof indexedByAttributeName !== 'undefined' && indexedByAttributeName !== null) {
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

  setAWSAttribute(name: string, value: any, awsItem: any) {
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
