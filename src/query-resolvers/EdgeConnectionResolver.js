/* @flow */
import warning from 'warning';
import QueryResolver from '../query-resolvers/QueryResolver';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import ExpressionHelper from '../query-resolvers/ExpressionHelper';
import DynamoDB from '../store/DynamoDB';
import { log } from '../Global';

export default class EdgeConnectionResolver extends QueryResolver {
  constructor(dynamoDB: DynamoDB, schema: any) {
    super(dynamoDB, schema);
  }

  canResolve(query: any): boolean {
    return (query instanceof EdgeConnectionQuery);
  }

  async resolveAsync(query: any, innerResult: any, options: any) {
    let sw = null;
    if (options && options.stats) {
      sw = options.stats.timer('EdgeConnectionResolver.resolveAsync').start();
    }

    try {
      let expression = this.getExpression(innerResult, query);

      if (ExpressionHelper.isEdgeModelExpression(query.expression)) {

        // Type and id are supplied so get the item direct
        let item = await this.getAsync(query.expression);
        let edges = item ? [ {cursor: 'xxx', node: item} ] : [];
        let startCursor = edges[0] ? edges[0].cursor : null;
        let endCursor = edges[edges.length - 1] ?
          edges[edges.length - 1].cursor :
          null;
        let result = {
          edges,
          pageInfo: {
            startCursor,
            endCursor,
            hasPreviousPage: false,
            hasNextPage: false
          }
        };

        if (options && options.logs) {
          log(JSON.stringify({
            class: 'EdgeConnectionResolver',
            function: 'succeeded',
            query,
            innerResult,
            result}));
        }

        return result;
      }

      let request = this.getRequest(
        expression,
        query.connectionArgs,
        query.isOut);

      let response = await this.dynamoDB.queryAsync(request);
      let result = this.getResult(response, expression, query.connectionArgs);

      if (options && options.logs) {
        log(
          JSON.stringify({
            class: 'EdgeConnectionResolver',
            function: 'resolveAsync',
            query, request, innerResult, result
          }));
      }

      return result;

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EdgeConnectionResolver',
        function: 'resolveAsync', query, innerResult
      }));
      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }

  getExpression(innerResult: any, query: any) {
    if (ExpressionHelper.isEdgeModelExpression(query.expression)) {
      // This expression has type+inID+outID so it already has
      // all it needs to find a particular edge
      return query.expression;
    }

    if (typeof query.expression.type !== 'undefined' &&
        typeof query.expression.inID !== 'undefined' &&
        typeof query.expression.outID === 'undefined') {
      // This expression has type+inID so it already has
      // all it needs to find a particular set of edges
      // if (typeof query.expression.inID === 'string') {
        // query.expression.inID =
        //   new Buffer(uuid.parse(query.expression.inID));
      // }
      return query.expression;
    }

    if (typeof query.expression.type !== 'undefined' &&
        typeof query.expression.inID === 'undefined' &&
        typeof query.expression.outID !== 'undefined') {
      // This expression has type+outID so it already has
      // all it needs to find a particular set of edges
      // if (typeof query.expression.outID === 'string') {
        // query.expression.outID =
        //   new Buffer(uuid.parse(query.expression.outID));
      // }
      return query.expression;
    }

    // Ok so the expression is currently missing enough information to make a
    // query.  Most likely this is an node to edge traversal and we need to set
    // the ids at run time.
    // NOTE : Only traversal from a single node is supported currently
    if (innerResult.edges.length !== 1) {
      throw new Error('NotSupportedError(getExpression)');
    }


    if (query.isOut) {
      return {
        type: query.expression.type,
        outID: innerResult.edges[0].node.id
      };
    }

    return {
      type: query.expression.type,
      inID: innerResult.edges[0].node.id
    };
  }

  getRequest(expression: any, connectionArgs: any) {
    let tableName = this.convertor.getTableName(expression.type);
    let tableSchema = this.schema.tables.find(ts => ts.TableName === tableName);
    let indexSchema = this.getIndexSchema(
      expression,
      connectionArgs,
      tableSchema);

    let indexName = indexSchema ? indexSchema.IndexName : undefined;
    let projectionExpression = this.getProjectionExpression(
      expression,
      connectionArgs,
      [ 'inID', 'outID', 'createDate' ]);

    let keyConditionExpression = this.getKeyConditionExpression(expression);
    let expressionAttributeValues = this.getExpressionAttributeValues(
      expression,
      tableSchema);

    let expressionAttributeNames = this.getExpressionAttributeNames(
      expression,
      connectionArgs,
      [ 'inID', 'outID', 'createDate' ]);

    return {
      TableName: tableName,
      IndexName: indexName,
      ExclusiveStartKey: this.getExclusiveStartKey(connectionArgs),
      Limit: this.getLimit(connectionArgs),
      ScanIndexForward: this.getScanIndexForward(connectionArgs),
      ProjectionExpression: projectionExpression,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames
    };
  }

  getResult(response: any, expression: any, connectionArgs: any) {
    let edges = response.data.Items.map(item => {

      let edge = this.convertor.getModelFromAWSItem(expression.type, item);
      let result = {
        type: expression.type,
        inID: edge.inID,
        outID: edge.outID,
        cursor: this.convertor.toCursor(edge, connectionArgs.order)
      };

      return result;
    });

    if (this.isForwardScan(connectionArgs)) {

      let startCursor = edges[0] ? edges[0].cursor : null;
      let endCursor = edges[edges.length - 1] ?
        edges[edges.length - 1].cursor :
        null;

      let result = {
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasNextPage: typeof response.data.LastEvaluatedKey !== 'undefined',
          hasPreviousPage: false
        }
      };

      return result;
    }

    edges.reverse();
    let result = {
      edges,
      pageInfo: {
        startCursor: edges[0] ? edges[0].cursor : null,
        endCursor: edges[edges.length - 1] ?
          edges[edges.length - 1].cursor : null,
        hasNextPage: false,
        hasPreviousPage: typeof response.data.LastEvaluatedKey !== 'undefined'
      }
    };

    return result;
  }

  getBeforeParam(query: any) {
    if (typeof query.connectionArgs.before !== 'undefined') {
      let cursor = this.convertor.fromCursor(query.connectionArgs.before);
      let value = cursor[query.connectionArgs.order].S;
      return value;
    }

    return null;
  }

  getAfterParam(query: any) {
    if (typeof query.connectionArgs.after !== 'undefined') {
      let cursor = this.convertor.fromCursor(query.connectionArgs.after);
      let value = cursor[query.connectionArgs.order].S;
      return value;
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
}
