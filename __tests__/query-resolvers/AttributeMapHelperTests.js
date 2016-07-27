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

});
