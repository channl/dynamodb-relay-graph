/* @flow */
import ModelHelper from '../../src/query-helpers/ModelHelper';
import GID from '../acceptance/GID';
import type { UserContactEdge } from '../acceptance/GraphQLTypes';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('ModelHelper', () => {

  it('toAWSKey', () => {
    let item: UserContactEdge = {
      node: null,
      cursor: 'cursor',
      id: GID.forUserContactEdge(new Buffer('ABC', 'base64'), new Buffer('DEF', 'base64')),
      outID: GID.forUser(new Buffer('ABC', 'base64')),
      inID: GID.forContact(new Buffer('DEF', 'base64')),
      createDate: 123456,
      userOrder: 'UserName',
      inPhoneNumber: '123456',
    };

    let result = ModelHelper.toAWSKey(item);

    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
    };
    expect(result).to.deep.equal(expected);
  });

  it('toAWSKeyWithStringIndex', () => {
    let item: UserContactEdge = {
      node: null,
      cursor: 'cursor',
      id: GID.forUserContactEdge(new Buffer('ABC', 'base64'), new Buffer('DEF', 'base64')),
      outID: GID.forUser(new Buffer('ABC', 'base64')),
      inID: GID.forContact(new Buffer('DEF', 'base64')),
      createDate: 123456,
      userOrder: 'UserName',
      inPhoneNumber: '123456',
    };
    let result = ModelHelper.toAWSKey(item, 'userOrder');
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      userOrder: { S: 'UserName' },
    };
    expect(result).to.deep.equal(expected);
  });

  it('toAWSKeyWithNumberIndex', () => {
    let item: UserContactEdge = {
      node: null,
      cursor: 'cursor',
      id: GID.forUserContactEdge(new Buffer('ABC', 'base64'), new Buffer('DEF', 'base64')),
      outID: GID.forUser(new Buffer('ABC', 'base64')),
      inID: GID.forContact(new Buffer('DEF', 'base64')),
      createDate: 123456,
      userOrder: 'UserName',
      inPhoneNumber: '123456',
    };
    let result = ModelHelper.toAWSKey(item, 'createDate');
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      createDate: { N: '123456' },
    };
    expect(result).to.deep.equal(expected);
  });

/*
  it('toAWSItem', () => {
    let item = {
      id: toGlobalId('User', 'ABC'),
      bufferValue: new Buffer('ABC', 'base64'),
      stringValue: 'ABC',
      // stringArrayValue: [ 'ABC', 'DEF' ],
      numberValue: 2,
      // numberArrayValue: [ 1, 2, 3 ],
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
      // stringArrayValue: {
      //  SS: [ 'ABC', 'DEF' ],
      // },
      numberValue: {
        N: '2',
      },
      // numberArrayValue: {
      //  NS: [ '1', '2', '3' ],
      // },
      booleanValue: {
        BOOL: true,
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('toGlobalId', () => {
    let item = {
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
      id: toGlobalId('User', 'ID'),
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
      id: 123,
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = ModelHelper.toGlobalId(item);
    let expected = 'VXNlcjpOMTIz';
    expect(result).to.deep.equal(expected);
  });
*/
/*
  it('toGlobalIdWithBooleanId', () => {
    let item = {
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
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
    };
    let result = ModelHelper.toGlobalId(item);
    let expected = 'TXlFZGdlOkJBQkE9X19fQkRFRT0=';
    expect(result).to.deep.equal(expected);
  });

  it('toCursor', () => {
    let item = {
      id: new Buffer('ABC', 'base64'),
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = ModelHelper.toCursor(item);
    let expected = 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fX0=';
    expect(result).to.deep.equal(expected);
  });
*/
});
