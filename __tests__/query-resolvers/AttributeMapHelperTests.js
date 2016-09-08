/* @flow */
import invariant from 'invariant';
import AttributeMapHelper from '../../src/query-helpers/AttributeMapHelper';
import ModelHelper from '../../src/query-helpers/ModelHelper';
import type { UserContactEdge } from '../acceptance/GraphQLTypes';
import type { AttrMapConvertor, AttrMapValueConvertor } from '../../src/Flow/Types';
import { toGlobalId } from 'graphql-relay';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('AttributeMapHelperTests', () => {
  it('AreEqualTrue', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let b = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let result = AttributeMapHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualFalse', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let b = {
      id: { B: new Buffer('DEFsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let result = AttributeMapHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });

  it('AreEqualFalseUsingNull', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let result = AttributeMapHelper.areEqual(a, null);
    expect(result).to.deep.equal(false);
  });

  it('AreEqualTrueUsingEmpty', () => {
    let a = {};
    let b = {};
    let result = AttributeMapHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('AreEqualFalseUsingSuperset', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let b = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
      surname: { S: 'surname 1'},
    };
    let result = AttributeMapHelper.areEqual(a, b);
    expect(result).to.deep.equal(false);
  });

  it('IsSupersetOfTrue', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
      surname: { S: 'surname 1'},
    };
    let b = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
    };
    let result = AttributeMapHelper.isSupersetOf(a, b);
    expect(result).to.deep.equal(true);
  });

  it('IsSupersetOfWithSame', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let b = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
    };
    let result = AttributeMapHelper.areEqual(a, b);
    expect(result).to.deep.equal(true);
  });

  it('IsSupersetOfFalse', () => {
    let a = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
    };
    let b = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' },
      surname: { S: 'surname 1'},
    };
    let result = AttributeMapHelper.isSupersetOf(a, b);
    expect(result).to.deep.equal(false);
  });

  it('toModel', () => {
    // TODO Need to test all other value types
    let item = {
      outID: { B: new Buffer('ABC', 'base64') },
      inID: { B: new Buffer('DEF', 'base64') },
      createDate: { N: '12345' },
      userOrder: { S: 'UserOrderStringValue' },
      inPhoneNumber: { S: 'InPhoneNumberStringValue'}
    };

    let valueConvertors: AttrMapValueConvertor[] = [
      (typeName, attrName, source, target) => {
        if (typeName === 'UserContactEdge') {
          if (attrName === 'outID') {
            invariant(source.outID.B != null, 'outID was invalid');
            target.outID = toGlobalId('User', source.outID.B.toString('base64'));
            return true;
          }
          if (attrName === 'inID') {
            invariant(source.inID.B != null, 'inID was invalid');
            target.inID = toGlobalId('Contact', source.inID.B.toString('base64'));
            return true;
          }
        }

        return false;
      },
    ];

    let convertors: AttrMapConvertor[] = [
      (typeName, source, target) => {
        if (typeName === 'UserContactEdge') {
          // $FlowIgnore
          target.node = null;
          invariant(typeof target.outID === 'string', 'outID is invalid');
          invariant(typeof target.inID === 'string', 'inID is invalid');
          target.id = toGlobalId('UserContactEdge', target.outID + target.inID);

          // Lastly create the cursor
          target.cursor = ModelHelper.toCursor(target);
        }
      },
    ];

    // TODO user type+key type
    let result = AttributeMapHelper.toModel('UserContactEdge', item, valueConvertors, convertors);
    let expected: UserContactEdge = {
      node: null,
      // eslint-disable-next-line max-len
      cursor: 'eyJvdXRJRCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fSwiaW5JRCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMTIsNjVdfX19',
      id: 'VXNlckNvbnRhY3RFZGdlOlZYTmxjanBCUWtFOVEyOXVkR0ZqZERwRVJVVTk=',
      outID: 'VXNlcjpBQkE9',
      inID: 'Q29udGFjdDpERUU9',
      createDate: 12345,
      userOrder: 'UserOrderStringValue',
      inPhoneNumber: 'InPhoneNumberStringValue',
    };
    expect(result).to.deep.equal(expected);
  });
});
