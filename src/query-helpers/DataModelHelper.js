/* @flow */
import invariant from 'invariant';
import TypeHelper from '../query-helpers/TypeHelper';
import ValueHelper from '../query-helpers/ValueHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import Instrument from '../logging/Instrument';
import DataMapper from '../query-helpers/DataMapper';
import type { Connection, Edge } from 'graphql-relay';
import type { AttributeMap, BatchWriteItemRequest } from 'aws-sdk-promise';
import type { TypedDataModel, DataModel, Model, Value } from '../flow/Types';

export default class DataModelHelper {

  static toConnection(dataMapper: DataMapper, items: TypedDataModel[],
    hasPreviousPage: boolean, hasNextPage: boolean, order: ?string): Connection<Model> {
    let edges = items
      .map(item => {
        let node = dataMapper.fromDataModel(item.type, item.dataModel);
        return {
          cursor: DataModelHelper.toCursor(item, order),
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

  static toPartialEdgeConnection(dataMapper: DataMapper, items: TypedDataModel[],
    hasPreviousPage: boolean, hasNextPage: boolean, order: ?string): Connection<Model> {
    let edges = items
      .map(item => {
        let node = dataMapper.fromDataModel(item.type, item.dataModel);
        let cursor = DataModelHelper.toCursor(item, order);
        let partialEdge: Edge<Model> = {
          node,
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

  static toBatchWriteItemRequest(itemsToPut: TypedDataModel[],
    itemsToDelete: TypedDataModel[]): BatchWriteItemRequest {

    let request = { RequestItems: {} };

    itemsToPut.forEach(item => {
      let tableName = TypeHelper.getTableName(item.type);
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = [];
      }

      let tableReq = request.RequestItems[tableName];
      let newItem = {
        PutRequest: {
          Item: DataModelHelper.toAWSItem(item.dataModel)
        }
      };
      tableReq.push(newItem);
    });

    itemsToDelete.forEach(item => {
      let tableName = TypeHelper.getTableName(item.type);
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = [];
      }

      let tableReq = request.RequestItems[tableName];
      let newItem = {
        DeleteRequest: {
          Key: DataModelHelper.toAWSKey(item, null)
        }
      };
      tableReq.push(newItem);
    });

    return request;
  }

  static toAWSKey(item: TypedDataModel, indexedByAttributeName: ?string): AttributeMap {
    return Instrument.func(this, () => {
      invariant(item != null, 'Argument \'item\' is null or undefined');

      let key = {};
      if (item.type.endsWith('Edge')) {
        key.outID = ValueHelper.toAttributeValue(item.dataModel.outID);
        key.inID = ValueHelper.toAttributeValue(item.dataModel.inID);
      } else {
        key.id = ValueHelper.toAttributeValue(item.dataModel.id);
      }

      if (indexedByAttributeName != null && item.dataModel[indexedByAttributeName] != null) {
        key[indexedByAttributeName] =
          ValueHelper.toAttributeValue(item.dataModel[indexedByAttributeName]);
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

  static toCursor(item: TypedDataModel, order: ?string): string {
    invariant(item, 'Argument \'item\' is null');
    let key = this.toAWSKey(item, order);
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
