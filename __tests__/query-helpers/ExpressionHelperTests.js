/* @flow */
import ExpressionHelper from '../../src/query-helpers/ExpressionHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('ExpressionHelperTests', () => {
/*
  it('isGlobalIdExpressionIsTrueForStrings', () => {
    let result = ExpressionHelper.isGlobalIdExpression('GLOBALID');
    expect(result).to.equal(true);
  });
*/
  it('isGlobalIdExpressionIsFalseForNode', () => {
    let result = ExpressionHelper.isGlobalIdExpression({ type: 'type', id: 'id' });
    expect(result).to.equal(false);
  });

  it('isModelExpressionReturnsTrue', () => {
    let result = ExpressionHelper.isModelExpression({ type: 'type', id: 'id' });
    expect(result).to.equal(true);

    result = ExpressionHelper.isModelExpression({ type: 'type', outID: 'id', inID: 'id' });
    expect(result).to.equal(true);
  });
/*
  it('isModelExpressionReturnsFalse', () => {
    let result = ExpressionHelper.isModelExpression('GLOBALID');
    expect(result).to.equal(false);

    result = ExpressionHelper.isModelExpression({ type: 'type' });
    expect(result).to.equal(false);
  });
*/
  it('isNodeModelExpressionReturnsTrueForNode', () => {
    let result = ExpressionHelper.isNodeModelExpression({ type: 'type', id: 'id' });
    expect(result).to.equal(true);
  });
/*
  it('isNodeModelExpressionReturnsFalseForString', () => {
    let result = ExpressionHelper.isNodeModelExpression('GLOBALID');
    expect(result).to.equal(false);
  });
*/
  it('isNodeModelExpressionReturnsFalseForEdge', () => {
    let result = ExpressionHelper.isNodeModelExpression({
      type: 'type', outID: 'outID', inID: 'inID' });
    expect(result).to.equal(false);
  });

  it('isEdgeModelExpressionReturnsTrue', () => {
    let result = ExpressionHelper.isEdgeModelExpression({ type: 'type', outID: 'id', inID: 'id' });
    expect(result).to.equal(true);
  });
/*
  it('isEdgeModelExpressionReturnsFalseForString', () => {
    let result = ExpressionHelper.isEdgeModelExpression('GLOBALID');
    expect(result).to.equal(false);
  });
*/
  it('isEdgeModelExpressionReturnsFalseForNode', () => {
    let result = ExpressionHelper.isEdgeModelExpression({ type: 'type', id: 'id' });
    expect(result).to.equal(false);
  });

  it('isTypeOnlyExpressionReturnsTrue', () => {
    let result = ExpressionHelper.isTypeOnlyExpression({ type: 'type' });
    expect(result).to.equal(true);
  });

  it('isTypeOnlyExpressionFalseForNode', () => {
    let result = ExpressionHelper.isTypeOnlyExpression({ type: 'type', id: 'id' });
    expect(result).to.equal(false);
  });
});
