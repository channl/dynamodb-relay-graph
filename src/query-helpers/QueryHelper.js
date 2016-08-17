/* @flow */
import { invariant } from '../Global';
import type NodeConnectionQuery from '../query/NodeConnectionQuery';
import type EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import ExpressionValueHelper from '../query-helpers/ExpressionValueHelper';
import TableDefinitionHelper from '../query-helpers/TableDefinitionHelper';
import ValueHelper from '../query-helpers/ValueHelper';
import CursorHelper from '../query-helpers/CursorHelper';
import TypeHelper from '../query-helpers/TypeHelper';
import ExpressionHelper from '../query-helpers/ExpressionHelper';
import type { Connection } from 'graphql-relay';
import type { ConnectionArgs, QueryExpression, ExpressionValue } from '../flow/Types';
import type { TableDefinition, KeyDefinition, KeySchema,
  DynamoDBSchema } from 'aws-sdk-promise';

export default class QueryHelper {

  static getExclusiveStartKey(connectionArgs: ConnectionArgs) {
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    if (connectionArgs.first != null) {
      return connectionArgs.after == null ?
        undefined :
        CursorHelper.toAWSKey(connectionArgs.after);
    }

    if (connectionArgs.last != null) {
      return connectionArgs.before == null ?
        undefined :
        CursorHelper.toAWSKey(connectionArgs.before);
    }

    invariant(false, 'First or Last must be specified');
  }

  static isForwardScan(connectionArgs: ConnectionArgs) {
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    if (connectionArgs.first != null) {
      return true;
    }

    if (connectionArgs.last != null) {
      return false;
    }

    invariant(false, 'First or Last must be specified');
  }

  static getScanIndexForward(connectionArgs: ConnectionArgs) {
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    if (connectionArgs.first != null && connectionArgs.orderDesc != null &&
      connectionArgs.orderDesc) {
      return false;
    }

    if (connectionArgs.first != null) {
      return true;
    }

    if (connectionArgs.last != null && connectionArgs.orderDesc != null &&
        connectionArgs.orderDesc) {
      return true;
    }

    if (connectionArgs.last != null) {
      return false;
    }

    invariant(false, 'First or Last must be specified');
  }

  static getLimit(connectionArgs: ConnectionArgs) {
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    if (connectionArgs.first != null) {
      return connectionArgs.first;
    }

    if (connectionArgs.last != null) {
      return connectionArgs.last;
    }

    invariant(false, 'First or Last must be specified');
  }

  static getExpressionAttributeNames(expression: QueryExpression,
    connectionArgs: ConnectionArgs, include: string[]) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    invariant(include, 'Argument \'include\' is null');

    let result = {};
    Object
      .keys(expression)
      .concat(connectionArgs.order)
      .concat(include)
      .filter(value => value !== 'type' && typeof value !== 'undefined')
      .filter((value, index, self) => self.indexOf(value) === index)
      .forEach(name => {
        result[this.getExpressionAttributeName(name)] = name;
      });

