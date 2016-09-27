/* @flow */
import invariant from 'invariant';
import Instrument from '../../src/utils/Instrument';
import DataMapper from '../../src/query-helpers/DataMapper';
import { fromGlobalId, toGlobalId } from 'graphql-relay';
import type { DataModel, Model, Value, DataModelAndType } from '../../src/flow/Types';

export default class TestDataMapper extends DataMapper {

  toDataModel(model: Model): DataModelAndType {
    return Instrument.func(this, () => {
      let { type, id } = fromGlobalId(model.id);
      let dataModel = { };
      for (let attrName in model) {
        if ({}.hasOwnProperty.call(model, attrName)) {
          dataModel[attrName] = this.toDataModelAttribute(type, attrName, model[attrName]);
        }
      }

      if (type.endsWith('Edge')) {
        let ids = id.split('---');
        if (dataModel.outID == null) {
          dataModel.outID = ids[0];
        }

        if (dataModel.inID == null) {
          dataModel.outID = ids[1];
        }

        delete dataModel.id;
        delete dataModel.node;
        delete dataModel.cursor;
      }
/*
      if (type === 'Contact') {
        dataModel.id = new Buffer(id, 'base64');
      }
*/
      return {
        type,
        dataModel,
      };
    });
  }

  toDataModelAttribute(type: string, attrName: string, attrValue: ?Value): ?Value {
    // All id's treated the same
    if (attrName === 'id' || attrName === 'outID' || attrName === 'inID') {
      invariant(typeof attrValue === 'string', 'Error');
      let { id } = fromGlobalId(attrValue);
      return new Buffer(id, 'base64');
    }

    // User specific conversions
    if (type === 'User' && (attrName === 'privateTagId' || attrName === 'tagId')) {
      invariant(typeof attrValue === 'string', 'Error');
      let { id } = fromGlobalId(attrValue);
      return new Buffer(id, 'base64');
    }

    return attrValue;
  }

  fromDataModel(type: string, dataModel: DataModel): Model {
    return Instrument.func(this, () => {
      let model = { id: '' };
      for (let attrName in dataModel) {
        if ({}.hasOwnProperty.call(dataModel, attrName)) {
          model[attrName] = this.fromDataModelAttribute(type, attrName, dataModel[attrName]);
        }
      }

      // If this is an edge where we have outID and inID then set the id
      if (model.id === '' && model.outID != null && model.inID != null) {
        model.id = toGlobalId(type, model.outID + '---' + model.inID);
      }
/*
      if (type === 'Contact') {
        debugger;
        invariant(typeof model.viewerId === 'string', '\'viewerId\' must be a string');
        invariant(typeof model.contactPhoneNumber === 'string',
          '\'contactPhoneNumber\' must be a string');
        model.id = toGlobalId(type, model.viewerId + '^' + model.contactPhoneNumber);
      }
*/
      invariant(typeof model.id === 'string' && model.id !== '', 'Error');
      return model;
    });
  }

  fromDataModelAttribute(type: string, attrName: string, attrValue: ?Value): ?Value {
    // All id's treated the same
    if (attrName === 'id') {
      invariant(attrValue instanceof Buffer, 'Error');
      return toGlobalId(type, attrValue.toString('base64'));
    }

    if (attrName === 'outID') {
      invariant(attrValue instanceof Buffer, 'Error');
      switch (type) {
        case 'UserContactEdge':
          return toGlobalId('User', attrValue.toString('base64'));
        default:
          invariant(false, 'Unsupported edge type');
      }
    }

    if (attrName === 'inID') {
      invariant(attrValue instanceof Buffer, 'Error');
      switch (type) {
        case 'UserContactEdge':
          // UserContactEdge.inID is ascii ??
          return toGlobalId('Contact', attrValue.toString('base64'));
        default:
          invariant(false, 'Unsupported edge type');
      }
    }

    // User specific conversions
    if (type === 'User' && (attrName === 'privateTagId' || attrName === 'tagId')) {
      invariant(attrValue instanceof Buffer, 'Error');
      return toGlobalId('Tag', attrValue.toString('base64'));
    }

    return attrValue;
  }
}
