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
import type { Connection, Edge } from 'graphql-relay';
import type { DynamoDBSchema, ScanQueryResponse } from 'aws-sdk-promise';
// eslint-disable-next-line no-unused-vars
import type { ConnectionArgs, QueryExpression, EdgeModel, Model } from '../flow/Types';

export default class EdgeConnectionResolver {
  _dynamoDB: DynamoDB;
  _schema: DynamoDBSchema;
  _entityResolver: EntityResolver;

  constructor(dynamoDB: DynamoDB, schema: DynamoDBSchema, entityResolver: EntityResolver) {
    this._dynamoDB = dynamoDB;
    this._schema = schema;
    this._entityResolver = entityResolver;
  }

  async resolveAsync<T: EdgeModel>(query: EdgeConnectionQuery,
    innerResult: Connection<Model>): Promise<Connection<T>> {
    return await Instrument.funcAsync(this, async (): Promise<Connection<T>> => {
      invariant(query, 'Argument \'query\' is null');
      invariant(innerResult, 'Argument \'innerResult\' is null');

      let expression = QueryHelper.getEdgeExpression(innerResult, query);
      if (ExpressionHelper.isEdgeModelExpression(expression)) {
        let item: T = await this._entityResolver.getAsync(ExpressionHelper.toGlobalId(expression));
        let conn: Connection<T> = ModelHelper
          .toPartialEdgeConnection([ item ], false, false, null);
        return conn;
      }

      let request = this._getQueryRequest(expression, query.connectionArgs, query.isOut);
      let response = await this._dynamoDB.queryAsync(request);
      let conn: Connection<T> = this._getResponseAsConnection(query, response);
      return conn;
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

  _getResponseAsConnection<T: EdgeModel>(query: EdgeConnectionQuery,
    response: ScanQueryResponse): Connection<T> {
    invariant(query, 'Argument \'query\' is null');
    invariant(response, 'Argument \'response\' is null');

    let edges = response.Items.map(item => {
      let model: T = AttributeMapHelper.toModel(query.expression.type, item);
      let cursor = ModelHelper.toCursor(model, query.connectionArgs.order);
      let partialEdge: Edge<T> = {
        node: model,
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