    return result;
  }

  static getIndexSchema(expression: QueryExpression,
    connectionArgs: ConnectionArgs, tableSchema: TableDefinition) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    invariant(tableSchema, 'Argument \'tableSchema\' is null');

    let requiredKeySchema = Object
      .keys(expression)
      .filter(name => name !== 'type')
      .map(name => {
        let value = expression[name];
        return {
          AttributeName: name,
          KeyType: this.getExpressionKeyType(value),
        };
      });

    if (typeof connectionArgs.order !== 'undefined') {
      requiredKeySchema.push({
        AttributeName: connectionArgs.order,
        KeyType: 'RANGE'
      });
    }

    // If the primary key is a match then we dont need an index at all
    if (this.isKeySchemaSatisfied(tableSchema.KeySchema, requiredKeySchema)) {
      return undefined;
    }

    // Search the local secondary indexes for a match
    if (tableSchema.LocalSecondaryIndexes) {
      let lsi = tableSchema
        .LocalSecondaryIndexes
        .find(index =>
          this.isKeySchemaSatisfied(index.KeySchema, requiredKeySchema));
      if (lsi) {
        return lsi;
      }
    }

    // Search the global secondary indexes for a match
    if (tableSchema.GlobalSecondaryIndexes) {
      let gsi = tableSchema
        .GlobalSecondaryIndexes
        .find(index =>
          this.isKeySchemaSatisfied(index.KeySchema, requiredKeySchema));
      if (gsi) {
        return gsi;
      }
    }

    throw new Error('Corresponding LocalSecondaryIndex Or GlobalSecondaryIndex not found');
  }

  static isKeySchemaSatisfied(proposed: KeySchema, required: ?KeySchema) {
    invariant(proposed, 'Argument \'proposed\' is null');
    invariant(required, 'Argument \'required\' is null');

    if (required.length === 0) {
      // If no requirements were specified then
      // the key schema or any index will satisfy the query
      return true;
    }

    // Ensure all required keys are in the proposed key schema
    let hashKeySatisfied = false;
    for(let requiredItem of required) {
      let matchingKey: ?KeyDefinition = proposed
        .find(attr => attr.AttributeName === requiredItem.AttributeName);
      if (!matchingKey) {
        return false;
      }

      // '*' KeyType means HASH or RANGE should match
      if (requiredItem.KeyType !== '*' &&
        requiredItem.KeyType !== matchingKey.KeyType) {
        return false;
      }

      if (matchingKey.KeyType === 'HASH') {
        hashKeySatisfied = true;
      }
    }

    // The RANGE key will be defaulted if not set but the HASH key must be set
    return hashKeySatisfied;
  }

  static getExpressionKeyType(expression: ExpressionValue) {
    invariant(expression, 'Argument \'expression\' is null');

    if (expression.after != null ||
      expression.before != null ||
      expression.begins_with != null) {
      return 'RANGE';
    }

    if (typeof expression === 'string' ||
      typeof expression === 'number' ||
      expression instanceof Buffer) {
      // Can be HASH or RANGE
      return '*';
    }

    invariant(false, 'ExpressionKeyType cannot be determined');
  }

  static getProjectionExpression(expression: QueryExpression,
    connectionArgs: ConnectionArgs, include: string[]) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    invariant(include, 'Argument \'include\' is null');

    return Object
      .keys(expression)
      // $FlowIgnore
      .concat(connectionArgs.order)
      .concat(include)
      .filter(name => name !== 'type' && typeof name !== 'undefined')
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(this.getExpressionAttributeName)
      .reduce((pre, cur) => pre === '' ? cur : pre + ', ' + cur, '');
  }

  static getExpressionAttributeName(name: string) {
    invariant(name, 'Argument \'name\' is null');
    return '#res' + name;
  }

  static getExpressionAttributeValues(expression: QueryExpression, schema: DynamoDBSchema) {
    invariant(expression != null, 'Argument \'expression\' is null');
    invariant(schema != null, 'Argument \'schema\' is null');

    invariant(typeof expression.type === 'string', 'Type must be string');
    let tableName = TypeHelper.getTableName(expression.type);
    let table = schema.tables.find(ts => ts.TableName === tableName);
    invariant(table != null, 'Table not found');

    let names = Object.keys(expression).filter(name => name !== 'type');
    if (names.length === 0) {
      return undefined;
    }

    let result = {};
    names.forEach(name => {
      let expr = expression[name];
      if (ExpressionValueHelper.isAfterExpression(expr) && expr.after == null) {
        let attributeType = TableDefinitionHelper.getAttributeType(table, name);
        result[':v_after_' + name] = ValueHelper
          .toAttributeValue(TypeHelper.getTypeMinValue(attributeType));
        return;
      }

      if (ExpressionValueHelper.isAfterExpression(expr)) {
        // $FlowIgnore
        result[':v_after_' + name] = ValueHelper.toAttributeValue(expr.after);
        return;
      }

      if (ExpressionValueHelper.isBeforeExpression(expr) && expr.before == null) {
        let attributeType = TableDefinitionHelper.getAttributeType(table, name);
        result[':v_before_' + name] = ValueHelper
          .toAttributeValue(TypeHelper.getTypeMaxValue(attributeType));
        return;
      }

      if (ExpressionValueHelper.isBeforeExpression(expr)) {
        // $FlowIgnore
        result[':v_before_' + name] = ValueHelper.toAttributeValue(expr.before);
        return;
      }

      if (ExpressionValueHelper.isBeginsWithExpression(expr)) {
        // $FlowIgnore
        result[':v_begins_with_' + name] = ValueHelper.toAttributeValue(expr.begins_with);
        return;
      }

      if (ExpressionValueHelper.isValueExpression(expr)) {
        // $FlowIgnore
        result[':v_equals_' + name] = ValueHelper.toAttributeValue(expr);
        return;
      }

      invariant(false, 'ExpressionValue type was invalid');
    });

    return result;
  }

  static getKeyConditionExpression(expression: QueryExpression) {
    invariant(expression, 'Argument \'expression\' is null');

    let names = Object.keys(expression).filter(name => name !== 'type');
    if (names.length === 0) {
      return undefined;
    }

    return names
      .map(name => this.getKeyConditionExpressionItem(name, expression[name]))
      .reduce((pre, cur) => pre === '' ? cur : pre + ' AND ' + cur, '');
  }

  static getKeyConditionExpressionItem(name: string, expression: ExpressionValue) {
    invariant(name != null, 'Argument \'name\' is null');
    invariant(expression != null, 'Argument \'expression\' is null');

    if (typeof expression === 'string' || typeof expression === 'number' ||
      expression instanceof Buffer) {
      return this.getExpressionAttributeName(name) + ' = :v_equals_' + name;
    }

    if (typeof expression.after !== 'undefined' &&
      typeof expression.before !== 'undefined') {
      // return this.getExpressionAttributeName(name) + ' > :v_after_' +
      // name + ' AND ' + this.getExpressionAttributeName(name) +
      // ' < :v_before_' + name;
      throw new Error('NotSupportedError (after and before used together)');
    }

    if (typeof expression.after !== 'undefined') {
      return this.getExpressionAttributeName(name) + ' > :v_after_' + name;
    }

    if (typeof expression.before !== 'undefined') {
      return this.getExpressionAttributeName(name) + ' < :v_before_' + name;
    }

    if (typeof expression.begins_with !== 'undefined') {
      return 'begins_with(' + this.getExpressionAttributeName(name) +
        ', :v_begins_with_' + name + ')';
    }

    invariant(false, 'ExpressionValue type was invalid');
  }

  static getIndexName(expression: QueryExpression, connectionArgs: ConnectionArgs,
    schema: DynamoDBSchema): any {
    invariant(expression != null, 'Argument \'expression\' is null');
    invariant(schema != null, 'Argument \'schema\' is null');
    invariant(typeof expression.type === 'string', 'Type must be string');

    let tableName = TypeHelper.getTableName(expression.type);
    let tableSchema = schema.tables.find(ts => ts.TableName === tableName);
    invariant(tableSchema, 'TableSchema ' + tableName + ' not found');

    let indexSchema = QueryHelper.getIndexSchema(expression, connectionArgs, tableSchema);
    let indexName = indexSchema ? indexSchema.IndexName : undefined;
    return indexName;
  }

  static getExpression(query: NodeConnectionQuery): QueryExpression {
    invariant(query, 'Argument \'query\' is null');

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

  static getEdgeExpression(innerResult: Connection, query: EdgeConnectionQuery): QueryExpression {
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
  }
}
