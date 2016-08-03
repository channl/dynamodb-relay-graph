/* @flow */
import BatchingDynamoDB from '../../src/utils/BatchingDynamoDB';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('BatchingDynamoDBTests', () => {
/*
  it('GetOrderedResponse', () => {
    let request = {
      RequestItems: {
        Users: {
          Keys: [
            {
              id: { B: new Buffer('ABCsHX4SP2y3tJBdcZMOw==', 'base64') },
            },
            {
              id: { B: new Buffer('DEFPsHX4SP2y3tJBdcZMOw==', 'base64') },
            },
            {
              id: { B: new Buffer('EFGPsHX4SP2y3tJBdcZMOw==', 'base64') },
            },
          ]
        }
      }
    };

    let response = {
      ConsumedCapacity: [],
      Responses: {
        Users: [
          {
            id: { B: new Buffer('EFGPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user 3' }
          },
          {
            id: { B: new Buffer('ABCPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user 1' }
          },
          {
            id: { B: new Buffer('DEFPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user 2' }
          },
        ],
      },
      UnprocessedKeys: {},
    };

    let expected = {
      ConsumedCapacity: [],
      Responses: {
        Users: [
          {
            id: { B: new Buffer('ABCPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user 1' }
          },
          {
            id: { B: new Buffer('DEFPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user 2' }
          },
          {
            id: { B: new Buffer('EFGPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user 3' }
          },
        ],
      },
      UnprocessedKeys: {},
    };

    let result = BatchingDynamoDB._getOrderedResponse(request, response);
    expect(result).to.deep.equal(expected);
  });
  */

  it('GetSplitRequests', () => {
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

    let result = BatchingDynamoDB._getSplitBatchGetItemRequests(fullRequest, 2);
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

  it('GetCombinedResponse', () => {

    let responses = [ {
      ConsumedCapacity: [],
      Responses: {
        Users: [
          {
            id: { B: new Buffer('ABCPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user 1' }
          }
        ]
      },
      UnprocessedKeys: {},
    }, {
      ConsumedCapacity: [],
      Responses: {
        Users: [
          {
            id: { B: new Buffer('DEFPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user 2' }
          }
        ]
      },
      UnprocessedKeys: {},
    } ];

    let expected = {
      ConsumedCapacity: [],
      Responses: {
        Users: [
          {
            id: { B: new Buffer('ABCPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user 1' }
          },
          {
            id: { B: new Buffer('DEFPsHX4SP2y3tJBdcZMOw==', 'base64') },
            username: { S: 'user 2' }
          }
        ],
      },
      UnprocessedKeys: {},
    };

    let result = BatchingDynamoDB._getCombinedBatchGetItemResponse(responses);
    expect(result).to.deep.equal(expected);
  });

});
