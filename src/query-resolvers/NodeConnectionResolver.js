/* @flow */
import EntityResolver from '../query-resolvers/EntityResolver';
import QueryHelper from '../query-helpers/QueryHelper';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import ExpressionHelper from '../query-helpers/ExpressionHelper';
import TypeHelper from '../query-helpers/TypeHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import ModelHelper from '../query-helpers/ModelHelper';
import DynamoDB from '../aws/DynamoDB';
import Instrument from '../utils/Instrument';
import { invariant } from '../Global';
// eslint-disable-next-line no-unused-vars
import type { ConnectionArgs, QueryExpression, Model, NodeModel } from '../flow/Types';
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

  async resolveAsync(query: NodeConnectionQuery): Promise<Connection<NodeModel>> {
    return await Instrument.funcAsync(this, async () => {
      invariant(query != null, 'Argument \'query\' is null');

      // Generate the full expression using the query and any previous result
      let expression = QueryHelper.getExpression(query);

      if (ExpressionHelper.isModelExpression(expression)) {
        let node = await this._entityResolver.getAsync(ExpressionHelper.toGlobalId(expression));
        return ModelHelper.toConnection([ node ], false, false, null);
      }

      if (ExpressionHelper.isTypeOnlyExpression(expression)) {
        let request = this._getScanRequest(expression, query.connectionArgs);
        let response = await this._dynamoDB.scanAsync(request);
        invariant(typeof expression.type === 'string', 'Type must be string');
        return await this._getResponseAsConnectionAsync(query, response);
      }

      let request = this._getQueryRequest(expression, query.connectionArgs);
      let response = await this._dynamoDB.queryAsync(request);
      invariant(typeof expression.type === 'string', 'Type must be string');
      return await this._getResponseAsConnectionAsync(query, response);
    });
  }

  _getScanRequest(expression: QueryExpression, connectionArgs: ConnectionArgs) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    invariant(typeof expression.type === 'string', 'Type must be string');
    return {
      TableName: TypeHelper.getTableName(expression.type),
      ExclusiveStartKey: QueryHelper.getExclusiveStartKey(connectionArgs),
      Limit: QueryHelper.getLimit(connectionArgs),
      ProjectionExpression: QueryHelper.getProjectionExpression(expression, connectionArgs,
        [ 'id' ]),
      ExpressionAttributeNames: QueryHelper.getExpressionAttributeNames(expression,
        connectionArgs, [ 'id' ])
    };
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
        [ 'id' ]),
      KeyConditionExpression: QueryHelper.getKeyConditionExpression(expression),
      ExpressionAttributeValues: QueryHelper.getExpressionAttributeValues(expression,
        this._schema),
      ExpressionAttributeNames: QueryHelper.getExpressionAttributeNames(expression,
        connectionArgs, [ 'id' ])
    };
  }

  // eslint-disable-next-line no-unused-vars
  async _getResponseAsConnectionAsync(query: NodeConnectionQuery,
    response: ScanQueryResponse): Promise<Connection<NodeModel>> {
    let nodeIds = response.Items.map(item => {
      invariant(typeof query.expression.type === 'string', 'Type must be string');
      return ModelHelper.toGlobalId(AttributeMapHelper.toModel(query.expression.type, item));
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
