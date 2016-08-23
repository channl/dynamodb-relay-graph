/* @flow */
import ValueHelper from '../../src/query-helpers/ValueHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('ValueHelperTests', () => {
  /*
  it('toAttributeValue', () => {
    let item = [ new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') ];
    let result = ValueHelper.toAttributeValue(item);
    let expected = {
      BS: [ new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') ]
    };
    expect(result).to.deep.equal(expected);
  });
  */
  it('toAttributeValueThrowsOnFunc', () => {
    let item = () => {};
    // $FlowIgnore
    let func = () => ValueHelper.toAttributeValue(item);
    expect(func).to
      .throw('Attribute of type \'function\' could not be converted to an AttributeValue');
  });

  it('areEqualTrueUsingBuffer', () => {
    let a = new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64');
    let b = new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64');
    let result = ValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('areEqualFalseUsingBuffer', () => {
    let a = new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64');
    let b = new Buffer('DEFsHX4SP2y3tJBdcZMOw==', 'base64');
    let result = ValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });

  it('areEqualTrueUsingString', () => {
    let a = 'ABCsHX4SP2y3tJBdcZMOw==';
    let b = 'ABCsHX4SP2y3tJBdcZMOw==';
    let result = ValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('areEqualTrueUsingNumber', () => {
    let a = 2;
    let b = 2;
    let result = ValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('areEqualTrueUsingBoolean', () => {
    let a = true;
    let b = true;
    let result = ValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('areEqualThrowsUsingFuncs', () => {
    let a = () => {};
    let b = () => {};
    // $FlowIgnore
    let func = () => ValueHelper.areEqual(a, b);
    expect(func).to.throw('Value could not be converted to an AttributeValue');
  });

  it('isValueBuffer', () => {
    let value = new Buffer('ABC', 'base64');
    let result = ValueHelper.isValue(value);
    expect(result).to.deep.equal(true);
  });

  it('isValueString', () => {
    let value = 'string';
    let result = ValueHelper.isValue(value);
    expect(result).to.deep.equal(true);
  });

  it('isValueNumber', () => {
    let value = 2;
    let result = ValueHelper.isValue(value);
    expect(result).to.deep.equal(true);
  });

  it('isValueBoolean', () => {
    let value = true;
    let result = ValueHelper.isValue(value);
    expect(result).to.deep.equal(true);
  });

/*
  it('isValueArrayBuffer', () => {
    let value = [ new Buffer('ABC', 'base64'), new Buffer('DEF', 'base64') ];
    let result = ValueHelper.isValue(value);
    expect(result).to.deep.equal(true);
  });

  it('isValueArrayString', () => {
    let value = [ 'ABC', 'DEF' ];
    let result = ValueHelper.isValue(value);
    expect(result).to.deep.equal(true);
  });

  it('isValueArrayNumber', () => {
    let value = [ 1, 2 ];
    let result = ValueHelper.isValue(value);
    expect(result).to.deep.equal(true);
  });
  */

  it('isValueFalse', () => {
    let value = { unkwown: 2 };
    // $FlowIgnore
    let result = ValueHelper.isValue(value);
    expect(result).to.deep.equal(false);
  });
});
