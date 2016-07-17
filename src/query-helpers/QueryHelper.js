/* @flow */
import { warning, invariant } from '../Global';
import uuid from 'node-uuid';
import ResolverHelper from '../query-helpers/ResolverHelper';
import AWSConvertor from '../query-helpers/AWSConvertor';
import type { ConnectionArgs } from '../flow/Types';
import type { DynamoDBTable, KeyDefinition, DynamoDBKeySchema } from 'aws-sdk-promise';

export default class QueryHelper {

  static getExclusiveStartKey(connectionArgs: ConnectionArgs) {
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    if (connectionArgs.first != null) {
      return connectionArgs.after == null ?
        undefined :
        AWSConvertor.fromCursor(connectionArgs.after);
    }

    if (connectionArgs.last != null) {
      return connectionArgs.before == null ?
        undefined :
        AWSConvertor.fromCursor(connectionArgs.before);
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

  static getExpressionAttributeNames(expression: Object,
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

  static getIndexSchema(expression: Object,
    connectionArgs: ConnectionArgs, tableSchema: DynamoDBTable) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    invariant(tableSchema, 'Argument \'tableSchema\' is null');

    let requiredKeySchema = null;
    try {
      requiredKeySchema = Object
        .keys(expression)
        .filter(name => name !== 'type')
        .map(name => {
          return {
            AttributeName: name,
            KeyType: this.getExpressionKeyType(expression[name])
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

      throw new Error('IndexNotFoundError');

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'QueryResolver',
        function: 'getIndexSchema',
        expression,
        connectionArgs,
        requiredKeySchema,
        tableSchema}));
      throw ex;
    }
  }

  static isKeySchemaSatisfied(proposed: DynamoDBKeySchema, required: ?DynamoDBKeySchema) {
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

  static getExpressionKeyType(expression: Object) {
    invariant(expression, 'Argument \'expression\' is null');

    if (typeof expression.after !== 'undefined' ||
      typeof expression.before !== 'undefined' ||
      typeof expression.begins_with !== 'undefined') {
      return 'RANGE';
    }

    if (typeof expression === 'string' ||
      typeof expression === 'number' ||
      expression instanceof Buffer) {
      // Can be HASH or RANGE
      return '*';
    }

    warning(false, JSON.stringify({
      class: 'QueryResolver',
      function: 'getExpressionKeyType',
      expression
    }));

    throw new Error('NotSupportedError');
  }

  static getProjectionExpression(expression: any,
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

  static getExpressionAttributeValues(expression: any, tableSchema: any) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(tableSchema, 'Argument \'tableSchema\' is null');

    let names = Object
      .keys(expression)
      .filter(name => name !== 'type');

    if (names.length === 0) {
      return undefined;
    }

    let result = {};
    names.forEach(name => this.getExpressionAttributeValue(
      name, expression[name], result, tableSchema));
    return result;
  }

  static getExpressionAttributeValue(name: string,
    expression: any, result: any, tableSchema: DynamoDBTable) {
    invariant(name, 'Argument \'name\' is null');
    invariant(expression, 'Argument \'expression\' is null');
    invariant(result, 'Argument \'result\' is null');
    invariant(tableSchema, 'Argument \'tableSchema\' is null');

    let attributeType = ResolverHelper.getAttributeType(tableSchema, name);
    if (typeof expression === 'string' ||
      typeof expression === 'number' ||
      expression instanceof Buffer) {
      let exp = {};
      exp[attributeType] = expression;
      result[':v_equals_' + name] = exp;
    }

    if (typeof expression.after !== 'undefined') {
      let exp = {};
      exp[attributeType] = this.getAfterAttributeValueAsType(
        expression.after, attributeType);
      result[':v_after_' + name] = exp;
    }

    if (typeof expression.before !== 'undefined') {
      let exp = {};
      exp[attributeType] = this.getBeforeAttributeValueAsType(
        expression.before, attributeType);
      result[':v_before_' + name] = exp;
    }

    if (typeof expression.begins_with !== 'undefined') {
      let exp = {};
      exp[attributeType] = this.getBeginsWithAttributeValueAsType(
        expression.begins_with, attributeType);
      result[':v_begins_with_' + name] = exp;
    }
  }

  static getBeginsWithAttributeValueAsType(
    value: any, asType: string) { // eslint-disable-line no-unused-vars
    invariant(value, 'Argument \'value\' is null');
    invariant(asType, 'Argument \'asType\' is null');
    return value;
  }

  static getBeforeAttributeValueAsType(
    value: any, asType: string) {
    invariant(value, 'Argument \'value\' is null');
    invariant(asType, 'Argument \'asType\' is null');

    // TODO this function needs rewriting
    if (typeof value !== 'undefined' && value !== null) {
      return value;
    }

    // Values cannot be null so use a default for each Type
    if (asType === 'S') {
      return 'ZZZZZZZZZZ';
    }

    if (asType === 'N') {
      return Number.MAX_SAFE_INTEGER.toString();
    }

    if (asType === 'B') {
      return new Buffer(uuid.parse('ffffffff-ffff-ffff-ffff-ffffffffffff'));
    }

    throw new Error('NotSupportedError (getAttributeValueAsType)');
  }

  static getAfterAttributeValueAsType(value: any, asType: string) {
    invariant(value, 'Argument \'value\' is null');
    invariant(asType, 'Argument \'asType\' is null');
    let localValue = value;
    // eslint-disable-next-line eqeqeq
    if (typeof localValue === 'undefined' || localValue == null) {
      switch (asType) {
        case 'S':
          localValue = ' ';
          break;
        case 'N':
          localValue = '0';
          break;
        case 'B':
          localValue = uuid.parse('00000000-0000-0000-0000-000000000000');
          break;
      }
    }

    // Values cannot be null so use a default for each Type
    if (asType === 'S') {
      return localValue;
    }

    if (asType === 'N') {
      if (typeof localValue === 'number') {
        localValue = localValue.toString();
      }

      return localValue;
    }

    if (asType === 'B') {
      return new Buffer(localValue);
    }

    throw new Error('NotSupportedError (getAttributeValueAsType)');
  }

  static getKeyConditionExpression(expression: any) {
    invariant(expression, 'Argument \'expression\' is null');
    let names = Object
      .keys(expression)
      .filter(name => name !== 'type');

    if (names.length === 0) {
      return undefined;
    }

    return names
      .map(name => this.getKeyConditionExpressionItem(name, expression[name]))
      .reduce((pre, cur) => pre === '' ? cur : pre + ' AND ' + cur, '');
  }

  static getKeyConditionExpressionItem(name: string, expression: any) {
    invariant(name, 'Argument \'name\' is null');

    if (typeof expression === 'string' ||
      typeof expression === 'number' ||
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

    warning(false, JSON.stringify({
      class: 'QueryResolver',
      function: 'getKeyConditionExpressionItem',
      name, expression
    }));

    throw new Error('NotSupportedError (getKeyConditionExpressionItem)');
  }
}
