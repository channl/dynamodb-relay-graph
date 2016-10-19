/* @flow */
/* eslint-disable max-len */
import DataModelHelper from '../../src/query-helpers/DataModelHelper';
import TestDataMapper from '../acceptance/TestDataMapper';
import type { UserContactEdge } from '../acceptance/GraphQLTypes';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('DataModelHelper', () => {

  it('toAWSKey', () => {
    let dataMapper = new TestDataMapper();
    let outID = dataMapper.id('User', new Buffer('MLVPsHX4SP2y3tJBdcZMOw==', 'base64'));
    let inID = dataMapper.id('Contact', new Buffer('MzBiNTRmYjAtNzVmOC00OGZkLWIyZGUtZDI0MTc1YzY0YzNiXig1NTUpIDU2NC04NTgz', 'base64'));
    let id = dataMapper.id('UserContactEdge', { outID, inID });
    let model: UserContactEdge = {
      node: null,
      cursor: 'cursor',
      id,
      outID,
      inID,
      createDate: 1449176162355,
      userOrder: '1 Kate Bell',
      inPhoneNumber: '(555) 564-8583',
    };

    let dataModel = dataMapper.toDataModel('UserContactEdge', model);
    let result = DataModelHelper.toAWSKey({type: 'UserContactEdge', dataModel});

    let expected = {
      outID: { B: new Buffer('MLVPsHX4SP2y3tJBdcZMOw', 'base64') },
      // eslint-disable-next-line max-len
      inID: { B: new Buffer('MzBiNTRmYjAtNzVmOC00OGZkLWIyZGUtZDI0MTc1YzY0YzNiXig1NTUpIDU2NC04NTgz', 'base64') },
    };
    expect(result).to.deep.equal(expected);
  });

  it('toAWSKeyWithStringIndex', () => {
    let dataMapper = new TestDataMapper();
    let outID = dataMapper.id('User', new Buffer('ABC', 'base64'));
    let inID = dataMapper.id('Contact', new Buffer('DEF', 'base64'));
    let id = dataMapper.id('UserContactEdge', new Buffer('ABC', 'base64'), new Buffer('DEF', 'base64'));
    let model: UserContactEdge = {
      node: null,
      cursor: 'cursor',
      id,
      outID,
      inID,
      createDate: 123456,
      userOrder: 'UserName',
      inPhoneNumber: '123456',
    };
    let dataModel = dataMapper.toDataModel('UserContactEdge', model);
    let result = DataModelHelper.toAWSKey({type: 'UserContactEdge', dataModel}, 'userOrder');
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      userOrder: { S: 'UserName' },
    };
    expect(result).to.deep.equal(expected);
  });

  it('toAWSKeyWithNumberIndex', () => {
    let dataMapper = new TestDataMapper();
    let outID = dataMapper.id('User', new Buffer('ABC', 'base64'));
    let inID = dataMapper.id('Contact', new Buffer('DEF', 'base64'));
    let id = dataMapper.id('UserContactEdge', new Buffer('ABC', 'base64'), new Buffer('DEF', 'base64'));
    let model: UserContactEdge = {
      node: null,
      cursor: 'cursor',
      id,
      outID,
      inID,
      createDate: 123456,
      userOrder: 'UserName',
      inPhoneNumber: '123456',
    };
    let dataModel = dataMapper.toDataModel('UserContactEdge', model);
    let result = DataModelHelper.toAWSKey({type: 'UserContactEdge', dataModel}, 'createDate');
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
