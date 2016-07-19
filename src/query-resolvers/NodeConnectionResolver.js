/* @flow */
import BaseQuery from '../query/BaseQuery';
import BaseResolver from '../query-resolvers/BaseResolver';
import EntityResolver from '../query-resolvers/EntityResolver';
import QueryHelper from '../query-helpers/QueryHelper';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import ExpressionHelper from '../query-helpers/ExpressionHelper';
import AWSConvertor from '../query-helpers/AWSConvertor';
import DynamoDB from '../aws/DynamoDB';
import { log, invariant, warning } from '../Global';
import type { Options, ConnectionArgs } from '../flow/Types';
import type { DynamoDBSchema } from 'aws-sdk-promise';

export default class NodeConnectionResolver extends BaseResolver {
  _dynamoDB: DynamoDB;
  _schema: DynamoDBSchema;
  _entityResolver: EntityResolver;

  constructor(dynamoDB: DynamoDB, schema: DynamoDBSchema, entityResolver: EntityResolver) {
    super();

    this._dynamoDB = dynamoDB;
    this._schema = schema;
    this._entityResolver = entityResolver;
  }

  canResolve(query: BaseQuery): boolean {
    invariant(query, 'Argument \'query\' is null');
    return (query instanceof NodeConnectionQuery);
  }

