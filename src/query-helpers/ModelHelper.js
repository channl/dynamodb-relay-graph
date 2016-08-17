/* @flow */
import { invariant } from '../Global';
import ValueHelper from '../query-helpers/ValueHelper';
import TypeHelper from '../query-helpers/TypeHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import { toGlobalId } from 'graphql-relay';
import type { BatchWriteItemRequest } from 'aws-sdk-promise';
import type { Model, Value, DRGEdge } from '../flow/Types';
import type { Connection, Edge } from 'graphql-relay';

export default class ModelHelper {

  static toBatchWriteItemRequest(itemsToPut: Model[],
    itemsToDelete: Model[]): BatchWriteItemRequest {

    let request = { RequestItems: {} };

    itemsToPut.forEach(item => {
      let tableName = TypeHelper.getTableName(item.type);
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = [];
      }

      let tableReq = request.RequestItems[tableName];
      let newItem = {
        PutRequest: {
          Item: ModelHelper.toAWSItem(item)
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
          Key: ModelHelper.toAWSKey(item, null)
        }
      };
      tableReq.push(newItem);
    });

    return request;
  }

  static toConnection(items: Model[], hasPreviousPage: boolean, hasNextPage: boolean,
    order: ?string): Connection {
    let edges = items.filter(n => n !== null).map(node => {
      return {
        cursor: ModelHelper.toCursor(node, order),
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

  static toPartialEdgeConnection(items: DRGEdge[], hasPreviousPage: boolean, hasNextPage: boolean,
    order: ?string): Connection<DRGEdge> {
    let edges = items.filter(n => n !== null).map(n => {
      let node: DRGEdge = {
        type: n.type,
        outID: n.outID,
        inID: n.inID,
      };
      let cursor = ModelHelper.toCursor(node, order);
      let partialEdge: Edge<DRGEdge> = {
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

  static toAWSKey(item: Model, indexedByAttributeName: ?string) {
    invariant(item, 'Argument \'item\' is null');

    let key = {};
    if (item.type.endsWith('Edge')) {
      key.outID = ValueHelper.toAttributeValue(item.outID);
      key.inID = ValueHelper.toAttributeValue(item.inID);
    } else {
      key.id = ValueHelper.toAttributeValue(item.id);
    }

    if (indexedByAttributeName != null) {
      key[indexedByAttributeName] = ValueHelper.toAttributeValue(item[indexedByAttributeName]);
    }

    return key;
  }

  static toAWSItem(item: Model) {
    invariant(item, 'Argument \'item\' is null');

    let awsItem = {};
    Object.keys(item)
      .filter(key => key !== 'type')
      .forEach(key => { awsItem[key] = ValueHelper.toAttributeValue(item[key]); } );

    return awsItem;
  }

  static toGlobalId(model: Model): string {
    invariant(model, 'Argument \'model\' is null');

    if (model.type.endsWith('Edge')) {
      return toGlobalId(
        model.type,
        this._getGlobalIdParam(model.outID) + '___' + this._getGlobalIdParam(model.inID));
    }

    return toGlobalId(model.type, this._getGlobalIdParam(model.id));
  }

  static toCursor(item: Model, order: ?string): string {
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
