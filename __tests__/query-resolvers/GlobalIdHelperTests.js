/* @flow */
import AWSKeyHelper from '../../src/query-helpers/AWSKeyHelper';
import AWSItemHelper from '../../src/query-helpers/AWSItemHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('AWSItemHelper', () => {

  it('toModel', () => {
    let item = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      name: { S: 'Name' },
      number: { N: '99' },
      bool: { BOOL: true },
    };
    // TODO user type+key type
    let result = AWSItemHelper.toModel('MyEdge', item);
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
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
      name: 'Name',
      number: 99,
      bool: true,
    };
    let result = AWSKeyHelper.fromModel(item);
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetAWSKeyFromModelWithStringIndex', () => {
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
      name: 'Name',
      number: 99,
      bool: true,
    };
    let result = AWSKeyHelper.fromModel(item, 'name');
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      name: { S: 'Name' },
    };
    expect(result).to.deep.equal(expected);
  });

  it('GetAWSKeyFromModelWithNumberIndex', () => {
    let item = {
      type: 'MyEdge',
      outID: new Buffer('ABC', 'base64'),
      inID: new Buffer('DEF', 'base64'),
      name: 'Name',
      number: 99,
      bool: true,
    };
    let result = AWSKeyHelper.fromModel(item, 'number');
    let expected = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      number: { N: '99' },
    };
    expect(result).to.deep.equal(expected);
  });
});
