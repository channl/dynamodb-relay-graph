/* @flow */
import { invariant } from '../Global';
import { fromGlobalId } from 'graphql-relay';
import ModelHelper from '../query-helpers/ModelHelper';
import type { TypeAndKey, Model } from '../flow/Types';

export default class GlobalIdHelper {

  static toModel(gid: string): Model {
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
  }

  static toTypeAndAWSKey(id: string): TypeAndKey {
    invariant(typeof id === 'string', 'Argument \'id\' is not a string');

    let model = this.toModel(id);
    let key = ModelHelper.toAWSKey(model, null);
    return {
      type: model.type,
      key
    };
  }


  static _getValueFromGlobalIdParam(param: string) {
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
  }
}
