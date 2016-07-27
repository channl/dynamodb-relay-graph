/* @flow */
import AWSItemHelper from '../../src/query-helpers/AWSItemHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('AWSItemHelperTests', () => {

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
});
