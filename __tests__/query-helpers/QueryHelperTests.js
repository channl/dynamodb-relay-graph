/* @flow */
import QueryHelper from '../../src/query-helpers/QueryHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';
// import type { DynamoDBKeySchema } from 'aws-sdk-promise';

describe('ResolverHelperTests', () => {

  it('GetExclusiveStartKeyFirst', () => {
    let connectionArgs = { first: 2 };
    let result = QueryHelper.getExclusiveStartKey(connectionArgs);
    let expected;
    expect(result).to.deep.equal(expected);
  });

  it('GetExclusiveStartKeyFirstAfter', () => {
    let connectionArgs = {
      first: 2,
      after: 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fX0='
    };
    let result = QueryHelper.getExclusiveStartKey(connectionArgs);
    let expected = {
      id: { B:
        new Buffer('ABC', 'base64'),
      },
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetExclusiveStartKeyLast', () => {
    let connectionArgs = { last: 2 };
    let result = QueryHelper.getExclusiveStartKey(connectionArgs);
    let expected;
    expect(result).to.deep.equal(expected);
  });

  it('GetExclusiveStartKeyLastBefore', () => {
    let connectionArgs = {
      last: 2,
      before: 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fX0='
    };
    let result = QueryHelper.getExclusiveStartKey(connectionArgs);
    let expected = {
      id: { B:
        new Buffer('ABC', 'base64'),
      },
    };
    expect(result).to.deep.equal(expected);
  });

  it('isForwardScanFirst', () => {
    let connectionArgs = { first: 2 };
    let result = QueryHelper.isForwardScan(connectionArgs);
    let expected = true;
    expect(result).to.equal(expected);
  });

  it('isForwardScanLast', () => {
    let connectionArgs = { last: 2 };
    let result = QueryHelper.isForwardScan(connectionArgs);
    let expected = false;
    expect(result).to.equal(expected);
  });

  it('getScanIndexForwardFirst', () => {
    let connectionArgs = { first: 2 };
    let result = QueryHelper.getScanIndexForward(connectionArgs);
    let expected = true;
    expect(result).to.equal(expected);
  });

  it('getScanIndexForwardFirstOrderDesc', () => {
    let connectionArgs = { first: 2, orderDesc: true };
    let result = QueryHelper.getScanIndexForward(connectionArgs);
    let expected = false;
    expect(result).to.equal(expected);
  });

  it('getScanIndexForwardLast', () => {
    let connectionArgs = { first: 2 };
    let result = QueryHelper.getScanIndexForward(connectionArgs);
    let expected = true;
    expect(result).to.equal(expected);
  });

  it('getScanIndexForwardLastOrderDesc', () => {
    let connectionArgs = { first: 2, orderDesc: true };
    let result = QueryHelper.getScanIndexForward(connectionArgs);
    let expected = false;
    expect(result).to.equal(expected);
  });

  it('getLimitFirst', () => {
    let connectionArgs = { first: 2 };
    let result = QueryHelper.getLimit(connectionArgs);
    let expected = 2;
    expect(result).to.equal(expected);
  });

  it('getLimitLast', () => {
    let connectionArgs = { last: 2 };
    let result = QueryHelper.getLimit(connectionArgs);
    let expected = 2;
    expect(result).to.equal(expected);
  });

  /*
  it('getExpressionAttributeNames', () => {
    let expression = {};
    let connectionArgs = {};
    let include = [];
    let result = QueryHelper.getExpressionAttributeNames(expression, connectionArgs, include);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getIndexSchema', () => {
    let expression = {};
    let connectionArgs = {};
    let tableSchema = {};
    let result = QueryHelper.getIndexSchema(expression, connectionArgs, tableSchema);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('isKeySchemaSatisfied', () => {
    let proposed: DynamoDBKeySchema = [];
    let required: ?DynamoDBKeySchema = [];
    let result = QueryHelper.isKeySchemaSatisfied(proposed, required);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getExpressionKeyType', () => {
    let expression = {};
    let result = QueryHelper.getExpressionKeyType(expression);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getProjectionExpression', () => {
    let expression = {};
    let connectionArgs = {};
    let include = [];
    let result = QueryHelper.getProjectionExpression(expression, connectionArgs, include);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getExpressionAttributeName', () => {
    let name = '';
    let result = QueryHelper.getExpressionAttributeName(name);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getExpressionAttributeValues', () => {
    let result = QueryHelper.getExpressionAttributeValues();
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getExpressionAttributeValue', () => {
    let name = '';
    let expression = {};
    let result = {};
    let tableSchema = {};
    QueryHelper.getExpressionAttributeValue(name, expression, result, tableSchema);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getBeginsWithAttributeValueAsType', () => {
    let value = '';
    let asType = '';
    let result = QueryHelper.getBeginsWithAttributeValueAsType(value, asType);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getBeforeAttributeValueAsType', () => {
    let value = '';
    let asType = '';
    let result = QueryHelper.getBeforeAttributeValueAsType(value, asType);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getAfterAttributeValueAsType', () => {
    let value = '';
    let asType = '';
    let result = QueryHelper.getAfterAttributeValueAsType(value, asType);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getKeyConditionExpression', () => {
    let expression = {};
    let result = QueryHelper.getKeyConditionExpression(expression);
    let expected = {};
    expect(result).to.equal(expected);
  });

  it('getKeyConditionExpressionItem', () => {
    let name = '';
    let expression = {};
    let result = QueryHelper.getKeyConditionExpressionItem(name, expression);
    let expected = {};
    expect(result).to.equal(expected);
  });
*/
});
