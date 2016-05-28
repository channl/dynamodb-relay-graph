/* @flow */
import warning from 'warning';
import QueryResolver from '../query-resolvers/QueryResolver';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import ExpressionHelper from '../query-resolvers/ExpressionHelper';
import DynamoDB from '../store/DynamoDB';
import { log } from '../Global';

export default class NodeConnectionResolver extends QueryResolver {
  constructor(dynamoDB: DynamoDB, schema: any) {
    super(dynamoDB, schema);
  }

  canResolve(query: any): boolean {
    return (query instanceof NodeConnectionQuery);
  }

  async resolveAsync(query: any, innerResult: any, options: any) {
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
        .all(nodeIds.edges.map(e => this.getAsync(e.id)));

      // Have to filter out nulls due to getNodeIdConnection implementation
      nodes = nodes.filter(n => n !== null);
      let edges = nodes.map(node => {
        let cursor = this.toCursor(node, query.connectionArgs.order);
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
          class: 'NodeConnectionResolver', query, innerResult, result}));
      }
      return result;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'NodeConnectionResolver',
        function: 'resolveAsync',
        query, innerResult
      }));
      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }

  async getNodeIdConnection(query: any, innerResult: any, options: any) {
    try {
      // Generate the full expression using the query and any previous result
      let expression = this.getExpression(query, innerResult);
      if (ExpressionHelper.isGlobalIdExpression(expression)) {

        // TODO THIS MIGHT NOT EXIST!!!
        // Type and id are supplied so get the item direct
        return {
          edges: [ {
            id: query.expression
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
            id: this.getGlobalIdFromModel(expression)
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
        let response = await this.dynamoDB.scanAsync(request);
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

      let response = await this.dynamoDB.queryAsync(request);
      let result = this.getResult(response, expression, query.connectionArgs);
      return result;
    } catch (ex) {
      warning(false,
        JSON.stringify({
          class: 'NodeConnectionResolver',
          function: 'getNodeIdConnection',
          query
        }));
      throw ex;
    }
  }

  getExpression(
    query: any,
    innerResult: any) { // eslint-disable-line no-unused-vars
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

  getBeforeParam(query: any) {
    if (typeof query.connectionArgs.before !== 'undefined') {
      return query.connectionArgs.before;
    }

    return null;
  }

  getAfterParam(query: any) {
    if (typeof query.connectionArgs.after !== 'undefined') {
      return query.connectionArgs.after;
    }

    return null;
  }

  getOrderExpression(query: any) {
    if (typeof query.connectionArgs.orderDesc !== 'undefined' &&
      query.connectionArgs.orderDesc) {
      return { before: this.getBeforeParam(query) };
    }

    return { after: this.getAfterParam(query) };
  }

  getScanRequest(expression: any, connectionArgs: any) {
    try {
      let tableName = this.getTableName(expression.type);

      let projectionExpression = this.getProjectionExpression(
        expression,
        connectionArgs,
        [ 'id' ]);

      let expressionAttributeNames = this.getExpressionAttributeNames(
        expression,
        connectionArgs,
        [ 'id' ]);

      return {
        TableName: tableName,
        ExclusiveStartKey: this.getExclusiveStartKey(connectionArgs),
        Limit: this.getLimit(connectionArgs),
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

  getQueryRequest(expression: any, connectionArgs: any) {
    try {
      let tableName = this.getTableName(expression.type);
      let tableSchema = this
        .schema
        .tables
        .find(ts => ts.TableName === tableName);

      let indexSchema = this.getIndexSchema(
        expression,
        connectionArgs,
        tableSchema);

      let indexName = indexSchema ? indexSchema.IndexName : undefined;

      let projectionExpression = this.getProjectionExpression(
        expression,
        connectionArgs,
        [ 'id' ]);

      let expressionAttributeValues = this.getExpressionAttributeValues(
        expression,
        tableSchema);

      let expressionAttributeNames = this.getExpressionAttributeNames(
        expression,
        connectionArgs,
        [ 'id' ]);

      return {
        TableName: tableName,
        IndexName: indexName,
        ExclusiveStartKey: this.getExclusiveStartKey(connectionArgs),
        Limit: this.getLimit(connectionArgs),
        ScanIndexForward: this.getScanIndexForward(connectionArgs),
        ProjectionExpression: projectionExpression,
        KeyConditionExpression: this.getKeyConditionExpression(expression),
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

  getResult(response: any, expression: any, connectionArgs: any) {
    let edges = response
      .data
      .Items
      .map(item => this.getResultEdge(expression, item));

    let hasNextPage = this.isForwardScan(connectionArgs) ?
      typeof response.data.LastEvaluatedKey !== 'undefined' :
      false;

    let hasPreviousPage = this.isForwardScan(connectionArgs) ?
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
    return {
      id: this.getGlobalIdFromModel({type: expression.type, id: item.id.B})
    };
  }
}
