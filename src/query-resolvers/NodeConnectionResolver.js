/* @flow */
import EntityResolver from '../query-resolvers/EntityResolver';
import QueryHelper from '../query-helpers/QueryHelper';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
// import ExpressionHelper from '../query-helpers/ExpressionHelper';
import TypeHelper from '../query-helpers/TypeHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import ModelHelper from '../query-helpers/ModelHelper';
import DynamoDB from '../aws/DynamoDB';
import Instrument from '../utils/Instrument';
import { invariant } from '../Global';
// eslint-disable-next-line no-unused-vars
import type { ConnectionArgs, QueryExpression, Model } from '../flow/Types';
import type { Connection } from 'graphql-relay';
import type { DynamoDBSchema, ScanQueryResponse } from 'aws-sdk-promise';

export default class NodeConnectionResolver {
  _dynamoDB: DynamoDB;
  _schema: DynamoDBSchema;
  _entityResolver: EntityResolver;

  constructor(dynamoDB: DynamoDB, schema: DynamoDBSchema, entityResolver: EntityResolver) {
    this._dynamoDB = dynamoDB;
    this._schema = schema;
    this._entityResolver = entityResolver;
  }

  async resolveAsync(query: NodeConnectionQuery): Promise<Connection<Model>> {
    return await Instrument.funcAsync(this, async () => {
      invariant(query != null, 'Argument \'query\' is null');

      // Generate the full expression using the query and any previous result
      let expression = QueryHelper.getExpression(query);

      // Specific GlobalId query
      if (typeof expression.id === 'string') {
        let node = await this._entityResolver.getAsync(expression.id);
        return ModelHelper.toConnection([ node ], false, false, null);
      }

      // Type only query
      if (expression == null || expression.length === 0) {
        let request = this._getScanRequest(query.type, expression, query.connectionArgs);
        let response = await this._dynamoDB.scanAsync(request);
        invariant(typeof query.type === 'string', 'Type must be string');
        return await this._getResponseAsConnectionAsync(query, response);
      }

      // Complex query
      let request = this._getQueryRequest(query.type, expression, query.connectionArgs);
      let response = await this._dynamoDB.queryAsync(request);
      invariant(typeof query.type === 'string', 'Type must be string');
      return await this._getResponseAsConnectionAsync(query, response);
    });
  }

  _getScanRequest(type: string, expression: QueryExpression, connectionArgs: ConnectionArgs) {
    invariant(typeof type === 'string', 'Type must be string');
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    return {
      TableName: TypeHelper.getTableName(type),
      ExclusiveStartKey: QueryHelper.getExclusiveStartKey(connectionArgs),
      Limit: QueryHelper.getLimit(connectionArgs),
      ProjectionExpression: QueryHelper.getProjectionExpression(expression, connectionArgs,
        [ 'id' ]),
      ExpressionAttributeNames: QueryHelper.getExpressionAttributeNames(expression,
        connectionArgs, [ 'id' ])
    };
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
        [ 'id' ]),
      KeyConditionExpression: QueryHelper.getKeyConditionExpression(expression),
      ExpressionAttributeValues: QueryHelper.getExpressionAttributeValues(type, expression,
        this._schema),
      ExpressionAttributeNames: QueryHelper.getExpressionAttributeNames(expression,
        connectionArgs, [ 'id' ])
    };
  }

  // eslint-disable-next-line no-unused-vars
  async _getResponseAsConnectionAsync(query: NodeConnectionQuery,
    response: ScanQueryResponse): Promise<Connection<Model>> {
    let nodeIds = response.Items.map(item => {
      invariant(typeof query.type === 'string', 'Type must be string');
      let model = AttributeMapHelper.toModel(query.type, item);
      return model.id;
    });
    let nodes = await Promise.all(nodeIds.map(id => this._entityResolver.getAsync(id)));
    let hasPreviousPage = QueryHelper.isForwardScan(query.connectionArgs) ?
      false : typeof response.LastEvaluatedKey !== 'undefined';
    let hasNextPage = QueryHelper.isForwardScan(query.connectionArgs) ?
      typeof response.LastEvaluatedKey !== 'undefined' : false;
    return ModelHelper.toConnection(nodes, hasPreviousPage, hasNextPage,
      query.connectionArgs.order);
  }
}
