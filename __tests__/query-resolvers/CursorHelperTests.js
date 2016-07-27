/* @flow */
import CursorHelper from '../../src/query-helpers/CursorHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('CursorHelperTests', () => {

  it('FromModel', () => {
    let item = {
      type: 'User',
      id: new Buffer('ABC', 'base64'),
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = CursorHelper.fromModel(item);
    let expected = 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fX0=';
    expect(result).to.deep.equal(expected);
  });

  it('ToAWSKey', () => {
    let cursor = 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fX0=';
    let result = CursorHelper.toAWSKey(cursor);
    let expected = {
      id: { B:
        new Buffer('ABC', 'base64'),
      },
    };
    expect(result).to.deep.equal(expected);
  });
});
