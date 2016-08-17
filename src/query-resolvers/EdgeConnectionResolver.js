/* @flow */
import EntityResolver from '../query-resolvers/EntityResolver';
import QueryHelper from '../query-helpers/QueryHelper';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import ExpressionHelper from '../query-helpers/ExpressionHelper';
import TypeHelper from '../query-helpers/TypeHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import ModelHelper from '../query-helpers/ModelHelper';
import DynamoDB from '../aws/DynamoDB';
import Instrument from '../utils/Instrument';
import { invariant } from '../Global';
import type { ConnectionArgs, QueryExpression, DRGEdge } from '../flow/Types';
import type { Connection, Edge } from 'graphql-relay';
import type { DynamoDBSchema, ScanQueryResponse } from 'aws-sdk-promise';

export default class EdgeConnectionResolver {
  _dynamoDB: DynamoDB;
  _schema: DynamoDBSchema;
  _entityResolver: EntityResolver;

  constructor(dynamoDB: DynamoDB, schema: DynamoDBSchema, entityResolver: EntityResolver) {
    this._dynamoDB = dynamoDB;
    this._schema = schema;
    this._entityResolver = entityResolver;
  }

  async resolveAsync(query: EdgeConnectionQuery,
    innerResult: Connection): Promise<Connection<DRGEdge>> {
    return await Instrument.funcAsync(this, async () => {
      invariant(query, 'Argument \'query\' is null');
      invariant(innerResult, 'Argument \'innerResult\' is null');

      let expression = QueryHelper.getEdgeExpression(innerResult, query);
      if (ExpressionHelper.isEdgeModelExpression(expression)) {
        let item = await this._entityResolver.getAsync(ExpressionHelper.toGlobalId(expression));
        return ModelHelper.toPartialEdgeConnection([ item ], false, false, null);
      }

      let request = this._getQueryRequest(expression, query.connectionArgs, query.isOut);
      let response = await this._dynamoDB.queryAsync(request);
      return this._getResponseAsConnection(query, response);
    });
  }

  _getQueryRequest(expression: QueryExpression, connectionArgs: ConnectionArgs) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    invariant(typeof expression.type === 'string', 'Type must be string');

    return {
      TableName: TypeHelper.getTableName(expression.type),
      IndexName: QueryHelper.getIndexName(expression, connectionArgs, this._schema),
      ExclusiveStartKey: QueryHelper.getExclusiveStartKey(connectionArgs),
      Limit: QueryHelper.getLimit(connectionArgs),
      ScanIndexForward: QueryHelper.getScanIndexForward(connectionArgs),
      ProjectionExpression: QueryHelper.getProjectionExpression(expression, connectionArgs,
        [ 'inID', 'outID', 'createDate' ]),
      KeyConditionExpression: QueryHelper.getKeyConditionExpression(expression),
      ExpressionAttributeValues: QueryHelper.getExpressionAttributeValues(expression, this._schema),
      ExpressionAttributeNames: QueryHelper.getExpressionAttributeNames(expression, connectionArgs,
        [ 'inID', 'outID', 'createDate' ])
    };
  }

  _getResponseAsConnection(query: EdgeConnectionQuery,
    response: ScanQueryResponse): Connection<DRGEdge> {
    invariant(query, 'Argument \'query\' is null');
    invariant(response, 'Argument \'response\' is null');

    let edges = response.Items.map(item => {
      let edge = AttributeMapHelper.toModel(query.expression.type, item);
      let cursor = ModelHelper.toCursor(edge, query.connectionArgs.order);
      let node: DRGEdge = {
        type: query.expression.type,
        inID: edge.inID,
        outID: edge.outID,
      };
      let partialEdge: Edge<DRGEdge> = {
        node,
        cursor,
      };
      return partialEdge;
    });

    if (QueryHelper.isForwardScan(query.connectionArgs)) {
      let pageInfo = {
        startCursor: edges[0] ? edges[0].cursor : null,
        endCursor: edges[edges.length - 1] ? edges[edges.length - 1].cursor : null,
        hasNextPage: typeof response.LastEvaluatedKey !== 'undefined',
        hasPreviousPage: false
      };
      return { edges, pageInfo };
    }

    let pageInfo = {
      startCursor: edges[0] ? edges[0].cursor : null,
      endCursor: edges[edges.length - 1] ? edges[edges.length - 1].cursor : null,
      hasNextPage: false,
      hasPreviousPage: typeof response.LastEvaluatedKey !== 'undefined'
    };

    return {
      edges: edges.reverse(),
      pageInfo
    };
  }
}
