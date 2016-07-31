/* @flow */
import TypeHelper from '../../src/query-helpers/TypeHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('TypeHelperTests', () => {

  it('getTableName', () => {
    let result = TypeHelper.getTableName('User');
    let expected = 'Users';
    expect(result).to.deep.equal(expected);
  });

  it('getTypeName', () => {
    let result = TypeHelper.getTypeName('Users');
    let expected = 'User';
    expect(result).to.deep.equal(expected);
  });

  it('getTypeMaxValue', () => {
    let func = () => TypeHelper.getTypeMaxValue('X');
    expect(func).to.throws('Type was invalid');
  });

  it('getTypeMinValue', () => {
    let func = () => TypeHelper.getTypeMinValue('X');
    expect(func).to.throws('Type was invalid');
  });
});
