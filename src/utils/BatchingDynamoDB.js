/* @flow */
import DynamoDB from '../aws/DynamoDB';
import Delay from '../utils/Delay';
import { invariant, warning } from '../Global';
import type { BatchGetItemRequest, BatchGetItemResponse } from 'aws-sdk-promise';

export default class BatchingDynamoDB {
  _dynamoDB: DynamoDB;
  _timeout: number;
  _initialRetryDelay: number;
  _getNextRetryDelay: (currentRetryDelay: number) => number;

  constructor(dynamoDB: DynamoDB) {
    this._dynamoDB = dynamoDB;
    this._timeout = 60000;
    this._initialRetryDelay = 50;
    this._getNextRetryDelay = curr => curr * 2;
  }

  async batchGetItemAsync(request: BatchGetItemRequest): Promise<BatchGetItemResponse> {

    // BatchGetItem is limited by AWS to 100 items per request
    // so chunk into many requests
    let requests = this.constructor._getSplitRequests(request, 100);
    let responses = await Promise.all(requests.map(this._batchGetItemWithRetryAsync));
    let response = this.constructor._getCombinedResponse(responses);
    let orderedResponse = this.constructor._getOrderedResponse(request, response);
    return orderedResponse;
  }

  async _batchGetItemWithRetryAsync(request: BatchGetItemRequest): Promise<BatchGetItemResponse> {
    try {
      invariant(request, 'Argument \'request\' is null');

      let localRequest = request;
      let fullResponse: BatchGetItemResponse = {
        ConsumedCapacity: [],
        Responses: {},
        UnprocessedKeys: {},
      };

      let startTime = Date.now();
      let retryDelay = this._initialRetryDelay;
      while (!this._isTimeoutExceeded(startTime)) {

        let response = await this._dynamoDB.batchGetItemAsync(localRequest);

        // Append any completed responses into our full response
        fullResponse = this.constructor._getCombinedResponse([ fullResponse, response ]);
        if (Object.keys(response.UnprocessedKeys).length === 0) {
          return fullResponse;
        }

        // Create a new localRequest using unprocessedItems
        warning(false, 'Some items in the batch were unprocessed, retrying in ' +
          retryDelay + 'ms');

        localRequest = { RequestItems: response.UnprocessedKeys };

        // Pause before retrying
        await Delay.delayAsync(retryDelay);

        // Increase the next retry delay using the exponential algorithm
        retryDelay = this._getNextRetryDelay(retryDelay);
      }

      throw new Error('TimeoutError (batchGetItemAsync)');
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDBUnprocessedRetry',
        function: 'batchGetItemAsync',
        request
      }));
      throw ex;
    }
  }

  _isTimeoutExceeded(startTime: number) {
    invariant(typeof startTime === 'number', 'Argument \'startTime\' is not a number');
    return startTime + this._timeout < Date.now();
  }

  static _getSplitRequests(fullRequest: BatchGetItemRequest,
    batchSize: number): BatchGetItemRequest[] {
    invariant(fullRequest, 'Argument \'fullRequest\' is null');

    let requests: any[] = [];
    let request = {RequestItems: {}};
    requests.push(request);

    let count = 0;
    let tableNames: string[] = Object.keys(fullRequest.RequestItems);
    for(let tableName of tableNames) {
      let keys = fullRequest.RequestItems[tableName].Keys;
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = { Keys: []};
      }
      for (let key of keys) {

        if (count >= batchSize) {
          // If we have reached the chunk item limit then create a new request
          request = {RequestItems: {}};
          request.RequestItems[tableName] = { Keys: []};
          requests.push(request);
          count = 0;
        }

        request.RequestItems[tableName].Keys.push(key);
        count++;
      }
    }

    return requests;
  }

  static _getCombinedResponse(responses: BatchGetItemResponse[]): BatchGetItemResponse {
    invariant(responses, 'Argument \'responses\' is null');

    let fullResponse = {
      ConsumedCapacity: [],
      Responses: {},
      UnprocessedKeys: {},
    };

    for(let i = 0; i < responses.length; i++) {
      let response = responses[i];
      Object.keys(response.Responses).forEach(tableName => {
        let responseTable = response.Responses[tableName];
        let fullResponseTable = fullResponse.Responses[tableName];
        if (!fullResponseTable) {
          fullResponseTable = [];
          fullResponse.Responses[tableName] = fullResponseTable;
        }

        // Copy the items over
        responseTable.forEach(item => fullResponseTable.push(item));
      });
    }

    return fullResponse;
  }

  static _getOrderedResponse(request: BatchGetItemRequest,
    response: BatchGetItemResponse): BatchGetItemResponse {
    // TODO Not strictly required at the moment
    return response;
  }
}
