/* @flow */
import AWSConvertor from '../../src/query-helpers/AWSConvertor';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('AWSConvertorTests', () => {

  it('getAWSItemFromModel', () => {
    let convertor = new AWSConvertor();
    let item = {
      type: 'User',
      id: new Buffer('ABC', 'base64'),
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = convertor.getAWSItemFromModel(item);
    let expected = {
      id: {
        B: new Buffer('ABC', 'base64'),
      },
      firstname: {
        S: 'FirstName'
      },
      lastname: {
        S: 'LastName'
      },
      age: {
        N: '37',
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('ToCursor', () => {
    let convertor = new AWSConvertor();
    let item = {
      type: 'User',
      id: new Buffer('ABC', 'base64'),
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = convertor.toCursor(item);
    let expected = 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fX0=';
    expect(result).to.deep.equal(expected);
  });

  it('FromCursor', () => {
    let convertor = new AWSConvertor();
    let cursor = 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fX0=';
    let result = convertor.fromCursor(cursor);
    let expected = {
      id: { B:
        new Buffer('ABC', 'base64'),
      },
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetTableName', () => {
    let convertor = new AWSConvertor();
    let result = convertor.getTableName('User');
    let expected = 'Users';
    expect(result).to.deep.equal(expected);
  });

  it('GetGlobalIdFromModel', () => {
    let convertor = new AWSConvertor();
    let item = {
      type: 'User',
      id: new Buffer('ABC', 'base64'),
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = convertor.getGlobalIdFromModel(item);
    let expected = 'VXNlcjpCQUJBPQ==';
    expect(result).to.deep.equal(expected);
  });

  it('GetGlobalIdFromModelWithStringId', () => {
    let convertor = new AWSConvertor();
    let item = {
      type: 'User',
      id: 'ID',
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = convertor.getGlobalIdFromModel(item);
    let expected = 'VXNlcjpTSUQ=';
    expect(result).to.deep.equal(expected);
  });

  it('GetGlobalIdFromModelWithNumberId', () => {
    let convertor = new AWSConvertor();
    let item = {
      type: 'User',
      id: 123,
      firstname: 'FirstName',
      lastname: 'LastName',
      age: 37
    };
    let result = convertor.getGlobalIdFromModel(item);
    let expected = 'VXNlcjpOMTIz';
    expect(result).to.deep.equal(expected);
  });

  it('GetGlobalIdFromModelEdge', () => {
    let convertor = new AWSConvertor();
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
    };
    let result = convertor.getGlobalIdFromModel(item);
    let expected = 'TXlFZGdlOkJBQkE9X19fQkRFRT0=';
    expect(result).to.deep.equal(expected);
  });

  it('GetModelFromGlobalId', () => {
    let convertor = new AWSConvertor();
    let globalId = 'VXNlcjpCQUJBPQ==';
    let result = convertor.getModelFromGlobalId(globalId);
    let expected = {
      id: new Buffer('ABC', 'base64'),
      type: 'User',
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetModelWithStringIdFromGlobalId', () => {
    let convertor = new AWSConvertor();
    let globalId = 'VXNlcjpTSUQ=';
    let result = convertor.getModelFromGlobalId(globalId);
    let expected = {
      id: 'ID',
      type: 'User',
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetModelWithNumberIdFromGlobalId', () => {
    let convertor = new AWSConvertor();
    let globalId = 'VXNlcjpOMTIz';
    let result = convertor.getModelFromGlobalId(globalId);
    let expected = {
      id: 123,
      type: 'User',
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetModelFromGlobalIdEdge', () => {
    let convertor = new AWSConvertor();
    let globalId = 'TXlFZGdlOkJBQkE9X19fQkRFRT0=';
    let result = convertor.getModelFromGlobalId(globalId);
    let expected = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetTypeAndAWSKeyFromGlobalId', () => {
    let convertor = new AWSConvertor();
    let globalId = 'TXlFZGdlOkJBQkE9X19fQkRFRT0=';
    let result = convertor.getTypeAndAWSKeyFromGlobalId(globalId);
    let expected = {
      key: {
        outID: { B: new Buffer('ABC', 'base64') },
        inID: { B: new Buffer('DEF', 'base64') },
      },
      type: 'MyEdge',
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetModelFromAWSItem', () => {
    let convertor = new AWSConvertor();
    let item = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      name: { S: 'Name' },
      number: { N: '99' },
      bool: { BOOL: true },
    };
    // TODO user type+key type
    let result = convertor.getModelFromAWSItem('MyEdge', item);
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

  it('GetAWSKeyFromModel', () => {
    let convertor = new AWSConvertor();
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
      name: 'Name',
      number: 99,
      bool: true,
    };
    let result = convertor.getAWSKeyFromModel(item);
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetAWSKeyFromModelWithStringIndex', () => {
    let convertor = new AWSConvertor();
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
      name: 'Name',
      number: 99,
      bool: true,
    };
    let result = convertor.getAWSKeyFromModel(item, 'name');
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      name: { S: 'Name' },
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetAWSKeyFromModelWithNumberIndex', () => {
    let convertor = new AWSConvertor();
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
      name: 'Name',
      number: 99,
      bool: true,
    };
    let result = convertor.getAWSKeyFromModel(item, 'number');
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      number: { N: '99' },
    };
    expect(result).to.deep.equal(expected);
  });


});
