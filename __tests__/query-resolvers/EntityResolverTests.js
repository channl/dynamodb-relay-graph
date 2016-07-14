/* @flow */
import EntityResolver from '../../src/query-resolvers/EntityResolver';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('EntityResolverTests', () => {

  it('ToTypeIdAndAWSItem', () => {
    let request = {
      RequestItems: {
        Users: {
          Keys: [ {
            id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
          } ],
        },
      },
    };
    let response = {
      ConsumedCapacity: [],
      Responses: {
        Users: [ {
          id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
          name: { S: 'Name' },
        } ],
      },
      UnprocessedKeys: {},
    };
    let typeAndKey = {
      type: 'User',
      key: {
        id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      },
    };
    let metadata = {
      Users: {
        typeAndKeys: [
          {
            type: 'User',
            key: {
              id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
            },
          },
        ],
      }
    };
    let expected = {
      type: 'User',
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      item: {
        id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
        name: { S: 'Name' },
      },
    };
    let result = EntityResolver._toTypeIdAndAWSItem(typeAndKey, metadata, request, response);
    expect(result).to.deep.equal(expected);
  });

  it('IsMatchingResponseObjectTrue', () => {
    let requestObject = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let responseObject = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let result = EntityResolver._isMatchingResponseObject('User', requestObject, responseObject);
    expect(result).to.deep.equal(true);
  });

  it('IsMatchingResponseObjectFalse', () => {
    let requestObject = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let responseObject = {
      id: { B: new Buffer('DEFsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let result = EntityResolver._isMatchingResponseObject('User', requestObject, responseObject);
    expect(result).to.deep.equal(false);
  });
});
