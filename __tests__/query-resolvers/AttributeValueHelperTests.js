/* @flow */
import AttributeValueHelper from '../../src/query-helpers/AttributeValueHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('AttributeValueHelperTests', () => {
  it('AreEqualTrueUsingBuffer', () => {
    let a = { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') };
    let b = { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualTrueUsingBool', () => {
    let a = { BOOL: true };
    let b = { BOOL: true };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualTrueUsingBufferSet', () => {
    let a = { BS: [ new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') ] };
    let b = { BS: [ new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') ] };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualFalseUsingBufferSet', () => {
    let a = { BS: [ new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') ] };
    let b = { BS: [
      new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64'),
      new Buffer('DEFsHX4SP2y3tJBdcZMOw==', 'base64')
    ] };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });

  it('AreEqualTrueUsingList', () => {
    let a = { L: [ true, 'test', 2 ] };
    let b = { L: [ true, 'test', 2 ] };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualFalseUsingDiffLists', () => {
    let a = { L: [ true, 'test', 2 ] };
    let b = { L: [ true, 'test', 2, 1 ] };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });

  it('AreEqualTrueUsingNumber', () => {
    let a = { N: '2' };
    let b = { N: '2' };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualTrueUsingNumberSet', () => {
    let a = { NS: [ '2', '4' ] };
    let b = { NS: [ '2', '4' ] };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualFalseUsingDiffNumberSet', () => {
    let a = { NS: [ '2', '4' ] };
    let b = { NS: [ '2', '4', '6' ] };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });

  it('AreEqualTrueUsingStringSet', () => {
    let a = { SS: [ 'test2', 'test4' ] };
    let b = { SS: [ 'test2', 'test4' ] };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualFalseUsingDiffStringSet', () => {
    let a = { SS: [ 'test2', 'test4' ] };
    let b = { SS: [ 'test2', 'test4', 'test6' ] };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });

  it('AreEqualFalse', () => {
    let a = { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') };
    let b = { B: new Buffer('DEFsHX4SP2y3tJBdcZMOw==', 'base64') };
    let result = AttributeValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });

  it('AreEqualFalseUsingNull', () => {
    let a = { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') };
    let result = AttributeValueHelper.areEqual(a, null);
    expect(result).to.deep.equal(false);
  });

  it('AreEqualThrowsUsingEmpty', () => {
    let a = {};
    let b = {};
    let func = () => AttributeValueHelper.areEqual(a, b);
    expect(func).to.throw('AttributeValue not found or invalid');
  });
});
