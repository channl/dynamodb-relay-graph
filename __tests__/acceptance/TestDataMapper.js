/* @flow */
import invariant from 'invariant';
import Instrument from '../../src/utils/Instrument';
import DataMapper from '../../src/query-helpers/DataMapper';
import { fromGlobalId, toGlobalId } from 'graphql-relay';
import type { DataModel, ExprModel } from '../../src/flow/Types';

export default class TestDataMapper extends DataMapper {

  toDataModel(type: string, model: ExprModel): DataModel {
    return Instrument.func(this, () => {
      let dataModel = { };
      for (let attrName in model) {
        if ({}.hasOwnProperty.call(model, attrName)) {
          this._toDataModelAttribute(type, attrName, model, dataModel);
        }
      }

      if (type.endsWith('Edge')) {
        delete dataModel.id;
        delete dataModel.node;
        delete dataModel.cursor;
      }

      return dataModel;
    });
  }

  _toDataModelAttribute(type: string, attrName: string, model: ExprModel,
    dataModel: DataModel): void {

    if (attrName === 'id' && type.endsWith('Edge')) {
      let { id } = fromGlobalId(model[attrName]);
      let ids = id.split('---');
      if (dataModel.outID == null) {
        dataModel.outID = ids[0];
      }
      if (dataModel.inID == null) {
        dataModel.outID = ids[1];
      }
      return;
    }

    // All id's treated the same
    if (attrName === 'id' || attrName === 'outID' || attrName === 'inID') {
      invariant(typeof model[attrName] === 'string', 'Error');
      let { id } = fromGlobalId(model[attrName]);
      dataModel[attrName] = new Buffer(id, 'base64');
      return;
    }

    // User specific conversions
    if (type === 'User' && (attrName === 'privateTagId' || attrName === 'tagId')) {
      invariant(typeof model[attrName] === 'string', 'Error');
      let { id } = fromGlobalId(model[attrName]);
      dataModel[attrName] = new Buffer(id, 'base64');
      return;
    }

    dataModel[attrName] = model[attrName];
  }

  fromDataModel(type: string, dataModel: DataModel): ExprModel {
    return Instrument.func(this, () => {
      let model = { };
      for (let attrName in dataModel) {
        if ({}.hasOwnProperty.call(dataModel, attrName)) {
          this._fromDataModelAttribute(type, attrName, dataModel, model);
        }
      }

      // If this is an edge where we have outID and inID then set the id
      if (model.id == null && model.outID != null && model.inID != null) {
        model.id = toGlobalId(type, model.outID + '---' + model.inID);
      }

      invariant(typeof model.id === 'string' && model.id !== '', 'Model.id type was not a string');
      return model;
    });
  }

  _fromDataModelAttribute(type: string, attrName: string, dataModel: DataModel,
    model: ExprModel): void {

    // All id's treated the same
    if (attrName === 'id') {
      invariant(dataModel[attrName] instanceof Buffer, 'Error');
      model[attrName] = toGlobalId(type, dataModel[attrName].toString('base64'));
      return;
    }

    if (attrName === 'outID') {
      invariant(dataModel[attrName] instanceof Buffer, 'Error');
      switch (type) {
        case 'UserContactEdge':
          model[attrName] = toGlobalId('User', dataModel[attrName].toString('base64'));
          return;
        default:
          invariant(false, 'Unsupported edge type');
      }
    }

    if (attrName === 'inID') {
      invariant(dataModel[attrName] instanceof Buffer, 'Error');
      switch (type) {
        case 'UserContactEdge':
          // UserContactEdge.inID is ascii ??
          model[attrName] = toGlobalId('Contact', dataModel[attrName].toString('base64'));
          return;
        default:
          invariant(false, 'Unsupported edge type');
      }
    }

    // User specific conversions
    if (type === 'User' && (attrName === 'privateTagId' || attrName === 'tagId')) {
      invariant(dataModel[attrName] instanceof Buffer, 'Error');
      model[attrName] = toGlobalId('Tag', dataModel[attrName].toString('base64'));
      return;
    }

    model[attrName] = dataModel[attrName];
  }
}
