/* @flow */
import EntityResolver from '../query-resolvers/EntityResolver';
import QueryHelper from '../query-helpers/QueryHelper';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
// import ExpressionHelper from '../query-helpers/ExpressionHelper';
import TypeHelper from '../query-helpers/TypeHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import ModelHelper from '../query-helpers/ModelHelper';
import DynamoDB from '../aws/DynamoDB';
import Instrument from '../utils/Instrument';
import { invariant } from '../Global';
import type { Connection, Edge } from 'graphql-relay';
import type { DynamoDBSchema, ScanQueryResponse } from 'aws-sdk-promise';
// eslint-disable-next-line no-unused-vars
import type { ConnectionArgs, QueryExpression, Model } from '../flow/Types';

export default class EdgeConnectionResolver {
  _dynamoDB: DynamoDB;
  _schema: DynamoDBSchema;
  _entityResolver: EntityResolver;

  constructor(dynamoDB: DynamoDB, schema: DynamoDBSchema, entityResolver: EntityResolver) {
    this._dynamoDB = dynamoDB;
    this._schema = schema;
    this._entityResolver = entityResolver;
  }

  async resolveAsync<T: Model>(query: EdgeConnectionQuery,
    innerResult: Connection<Model>): Promise<Connection<T>> {
    return await Instrument.funcAsync(this, async (): Promise<Connection<T>> => {
      invariant(query, 'Argument \'query\' is null');
      invariant(innerResult, 'Argument \'innerResult\' is null');

      let expression = QueryHelper.getEdgeExpression(innerResult, query);
      if (typeof expression.id === 'string') {
        let item: T = await this._entityResolver.getAsync(expression.id);
        let conn: Connection<T> = ModelHelper
          .toPartialEdgeConnection([ item ], false, false, null);
        return conn;
      }

      let request = this._getQueryRequest(query.type, expression,
        query.connectionArgs, query.isOut);
      let response = await this._dynamoDB.queryAsync(request);
      let conn: Connection<T> = this._getResponseAsConnection(query, response);
      return conn;
    });
  }

  _getQueryRequest(type: string, expression: QueryExpression, connectionArgs: ConnectionArgs) {
    invariant(typeof type === 'string', 'Type must be string');
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    return {
      TableName: TypeHelper.getTableName(type),
      IndexName: QueryHelper.getIndexName(type, expression, connectionArgs, this._schema),
      ExclusiveStartKey: QueryHelper.getExclusiveStartKey(connectionArgs),
      Limit: QueryHelper.getLimit(connectionArgs),
      ScanIndexForward: QueryHelper.getScanIndexForward(connectionArgs),
      ProjectionExpression: QueryHelper.getProjectionExpression(expression, connectionArgs,
        [ 'inID', 'outID', 'createDate' ]),
      KeyConditionExpression: QueryHelper.getKeyConditionExpression(expression),
      ExpressionAttributeValues: QueryHelper.getExpressionAttributeValues(type,
        expression, this._schema),
      ExpressionAttributeNames: QueryHelper.getExpressionAttributeNames(expression, connectionArgs,
        [ 'inID', 'outID', 'createDate' ])
    };
  }

  _getResponseAsConnection<T: Model>(query: EdgeConnectionQuery,
    response: ScanQueryResponse): Connection<T> {
    invariant(query, 'Argument \'query\' is null');
    invariant(response, 'Argument \'response\' is null');

    let edges = response.Items.map(item => {
      // $FlowIgnore
      let model: T = AttributeMapHelper.toModel(query.type, item);
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
