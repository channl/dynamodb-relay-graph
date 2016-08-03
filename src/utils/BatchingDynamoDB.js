/* @flow */
import DynamoDB from '../aws/DynamoDB';
import Delay from '../utils/Delay';
import { invariant, warning } from '../Global';
import type { BatchGetItemRequest, BatchGetItemResponse,
  BatchWriteItemRequest, BatchWriteItemResponse } from 'aws-sdk-promise';

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
    let requests = this.constructor._getSplitBatchGetItemRequests(request, 100);
    let responses = await Promise.all(requests.map(r => this._batchGetItemWithRetryAsync(r)));
    let response = this.constructor._getCombinedBatchGetItemResponse(responses);
    let orderedResponse = this.constructor._getOrderedBatchGetItemResponse(request, response);
    return orderedResponse;
  }

  async batchWriteItemAsync(request: BatchWriteItemRequest): Promise<BatchWriteItemResponse> {

    // BatchWriteItem is limited by AWS to 25 items per request
    // so chunk into many requests
    let requests = this.constructor._getSplitBatchWriteItemRequests(request, 25);

    // HACK MOVED THIS TO SEQUENTIAL AS IT WAS TIMINGOUT
    let responses = [];
    for(let i = 0; i < requests.length; i++) {
      let response = await this._batchWriteItemsWithRetryAsync(requests[i]);
      responses.push(response);
    }

    let response = this.constructor._getCombinedBatchWriteItemResponse(responses);
    return response;
  }

  async _batchGetItemWithRetryAsync(request: BatchGetItemRequest): Promise<BatchGetItemResponse> {
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

      // Append any completed responses into our full response and return if complete
      fullResponse = this.constructor._getCombinedBatchGetItemResponse([ fullResponse, response ]);
      if (Object.keys(response.UnprocessedKeys).length === 0) {
        return fullResponse;
      }

      // Create a new localRequest using unprocessedItems
      warning(false, 'Some items in the batch were unprocessed, retrying in ' + retryDelay + 'ms');
      localRequest = { RequestItems: response.UnprocessedKeys };

      // Pause before retrying
      await Delay.delayAsync(retryDelay);

      // Increase the next retry delay using the exponential algorithm
      retryDelay = this._getNextRetryDelay(retryDelay);
    }

    invariant(false, 'TimeoutError (batchGetItemAsync)');
  }

  async _batchWriteItemsWithRetryAsync(
    request: BatchWriteItemRequest): Promise<BatchWriteItemResponse> {
    invariant(request, 'Argument \'request\' is null');

    let localRequest = request;
    let fullResponse: BatchWriteItemResponse = {
      ConsumedCapacity: [],
      ItemCollectionMetrics: {},
      UnprocessedItems: {},
    };

    let startTime = Date.now();
    let retryDelay = this._initialRetryDelay;
    while (!this._isTimeoutExceeded(startTime)) {

      let response = await this._dynamoDB.batchWriteItemAsync(localRequest);

      // Append any completed responses into our full response and return if complete
      if (Object.keys(response.UnprocessedItems).length === 0) {
        return fullResponse;
      }

      // Create a new request using unprocessedItems
      warning(false, 'Some items in the batch were unprocessed, retrying in ' + retryDelay + 'ms');
      localRequest = { RequestItems: response.UnprocessedItems };

      // Pause before retrying
      await Delay.delayAsync(retryDelay);

      // Increase the next retry delay using the exponential algorithm
      retryDelay = this._getNextRetryDelay(retryDelay);
    }

    throw new Error('TimeoutError (writeBatchAsync)');
  }

  static _checkForDuplicateKeys(request: BatchWriteItemRequest) {
    invariant(request, 'Argument \'request\' is null');
    return Object
      .keys(request.RequestItems)
      .forEach(tn => {
        let items = request.RequestItems[tn];
        let dupes = items
          .map(i => JSON.stringify(i))
          .filter((value, index, self) => self.indexOf(value) !== index);

        invariant(dupes.length === 0, 'duplicateKeys', JSON.stringify(dupes));
      });
  }

  static _getSplitBatchWriteItemRequests(fullRequest: BatchWriteItemRequest, batchSize: number) {
    invariant(fullRequest, 'Argument \'fullRequest\' is null');
    invariant(typeof batchSize === 'number', 'Argument \'batchSize\' is not a number');

    let requests: any[] = [];
    let request = {RequestItems: {}};
    requests.push(request);

    let count = 0;
    let tableNames: any = Object.keys(fullRequest.RequestItems);
    for(let tableName of tableNames) {
      let tableRequestItems = fullRequest.RequestItems[tableName];
      for (let tableRequestItem of tableRequestItems) {
        if (count >= batchSize) {
          // If we have reached the chunk item limit then create a new request
          request = {RequestItems: {}};
          request.RequestItems[tableName] = [];
          requests.push(request);
          count = 0;
        }

        if (typeof request.RequestItems[tableName] === 'undefined') {
          request.RequestItems[tableName] = [];
        }

        request.RequestItems[tableName].push(tableRequestItem);
        count++;
      }
    }

    return requests;
  }

  static _getCombinedBatchWriteItemResponse(
    responses: BatchWriteItemResponse[]): BatchWriteItemResponse {
    invariant(responses, 'Argument \'responses\' is null');

    return {
      ConsumedCapacity: [],
      ItemCollectionMetrics: {},
      UnprocessedItems: {},
    };
  }

  _isTimeoutExceeded(startTime: number) {
    invariant(typeof startTime === 'number', 'Argument \'startTime\' is not a number');
    return startTime + this._timeout < Date.now();
  }

  static _getSplitBatchGetItemRequests(fullRequest: BatchGetItemRequest,
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

  static _getCombinedBatchGetItemResponse(responses: BatchGetItemResponse[]): BatchGetItemResponse {
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

  static _getOrderedBatchGetItemResponse(request: BatchGetItemRequest,
    response: BatchGetItemResponse): BatchGetItemResponse {
    // TODO Not strictly required at the moment
    return response;
  }
}
