/* @flow */
import invariant from 'invariant';
import TypeHelper from '../query-helpers/TypeHelper';
import { fromGlobalId } from 'graphql-relay';
import ValueHelper from '../query-helpers/ValueHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import Instrument from '../utils/Instrument';
import DataMapper from '../query-helpers/DataMapper';
import type { Connection, Edge } from 'graphql-relay';
import type { AttributeMap, BatchWriteItemRequest } from 'aws-sdk-promise';
import type { DataModel, Model, Value } from '../flow/Types';

export default class DataModelHelper {

  static toConnection(dataMapper: DataMapper, type: string, dataModels: DataModel[],
    hasPreviousPage: boolean, hasNextPage: boolean, order: ?string): Connection<Model> {
    let edges = dataModels.map(dataModel => {
      let node = dataMapper.fromDataModel(type, dataModel);
      return {
        cursor: DataModelHelper.toCursor(type, dataModel, order),
        node
      };
    });

    let pageInfo = {
      startCursor: edges[0] ? edges[0].cursor : null,
      endCursor: edges[edges.length - 1] ? edges[edges.length - 1].cursor : null,
      hasPreviousPage,
      hasNextPage,
    };

    return { edges, pageInfo };
  }

  static toPartialEdgeConnection(dataMapper: DataMapper, items: Model[],
    hasPreviousPage: boolean, hasNextPage: boolean, order: ?string): Connection<Model> {
    let edges = items
      .filter(item => item !== null)
      .map(item => {
        let { type, dataModel } = dataMapper.toDataModel(item);
        let cursor = DataModelHelper.toCursor(type, dataModel, order);
        let partialEdge: Edge<Model> = {
          node: item,
          cursor,
        };
        return partialEdge;
      });

    let pageInfo = {
      startCursor: edges[0] ? edges[0].cursor : null,
      endCursor: edges[edges.length - 1] ? edges[edges.length - 1].cursor : null,
      hasPreviousPage,
      hasNextPage,
    };

    return { edges, pageInfo };
  }

  static toBatchWriteItemRequest(itemsToPut: DataModel[],
    itemsToDelete: DataModel[]): BatchWriteItemRequest {

    let request = { RequestItems: {} };

    itemsToPut.forEach(item => {
      let { type } = fromGlobalId(item.id);
      let tableName = TypeHelper.getTableName(type);
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = [];
      }

      let tableReq = request.RequestItems[tableName];
      let newItem = {
        PutRequest: {
          Item: DataModelHelper.toAWSItem(item)
        }
      };
      tableReq.push(newItem);
    });

    itemsToDelete.forEach(item => {
      let { type } = fromGlobalId(item.id);
      let tableName = TypeHelper.getTableName(type);
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = [];
      }

      let tableReq = request.RequestItems[tableName];
      let newItem = {
        DeleteRequest: {
          Key: DataModelHelper.toAWSKey(type, item, null)
        }
      };
      tableReq.push(newItem);
    });

    return request;
  }

  static toAWSKey(type: string, item: DataModel, indexedByAttributeName: ?string): AttributeMap {
    return Instrument.func(this, () => {
      invariant(typeof type === 'string', 'Argument \'type\' must be a string');
      invariant(item != null, 'Argument \'item\' is null or undefined');

      let key = {};
      if (type.endsWith('Edge')) {
        key.outID = ValueHelper.toAttributeValue(item.outID);
        key.inID = ValueHelper.toAttributeValue(item.inID);
      } else {
        key.id = ValueHelper.toAttributeValue(item.id);
      }

      if (indexedByAttributeName != null && item[indexedByAttributeName] != null) {
        key[indexedByAttributeName] = ValueHelper.toAttributeValue(item[indexedByAttributeName]);
      }

      return key;
    });
  }

  static toAWSItem(item: DataModel) {
    invariant(item, 'Argument \'item\' is null');

    let awsItem = {};
    Object
      .keys(item)
      .forEach(key => {
        let itemValue = item[key];
        invariant(itemValue != null, 'ItemValue cannot be null');
        awsItem[key] = ValueHelper.toAttributeValue(itemValue);
      } );

    return awsItem;
  }

  static toCursor(type: string, item: DataModel, order: ?string): string {
    invariant(item, 'Argument \'item\' is null');

    let key = this.toAWSKey(type, item, order);
    return AttributeMapHelper.toCursor(key);
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
