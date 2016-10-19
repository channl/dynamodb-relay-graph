/* @flow */
import invariant from 'invariant';
import uuid from 'node-uuid';
import { toGlobalId } from 'graphql-relay';
import type { DataModel, ExprModel } from '../flow/Types';

export default class DataMapper {

  isEdge(type: string): boolean {
    return type.endsWith('Edge');
  }

  id(type: string, base64BufferModel?: string | Buffer | Object): string {
    invariant(typeof type === 'string', 'Argument \'type\' was not a string');

    let isEdge = this.isEdge(type);
    invariant(!(typeof base64BufferModel === 'undefined' && isEdge),
      'Can not create an edge id without model data');

    if (typeof base64BufferModel === 'undefined' && !isEdge) {
      // Nothing was specified, create a new id
      return toGlobalId(type, (new Buffer(uuid.parse(uuid.v4()))).toString('base64'));
    }

    if (typeof base64BufferModel === 'string') {
      // A base64 string was supplied, useful when looking at AWS dynamodb console UI
      return toGlobalId(type, base64BufferModel);
    }

    if (base64BufferModel instanceof Buffer) {
      // A buffer was supplied
      return toGlobalId(type, base64BufferModel.toString('base64'));
    }

    invariant(base64BufferModel != null, 'Invalid arguments');
    if (isEdge && typeof base64BufferModel.outID === 'string' &&
      typeof base64BufferModel.inID === 'string') {
      return toGlobalId(type, base64BufferModel.outID + '---' + base64BufferModel.inID);
    }

    invariant(false, 'Invalid arguments');
  }

  toDataModel(type: string, model: ExprModel): DataModel {
    return model;
  }

  fromDataModel(type: string, dataModel: DataModel): ExprModel {
    return dataModel;
  }
}
