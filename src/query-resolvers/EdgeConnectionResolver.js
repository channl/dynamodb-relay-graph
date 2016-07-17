/* @flow */
import BaseQuery from '../query/BaseQuery';
import BaseResolver from '../query-resolvers/BaseResolver';
import EntityResolver from '../query-resolvers/EntityResolver';
import QueryHelper from '../query-helpers/QueryHelper';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import ExpressionHelper from '../query-helpers/ExpressionHelper';
import AWSConvertor from '../query-helpers/AWSConvertor';
import DynamoDB from '../aws/DynamoDB';
import { log, invariant, warning } from '../Global';
import type { Options, ConnectionArgs } from '../flow/Types';
import type { DynamoDBSchema } from 'aws-sdk-promise';

export default class EdgeConnectionResolver extends BaseResolver {
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
    return (query instanceof EdgeConnectionQuery);
  }

  async resolveAsync(query: EdgeConnectionQuery,
    innerResult: Object, options: ?Options): Promise<?Object> {
    invariant(query, 'Argument \'query\' is null');
    invariant(innerResult, 'Argument \'innerResult\' is null');

    let sw = null;
    if (options && options.stats) {
      sw = options.stats.timer('EdgeConnectionResolver.resolveAsync').start();
    }

    try {
      let expression = this.getExpression(innerResult, query);

      if (ExpressionHelper.isEdgeModelExpression(query.expression)) {

        // Type and id are supplied so get the item direct
        let item = await this._entityResolver.getAsync(query.expression);
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
            query: query.clone(),
            innerResult,
            result}));
        }

        return result;
      }

      let request = this.getRequest(
        expression,
        query.connectionArgs,
        query.isOut);

      let response = await this._dynamoDB.queryAsync(request);
      let result = this.getResult(response, expression, query.connectionArgs);

      if (options && options.logs) {
        log(
          JSON.stringify({
            class: 'EdgeConnectionResolver',
            function: 'resolveAsync',
            query: query.clone(),
            request,
            innerResult,
            result
          }));
      }

      return result;

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EdgeConnectionResolver',
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

  getExpression(innerResult: any, query: EdgeConnectionQuery) {
    try {
      invariant(innerResult, 'Argument \'innerResult\' is null');
      invariant(query, 'Argument \'query\' is null');

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
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EdgeConnectionResolver',
        function: 'getExpression',
        query: query.clone(),
        innerResult
      }));
      throw ex;
    }
  }

  getRequest(expression: any, connectionArgs: ConnectionArgs) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    let tableName = AWSConvertor.getTableName(expression.type);
    let tableSchema = this._schema.tables.find(ts => ts.TableName === tableName);
    let indexSchema = QueryHelper.getIndexSchema(
      expression,
      connectionArgs,
      tableSchema);

    let indexName = indexSchema ? indexSchema.IndexName : undefined;
    let projectionExpression = QueryHelper.getProjectionExpression(
      expression,
      connectionArgs,
      [ 'inID', 'outID', 'createDate' ]);

    let keyConditionExpression = QueryHelper.getKeyConditionExpression(expression);
    let expressionAttributeValues = QueryHelper.getExpressionAttributeValues(
      expression,
      tableSchema);

    let expressionAttributeNames = QueryHelper.getExpressionAttributeNames(
      expression,
      connectionArgs,
      [ 'inID', 'outID', 'createDate' ]);

    return {
      TableName: tableName,
      IndexName: indexName,
      ExclusiveStartKey: QueryHelper.getExclusiveStartKey(connectionArgs),
      Limit: QueryHelper.getLimit(connectionArgs),
      ScanIndexForward: QueryHelper.getScanIndexForward(connectionArgs),
      ProjectionExpression: projectionExpression,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames
    };
  }

  getResult(response: any, expression: any, connectionArgs: ConnectionArgs) {
    invariant(response, 'Argument \'response\' is null');
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    let edges = response.data.Items.map(item => {

      let edge = AWSConvertor.getModelFromAWSItem(expression.type, item);
      let result = {
        type: expression.type,
        inID: edge.inID,
        outID: edge.outID,
        cursor: AWSConvertor.toCursor(edge, connectionArgs.order)
      };

      return result;
    });

    if (QueryHelper.isForwardScan(connectionArgs)) {

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

  getBeforeParam(query: EdgeConnectionQuery) {
    invariant(query, 'Argument \'query\' is null');

    if (typeof query.connectionArgs.before !== 'undefined') {
      let cursor = AWSConvertor.fromCursor(query.connectionArgs.before);
      let value = cursor[query.connectionArgs.order].S;
      return value;
    }

    return null;
  }

  getAfterParam(query: EdgeConnectionQuery) {
    invariant(query, 'Argument \'query\' is null');

    if (typeof query.connectionArgs.after !== 'undefined') {
      let cursor = AWSConvertor.fromCursor(query.connectionArgs.after);
      let value = cursor[query.connectionArgs.order].S;
      return value;
    }

    return null;
  }

  getOrderExpression(query: EdgeConnectionQuery) {
    invariant(query, 'Argument \'query\' is null');

    if (typeof query.connectionArgs.orderDesc !== 'undefined' &&
      query.connectionArgs.orderDesc) {
      return { before: this.getBeforeParam(query) };
    }

    return { after: this.getAfterParam(query) };
  }
}
