/* @flow */
import ModelHelper from '../../src/query-helpers/ModelHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('ModelHelper', () => {

  it('toAWSKey', () => {
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
      name: 'Name',
      number: 99,
      bool: true,
    };
    let result = ModelHelper.toAWSKey(item);
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
    };
    expect(result).to.deep.equal(expected);
  });

  it('toAWSKeyWithStringIndex', () => {
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
      name: 'Name',
      number: 99,
      bool: true,
    };
    let result = ModelHelper.toAWSKey(item, 'name');
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      name: { S: 'Name' },
    };
    expect(result).to.deep.equal(expected);
  });

  it('toAWSKeyWithNumberIndex', () => {
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
      name: 'Name',
      number: 99,
      bool: true,
    };
    let result = ModelHelper.toAWSKey(item, 'number');
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      number: { N: '99' },
    };
    expect(result).to.deep.equal(expected);
  });

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

  it('toGlobalId', () => {
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

  it('toGlobalIdWithStringId', () => {
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

  it('toGlobalIdWithNumberId', () => {
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

  it('toGlobalIdWithBooleanId', () => {
    let item = {
      type: 'User',
      id: true,
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let func = () => ModelHelper.toGlobalId(item);
    expect(func).to.throw('Attribute type not supported');
  });

  it('toGlobalIdWithModelEdge', () => {
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
    };
    let result = ModelHelper.toGlobalId(item);
    let expected = 'TXlFZGdlOkJBQkE9X19fQkRFRT0=';
    expect(result).to.deep.equal(expected);
  });

  it('toCursor', () => {
    let item = {
      type: 'User',
      id: new Buffer('ABC', 'base64'),
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = ModelHelper.toCursor(item);
    let expected = 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fX0=';
    expect(result).to.deep.equal(expected);
  });
});
