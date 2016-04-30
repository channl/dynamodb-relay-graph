import logger from '../logging/logger';
import QueryResolver from '../query-resolvers/QueryResolver';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import { toGlobalId } from 'graphql-relay';
import ExpressionHelper from '../graph/ExpressionHelper';
import uuid from 'node-uuid';

export default class NodeConnectionResolver extends QueryResolver {
  constructor(
    dynamoDB,
    schema,
    getTableName,
    getModelFromAWSItem,
    getIdFromAWSKey,
    toAWSKey) {
    super(
      dynamoDB,
      schema,
      getTableName,
      getModelFromAWSItem,
      getIdFromAWSKey,
      toAWSKey);
  }

  canResolve(query) {
    return (query instanceof NodeConnectionQuery);
  }

  async resolveAsync(query, innerResult, options) {
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
        return { cursor: node.toCursor(query.connectionArgs.order), node};
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
        logger.debug(
          'NodeConnectionResolver succeeded',
          JSON.stringify({query, innerResult, result}));
      }
      return result;
    } catch (ex) {
      logger.warn(
        'NodeConnectionResolver.resolveAsync failed',
        JSON.stringify({query, innerResult}));
      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }

  async getNodeIdConnection(query, innerResult, options) {
    try {
      logger.trace('Graph.getNodeGlobalIds');

      // Generate the full expression using the query and any previous result
      let expression = this.getExpression(query, innerResult);
      if (ExpressionHelper.isNodeGlobalIdExpression(expression)) {

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

      if (ExpressionHelper.isNodeTypeAndIdExpression(expression)) {

        // TODO THIS MIGHT NOT EXIST!!!
        // Type and id are supplied so get the item direct
        return {
          edges: [ {
            id: toGlobalId(expression.type, expression.id)
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
        logger.debug(
          'NodeConnectionResolver.getNodeIdConnection request',
          JSON.stringify(request, null, 2));
      }

      let response = await this.dynamoDB.queryAsync(request);
      let result = this.getResult(response, expression, query.connectionArgs);
      return result;
    } catch (ex) {
      logger.warn(
        'NodeConnectionResolver.getNodeIdConnection failed',
        JSON.stringify({query}));
      throw ex;
    }
  }

  getExpression(query /* , innerResult*/) {
    if (ExpressionHelper.isNodeGlobalIdExpression(query.expression)) {
      return query.expression;
    }

    if (ExpressionHelper.isNodeTypeAndIdExpression(query.expression)) {
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

  getBeforeParam(query) {
    if (typeof query.connectionArgs.before !== 'undefined') {
      return query.connectionArgs.before;
    }

    return null;
  }

  getAfterParam(query) {
    if (typeof query.connectionArgs.after !== 'undefined') {
      return query.connectionArgs.after;
    }

    return null;
  }

  getOrderExpression(query) {
    if (typeof query.connectionArgs.orderDesc !== 'undefined' &&
      query.connectionArgs.orderDesc) {
      return { before: this.getBeforeParam(query) };
    }

    return { after: this.getAfterParam(query) };
  }

  getScanRequest(expression, connectionArgs) {
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
      logger.warn(
        'NodeConnectionResolver.getScanRequest failed',
        JSON.stringify({expression, connectionArgs}));
      throw ex;
    }
  }

  getQueryRequest(expression, connectionArgs) {
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
      logger.warn(
        'NodeConnectionResolver.getQueryRequest failed',
        JSON.stringify({expression, connectionArgs}));
      throw ex;
    }
  }

  getResult(response, expression, connectionArgs) {
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

  getResultEdge(expression, item) {
    return {
      id: toGlobalId(expression.type, uuid.unparse(item.id.B))
    };
  }
}
