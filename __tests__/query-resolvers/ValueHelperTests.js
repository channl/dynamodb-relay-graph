/* @flow */
import ValueHelper from '../../src/query-helpers/ValueHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('ValueHelperTests', () => {
  it('AreEqualTrue', () => {
    let a = new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64');
    let b = new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64');
    let result = ValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualFalse', () => {
    let a = new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64');
    let b = new Buffer('DEFsHX4SP2y3tJBdcZMOw==', 'base64');
    let result = ValueHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });
});
