/* @flow */
import invariant from 'invariant';
import { fromGlobalId } from 'graphql-relay';
import DataModelHelper from '../query-helpers/DataModelHelper';
import type { TypeAndKey, ToDataModelFunc } from '../flow/Types';

export default class GlobalIdHelper {

/*
  static toModel(gid: string): Model {
    invariant(typeof gid === 'string', 'Argument \'gid\' is not a string');

    let {type, id} = fromGlobalId(gid);
    invariant(type, 'Argument \'type\' is null');
    invariant(id, 'Argument \'id\' is null');

    if (type.endsWith('Edge')) {

      let index = id.indexOf('___');
      invariant(index >= 0, 'Invalid global id for Edge');
      return {
        id,
        outID: this._getValueFromGlobalIdParam(id.slice(0, index)),
        inID: this._getValueFromGlobalIdParam(id.slice(index + 3))
      };
    }

    return {
      id: this._getValueFromGlobalIdParam(id),
    };
  }
*/

  static toTypeAndAWSKey(id: string, convertor: ToDataModelFunc): TypeAndKey {
    invariant(typeof id === 'string', 'Argument \'id\' is not a string');

    let { type } = fromGlobalId(id);
    let dataModel = convertor(type, { id });
    let key = DataModelHelper.toAWSKey(type, dataModel, null);
    return { type, key };
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
