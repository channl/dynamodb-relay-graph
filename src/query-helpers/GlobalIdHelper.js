/* @flow */
import { warning, invariant } from '../Global';
import { fromGlobalId } from 'graphql-relay';
import AWSKeyHelper from '../query-helpers/AWSKeyHelper';
import type { TypeAndKey, Model } from '../flow/Types';

export default class GlobalIdHelper {

  static toModel(gid: string): Model {
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
        class: 'TypeHelper', function: 'getModelFromGlobalId',
        gid}, null, 2));
      throw ex;
    }
  }

  static toTypeAndAWSKey(id: string): TypeAndKey {
    try {
      invariant(typeof id === 'string', 'Argument \'id\' is not a string');

      let model = this.toModel(id);
      let key = AWSKeyHelper.fromModel(model, null);
      return {
        type: model.type,
        key
      };

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'TypeHelper',
        function: 'getTypeAndAWSKeyFromGlobalId',
        id}, null, 2));
      throw ex;
    }
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
        class: 'TypeHelper',
        function: '_getValueFromGlobalIdParam',
        param}, null, 2));
      throw ex;
    }
  }
}
