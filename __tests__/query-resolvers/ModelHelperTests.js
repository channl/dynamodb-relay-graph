/* @flow */
import ModelHelper from '../../src/query-helpers/ModelHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('ModelHelper', () => {

  it('toAWSItem', () => {
    let item = {
      type: 'User',
      bufferValue: new Buffer('ABC', 'base64'),
      stringValue: 'ABC',
      stringArrayValue: [ 'ABC', 'DEF' ],
      numberValue: 2,
      numberArrayValue: [ 1, 2, 3 ],
      booleanValue: true,
//      booleanArrayValue: [ true, false, true ],
//      objectValue: { a: 'a', b: 'b', c: 'c' },
//      objectArrayValue: [ { a: 'a', b: 'b', c: 'c' }, { d: 'd', e: 'e', f: 'f'} ],
    };
    let result = ModelHelper.toAWSItem(item);
    let expected = {
      bufferValue: {
        B: new Buffer('ABC', 'base64'),
      },
      stringValue: {
        S: 'ABC'
      },
      stringArrayValue: {
        SS: [ 'ABC', 'DEF' ],
      },
      numberValue: {
        N: '2',
      },
      numberArrayValue: {
        NS: [ '1', '2', '3' ],
      },
      booleanValue: {
        BOOL: true,
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetGlobalIdFromModel', () => {
    let item = {
      type: 'User',
      id: new Buffer('ABC', 'base64'),
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = ModelHelper.toGlobalId(item);
    let expected = 'VXNlcjpCQUJBPQ==';
    expect(result).to.deep.equal(expected);
  });

  it('GetGlobalIdFromModelWithStringId', () => {
    let item = {
      type: 'User',
      id: 'ID',
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = ModelHelper.toGlobalId(item);
    let expected = 'VXNlcjpTSUQ=';
    expect(result).to.deep.equal(expected);
  });

  it('GetGlobalIdFromModelWithNumberId', () => {
    let item = {
      type: 'User',
      id: 123,
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = ModelHelper.toGlobalId(item);
    let expected = 'VXNlcjpOMTIz';
    expect(result).to.deep.equal(expected);
  });

  it('GetGlobalIdFromModelEdge', () => {
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
    };
    let result = ModelHelper.toGlobalId(item);
    let expected = 'TXlFZGdlOkJBQkE9X19fQkRFRT0=';
    expect(result).to.deep.equal(expected);
  });
});