  async resolveAsync(query: NodeConnectionQuery,
    innerResult: Object, options: ?Options): Promise<?Object> {
    invariant(query, 'Argument \'query\' is null');
    invariant(innerResult, 'Argument \'innerResult\' is null');

    let sw = null;
    if (options && options.stats) {
      sw = options.stats.timer('NodeConnectionResolver.resolveAsync').start();
    }

    try {
      let nodeIds = await this.getNodeIdConnection(
        query,
        innerResult,
        options);

      let nodes = await Promise
        .all(nodeIds.edges.map(e => this._entityResolver.getAsync(e.id)));

      // Have to filter out nulls due to getNodeIdConnection implementation
      nodes = nodes.filter(n => n !== null);
      let edges = nodes.map(node => {
        let cursor = AWSConvertor.toCursor(node, query.connectionArgs.order);
        return {
          cursor,
          node
        };
      });

      let startCursor = edges[0] ? edges[0].cursor : null;
      let endCursor = edges[edges.length - 1] ?
        edges[edges.length - 1].cursor :
        null;

      let result = {
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasPreviousPage: nodeIds.pageInfo.hasPreviousPage,
          hasNextPage: nodeIds.pageInfo.hasNextPage
        }
      };


      if (options && options.logs) {
        log(JSON.stringify({
          class: 'NodeConnectionResolver',
          query: query.clone(),
          innerResult,
          result}));
      }
      return result;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'NodeConnectionResolver',
        function: 'resolveAsync',
        query: query.clone(),
        innerResult
      }));
      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }

  async getNodeIdConnection(query: NodeConnectionQuery, innerResult: any, options: ?Options) {
    try {
      invariant(query, 'Argument \'query\' is null');
      invariant(innerResult, 'Argument \'innerResult\' is null');

      // Generate the full expression using the query and any previous result
      let expression = this.getExpression(query, innerResult);
      if (ExpressionHelper.isGlobalIdExpression(expression) && typeof expression === 'string') {
        // TODO THIS MIGHT NOT EXIST!!!
        // Type and id are supplied so get the item direct
        return {
          edges: [ {
            id: expression
          } ],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: false
          }
        };
      }

      if (ExpressionHelper.isModelExpression(expression)) {

        // TODO THIS MIGHT NOT EXIST!!!
        // Type and id are supplied so get the item direct
        return {
          edges: [ {
            id: AWSConvertor.getGlobalIdFromModel(expression)
          } ],
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: false
          }
        };
      }

      if (ExpressionHelper.isTypeOnlyExpression(expression)) {
        // This query expression only contains a type
        // so we should do a dynamo scan
        let request = this.getScanRequest(expression, query.connectionArgs);
        let response = await this._dynamoDB.scanAsync(request);
        let result = this.getResult(response, expression, query.connectionArgs);
        return result;
      }

      // The query expression contains some parameters, use a dynamo query
      let request = this.getQueryRequest(expression, query.connectionArgs);
      if (options && options.logs) {
        log(JSON.stringify({
          class: 'NodeConnectionResolver',
          function: 'getNodeIdConnection',
          request}, null, 2));
      }

      let response = await this._dynamoDB.queryAsync(request);
      let result = this.getResult(response, expression, query.connectionArgs);
      return result;
    } catch (ex) {
      warning(false,
        JSON.stringify({
          class: 'NodeConnectionResolver',
          function: 'getNodeIdConnection',
          query: query.clone(),
        }));
      throw ex;
    }
  }

  getExpression(
    query: NodeConnectionQuery,
    innerResult: any) { // eslint-disable-line no-unused-vars
    invariant(query, 'Argument \'query\' is null');
    invariant(innerResult, 'Argument \'innerResult\' is null');

    if (ExpressionHelper.isGlobalIdExpression(query.expression)) {
      return query.expression;
    }

    if (ExpressionHelper.isModelExpression(query.expression)) {
      return query.expression;
    }

    let expr = query.expression;
    if (typeof query.connectionArgs.query !== 'undefined') {
      // Transfer over the connection query expression parameters
      let connectionQueryExpression = JSON.parse(query.connectionArgs.query);
      Object.keys(connectionQueryExpression).forEach(key => {
        if (expr[key]) {
          throw new Error('NotSupportedError (ConnectionQueryExpression)');
        }

        expr[key] = connectionQueryExpression[key];
      });
    }

    return expr;
  }

  getBeforeParam(query: NodeConnectionQuery) {
    if (typeof query.connectionArgs.before !== 'undefined') {
      return query.connectionArgs.before;
    }

    return null;
  }

  getAfterParam(query: NodeConnectionQuery) {
    if (typeof query.connectionArgs.after !== 'undefined') {
      return query.connectionArgs.after;
    }

    return null;
  }

  getOrderExpression(query: NodeConnectionQuery) {
    if (typeof query.connectionArgs.orderDesc !== 'undefined' &&
      query.connectionArgs.orderDesc) {
      return { before: this.getBeforeParam(query) };
    }

    return { after: this.getAfterParam(query) };
  }

  getScanRequest(expression: any, connectionArgs: ConnectionArgs) {
    try {
      invariant(expression, 'Argument \'expression\' is null');
      invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

      let tableName = AWSConvertor.getTableName(expression.type);

      let projectionExpression = QueryHelper.getProjectionExpression(
        expression,
        connectionArgs,
        [ 'id' ]);

      let expressionAttributeNames = QueryHelper.getExpressionAttributeNames(
        expression,
        connectionArgs,
        [ 'id' ]);

      return {
        TableName: tableName,
        ExclusiveStartKey: QueryHelper.getExclusiveStartKey(connectionArgs),
        Limit: QueryHelper.getLimit(connectionArgs),
        ProjectionExpression: projectionExpression,
        ExpressionAttributeNames: expressionAttributeNames
      };
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'NodeConnectionResolver',
        function: 'getScanRequest',
        expression, connectionArgs
      }));
      throw ex;
    }
  }

  getQueryRequest(expression: any, connectionArgs: ConnectionArgs) {
    try {
      invariant(expression, 'Argument \'expression\' is null');
      invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

      let tableName = AWSConvertor.getTableName(expression.type);
      let tableSchema = this
        ._schema
        .tables
        .find(ts => ts.TableName === tableName);

      invariant(tableSchema, 'TableSchema ' + tableName + ' not found');

      let indexSchema = QueryHelper.getIndexSchema(
        expression,
        connectionArgs,
        tableSchema);

      let indexName = indexSchema ? indexSchema.IndexName : undefined;

      let projectionExpression = QueryHelper.getProjectionExpression(
        expression,
        connectionArgs,
        [ 'id' ]);

      let expressionAttributeValues = QueryHelper.getExpressionAttributeValues(
        expression,
        tableSchema);

      let expressionAttributeNames = QueryHelper.getExpressionAttributeNames(
        expression,
        connectionArgs,
        [ 'id' ]);

      return {
        TableName: tableName,
        IndexName: indexName,
        ExclusiveStartKey: QueryHelper.getExclusiveStartKey(connectionArgs),
        Limit: QueryHelper.getLimit(connectionArgs),
        ScanIndexForward: QueryHelper.getScanIndexForward(connectionArgs),
        ProjectionExpression: projectionExpression,
        KeyConditionExpression: QueryHelper.getKeyConditionExpression(expression),
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames
      };
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'NodeConnectionResolver',
        function: 'getQueryRequest',
        expression, connectionArgs
      }));
      throw ex;
    }
  }

  getResult(response: any, expression: any, connectionArgs: ConnectionArgs) {
    invariant(response, 'Argument \'response\' is null');
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    let edges = response
      .data
      .Items
      .map(item => this.getResultEdge(expression, item));

    let hasNextPage = QueryHelper.isForwardScan(connectionArgs) ?
      typeof response.data.LastEvaluatedKey !== 'undefined' :
      false;

    let hasPreviousPage = QueryHelper.isForwardScan(connectionArgs) ?
      false :
      typeof response.data.LastEvaluatedKey !== 'undefined';

    let startCursor = edges[0] ? edges[0].cursor : null;

    let endCursor = edges[edges.length - 1] ?
      edges[edges.length - 1].cursor :
      null;

    return {
      edges,
      pageInfo: {
        startCursor,
        endCursor,
        hasNextPage,
        hasPreviousPage
      }
    };
  }

  getResultEdge(expression: any, item: any) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(item, 'Argument \'item\' is null');

    let model = AWSConvertor.getModelFromAWSItem(expression.type, item);
    return {
      id: AWSConvertor.getGlobalIdFromModel({type: expression.type, id: model.id})
    };
  }
}
