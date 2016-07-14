/* @flow */
import RequestHelper from '../../src/query-resolvers/RequestHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('RequestHelperTests', () => {

  it('GetFullRequestAndMetaDataReturnsEmptyRequest', () => {
    let typeAndKeys = [];
    let metaData = {};
    let result = RequestHelper.getFullRequestAndMetaData(typeAndKeys, metaData);
    expect(result).to.deep.equal({ RequestItems: {} });
  });

  it('GetFullRequestAndMetaDataReturnsRequest', () => {
    let typeAndKeys = [
      {
        type: 'User',
        key: {
          id: { B: new Buffer('MLVPsHX4SP2y3tJBdcZMOw==', 'base64') },
          username: { S: 'user name' }
        }
      },
      {
        type: 'Contact',
        key: {
          id: { B: new Buffer('ABCPsHX4SP2y3tJBdcZMOw==', 'base64') },
          firstname: { S: 'contact name 1' }
        }
      },
      {
        type: 'Contact',
        key: {
          id: { B: new Buffer('DEFPsHX4SP2y3tJBdcZMOw==', 'base64') },
          firstname: { S: 'contact name 2' }
        }
      }
    ];

    let metaData = {};
    let result = RequestHelper.getFullRequestAndMetaData(typeAndKeys, metaData);
    let expected = {
      RequestItems: {
        Users: {
          Keys: [ {
            id: { B: new Buffer('MLVPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user name' }
          } ]
        },
        Contacts: {
          Keys: [
            {
              id: { B: new Buffer('ABCPsHX4SP2y3tJBdcZMOw==', 'base64') },
              firstname: { S: 'contact name 1' }
            },
            {
              id: { B: new Buffer('DEFPsHX4SP2y3tJBdcZMOw==', 'base64') },
              firstname: { S: 'contact name 2' }
            }
          ]
        }
      }
    };

    expect(result).to.deep.equal(expected);
  });
});
