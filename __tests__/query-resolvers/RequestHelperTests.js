/* @flow */
import RequestHelper from '../../src/query-resolvers/RequestHelper';
import AWSConvertor from '../../src/query-helpers/AWSConvertor';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('RequestHelperTests', () => {

  it('GetFullRequestAndMetaDataReturnsEmptyRequest', () => {
    let convertor = new AWSConvertor();
    let requestHelper = new RequestHelper(convertor);
    let typeAndKeys = [];
    let metaData = {};
    let result = requestHelper.getFullRequestAndMetaData(typeAndKeys, metaData);
    expect(result).to.deep.equal({ RequestItems: {} });
  });

  it('GetFullRequestAndMetaDataReturnsRequest', () => {
    let convertor = new AWSConvertor();
    let requestHelper = new RequestHelper(convertor);
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
    let result = requestHelper.getFullRequestAndMetaData(typeAndKeys, metaData);
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

  it('GetRequestChunks', () => {
    let convertor = new AWSConvertor();
    let requestHelper = new RequestHelper(convertor);
    let fullRequest = {
      RequestItems: {
        Users: {
          Keys: [
            {
              id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
              username: { S: 'user name 1' }
            },
            {
              id: { B: new Buffer('DEFPsHX4SP2y3tJBdcZMOw==', 'base64') },
              username: { S: 'user name 2' }
            },
            {
              id: { B: new Buffer('EFGPsHX4SP2y3tJBdcZMOw==', 'base64') },
              username: { S: 'user name 3' }
            },
          ]
        }
      }
    };
    let result = requestHelper.getRequestChunks(fullRequest, 2);
    expect(result).to.deep.equal([
      {
        RequestItems: {
          Users: {
            Keys: [
              {
                id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
                username: { S: 'user name 1' }
              },
              {
                id: { B: new Buffer('DEFPsHX4SP2y3tJBdcZMOw==', 'base64') },
                username: { S: 'user name 2' }
              },
            ]
          }
        }
      },
      {
        RequestItems: {
          Users: {
            Keys: [
              {
                id: { B: new Buffer('EFGPsHX4SP2y3tJBdcZMOw==', 'base64') },
                username: { S: 'user name 3' }
              },
            ]
          }
        }
      }
    ]);
  });


  it('IsMatchingResponseObjectTrue', () => {
    let convertor = new AWSConvertor();
    let requestHelper = new RequestHelper(convertor);
    let requestObject = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let responseObject = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let result = requestHelper.isMatchingResponseObject('User', requestObject, responseObject);
    expect(result).to.deep.equal(true);
  });

  it('IsMatchingResponseObjectFalse', () => {
    let convertor = new AWSConvertor();
    let requestHelper = new RequestHelper(convertor);
    let requestObject = {
      id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let responseObject = {
      id: { B: new Buffer('DEFsHX4SP2y3tJBdcZMOw==', 'base64') },
      username: { S: 'user name 1' }
    };
    let result = requestHelper.isMatchingResponseObject('User', requestObject, responseObject);
    expect(result).to.deep.equal(false);
  });

});
