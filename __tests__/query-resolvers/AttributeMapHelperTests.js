/* @flow */
import AttributeMapHelper from '../../src/query-helpers/AttributeMapHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('AttributeMapHelperTests', () => {
  it('AreEqualTrue', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let b = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let result = AttributeMapHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualFalse', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let b = {
      id: { B: new Buffer('DEFsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let result = AttributeMapHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });

  it('AreEqualFalseUsingNull', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let result = AttributeMapHelper.areEqual(a, null);
    expect(result).to.deep.equal(false);
  });

  it('AreEqualTrueUsingEmpty', () => {
    let a = {};
    let b = {};
    let result = AttributeMapHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualFalseUsingSuperset', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let b = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
      surname: { S: 'surname 1'},
    };
    let result = AttributeMapHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });

  it('IsSupersetOfTrue', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
      surname: { S: 'surname 1'},
    };
    let b = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
    };
    let result = AttributeMapHelper.isSupersetOf(a, b);
    expect(result).to.deep.equal(true);
  });

  it('IsSupersetOfWithSame', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let b = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
    };
    let result = AttributeMapHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('IsSupersetOfFalse', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
    };
    let b = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
      surname: { S: 'surname 1'},
    };
    let result = AttributeMapHelper.isSupersetOf(a, b);
    expect(result).to.deep.equal(false);
  });

  it('toModel', () => {
    let item = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      name: { S: 'Name' },
      number: { N: '99' },
      bool: { BOOL: true },
    };
    // TODO user type+key type
    let result = AttributeMapHelper.toModel('MyEdge', item);
    let expected = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
      name: 'Name' ,
      number: 99,
      bool: true,
    };
    expect(result).to.deep.equal(expected);
  });
});
