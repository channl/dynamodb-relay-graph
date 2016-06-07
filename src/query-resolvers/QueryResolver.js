/* @flow */
import warning from 'warning';
import uuid from 'node-uuid';
import EntityResolver from '../query-resolvers/EntityResolver';
import DynamoDB from '../store/DynamoDB';

export default class QueryResolver extends EntityResolver {
  constructor(dynamoDB: DynamoDB, schema: any) {
    super(dynamoDB, schema);
  }

  getExclusiveStartKey(connectionArgs: any) {
    if (typeof connectionArgs.first !== 'undefined') {
      return typeof connectionArgs.after === 'undefined' ?
        undefined :
        this.convertor.fromCursor(connectionArgs.after);
    }

    if (typeof connectionArgs.last !== 'undefined') {
      return typeof connectionArgs.before === 'undefined' ?
        undefined :
        this.convertor.fromCursor(connectionArgs.before);
    }

    throw new Error('First or Last must be specified');
  }

  isForwardScan(connectionArgs: any) {
    if (typeof connectionArgs.first !== 'undefined') {
      return true;
    }

    if (typeof connectionArgs.last !== 'undefined') {
      return false;
    }

    throw new Error('First or Last must be specified');
  }

  getScanIndexForward(connectionArgs: any) {
    if (typeof connectionArgs.first !== 'undefined' &&
        typeof connectionArgs.orderDesc !== 'undefined' &&
        connectionArgs.orderDesc) {
      return false;
    }

    if (typeof connectionArgs.first !== 'undefined') {
      return true;
    }

    if (typeof connectionArgs.last !== 'undefined' &&
        typeof connectionArgs.orderDesc !== 'undefined' &&
        connectionArgs.orderDesc) {
      return true;
    }

    if (typeof connectionArgs.last !== 'undefined') {
      return false;
    }

    throw new Error('First or Last must be specified');
  }

  getLimit(connectionArgs: any) {
    if (typeof connectionArgs.first !== 'undefined') {
      return connectionArgs.first;
    }

    if (typeof connectionArgs.last !== 'undefined') {
      return connectionArgs.last;
    }

    throw new Error('First or Last must be specified');
  }

  getExpressionAttributeNames(expression: any,
    connectionArgs: any, include: string[]) {
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

  getIndexSchema(expression: any,
    connectionArgs: any, tableSchema: any) {
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

  isKeySchemaSatisfied(proposed: any, required: any) {
    if (required.length === 0) {
      // If no requirements were specified then
      // the key schema or any index will satisfy the query
      return true;
    }

    // Ensure all required keys are in the proposed key schema
    let hashKeySatisfied = false;
    for(let i in required) {
      if ({}.hasOwnProperty.call(required, i)) {
        let matchingKey = proposed
          .find(attr => attr.AttributeName === required[i].AttributeName);
        if (!matchingKey) {
          return false;
        }

        // '*' KeyType means HASH or RANGE should match
        if (required[i].KeyType !== '*' &&
          required[i].KeyType !== matchingKey.KeyType) {
          return false;
        }

        if (matchingKey.KeyType === 'HASH') {
          hashKeySatisfied = true;
        }
      }
    }

    // The RANGE key will be defaulted if not set but the HASH key must be set
    return hashKeySatisfied;
  }

  getExpressionKeyType(expression: any) {
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

  getProjectionExpression(expression: any,
    connectionArgs: any, include: any) {
    return Object
      .keys(expression)
      .concat(connectionArgs.order)
      .concat(include)
      .filter(name => name !== 'type' && typeof name !== 'undefined')
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(this.getExpressionAttributeName)
      .reduce((pre, cur) => pre === '' ? cur : pre + ', ' + cur, '');
  }

  getExpressionAttributeName(name: string) {
    return '#res' + name;
  }

  getExpressionAttributeValues(expression: any, tableSchema: any) {
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

  getExpressionAttributeValue(name: string,
    expression: any, result: any, tableSchema: any) {
    let attributeType = this.getAttributeType(tableSchema, name);

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

  getBeginsWithAttributeValueAsType(
    value: any, asType: string) { // eslint-disable-line no-unused-vars
    return value;
  }

  getBeforeAttributeValueAsType(
    value: any, asType: string) {
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

  getAfterAttributeValueAsType(value: any, asType: string) {
    let localValue = value;
    if (typeof localValue === 'undefined' || localValue === null) {
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

  getKeyConditionExpression(expression: any) {
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

  getKeyConditionExpressionItem(name: string, expression: any) {
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
