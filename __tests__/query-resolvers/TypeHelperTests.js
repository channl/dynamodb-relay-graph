/* @flow */
import TypeHelper from '../../src/query-helpers/TypeHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('TypeHelperTests', () => {

  it('GetTableName', () => {
    let result = TypeHelper.getTableName('User');
    let expected = 'Users';
    expect(result).to.deep.equal(expected);
  });
});
