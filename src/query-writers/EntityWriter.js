/* @flow */
import { warning, invariant } from '../Global';
import DynamoDB from '../aws/DynamoDB';
import TypeHelper from '../query-helpers/TypeHelper';
import AWSKeyHelper from '../query-helpers/AWSKeyHelper';
import ModelHelper from '../query-helpers/ModelHelper';
import type { BatchWriteItemRequest } from 'aws-sdk-promise';

export default class EntityWriter {
  dynamoDB: DynamoDB;
  convertor: TypeHelper;
  batchSize: number;
  timeout: number;
  initialRetryDelay: number;
  getNextRetryDelay: (curr: number) => number;

  constructor(dynamoDB: DynamoDB) {
    invariant(dynamoDB, 'Argument \'dynamoDB\' is null');

    this.dynamoDB = dynamoDB;
    this.convertor = new TypeHelper();
    this.batchSize = 25;
    this.timeout = 120000;
    this.initialRetryDelay = 50;
    this.getNextRetryDelay = curr => curr * 2;
  }

  async writeManyAsync(
    itemsToPut: any[],
    itemsToDelete: any[],
    stats: ?any): Promise {
    invariant(itemsToPut, 'Argument \'itemsToPut\' is null');
    invariant(itemsToDelete, 'Argument \'itemsToDelete\' is null');

    if (itemsToPut.length === 0 && itemsToDelete.length === 0) {
      return;
    }

    let sw = null;
    if (stats) {
      sw = stats.timer('EntityWriter.writeManyAsync').start();
    }

    try {
      // Get the full request
      let fullRequest = this.getRequest(itemsToPut, itemsToDelete);

      // Split into chunks
      // this.checkForDuplicateKeys(fullRequest);
      let requestChunks = this.getRequestChunks(fullRequest);

      // HACK MOVED THIS TO SEQUENTIAL AS IT WAS TIMINGOUT
      // await Promise.all(requestChunks.map(request =>
      // this.writeBatchAsync(request)));
      for(let i = 0; i < requestChunks.length; i++) {
        let request = requestChunks[i];
        await this.writeBatchAsync(request);
      }

    } catch (ex) {
      // TODO Need to implement some kind of best attempt rollback
      warning(false, JSON.stringify({
        class: 'EntityWriter',
        function: 'writeManyAsync',
        itemsToPut, itemsToDelete
      }));
      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }

  async writeBatchAsync(request: BatchWriteItemRequest) {
    invariant(request, 'Argument \'request\' is null');

    let startTime = Date.now();
    let retryDelay = this.initialRetryDelay;
    let localRequest = request;
    while (!this.isTimeoutExceeded(startTime)) {

      let response = await this.dynamoDB.batchWriteItemAsync(localRequest);
      if (Object.keys(response.UnprocessedItems).length === 0) {
        return;
      }

      // Create a new request using unprocessedItems
      warning(false, 'Some items in the batch were unprocessed, retrying in ' +
        retryDelay + 'ms');
      localRequest = { RequestItems: response.UnprocessedItems };

      // Pause before retrying
      await this.setTimeoutAsync(retryDelay);

      // Increase the next retry delay using the exponential algorithm
      retryDelay = this.getNextRetryDelay(retryDelay);
    }

    throw new Error('TimeoutError (writeBatchAsync)');
  }

  setTimeoutAsync(ms: number) {
    invariant(typeof ms === 'number', 'Argument \'ms\' is not a number');
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  isTimeoutExceeded(startTime: number) {
    invariant(typeof startTime === 'number', 'Argument \'startTime\' is not a number');
    return startTime + this.timeout < Date.now();
  }

  checkForDuplicateKeys(request: any) {
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

  getRequestChunks(fullRequest: any) {
    try {
      invariant(fullRequest, 'Argument \'fullRequest\' is null');

      let requests: any[] = [];
      let request = {RequestItems: {}};
      requests.push(request);

      let count = 0;
      let tableNames: any = Object.keys(fullRequest.RequestItems);
      for(let tableName of tableNames) {
        let tableRequestItems = fullRequest.RequestItems[tableName];
        for (let tableRequestItem of tableRequestItems) {
          if (count >= this.batchSize) {
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
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityWriter',
        function: 'getRequestChunks',
        fullRequest}, null, 2));
      throw ex;
    }
  }

  getRequest(itemsToPut: any[], itemsToDelete: any[]) {
    let request = {RequestItems: {}};

    itemsToPut.forEach(item => {
      let tableName = TypeHelper.getTableName(item.type);
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = [];
      }

      let tableReq = request.RequestItems[tableName];
      let newItem = {
        PutRequest: {
          Item: ModelHelper.toAWSItem(item)
        }
      };
      tableReq.push(newItem);
    });

    itemsToDelete.forEach(item => {
      let tableName = TypeHelper.getTableName(item.type);
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = [];
      }

      let tableReq = request.RequestItems[tableName];
      let newItem = {
        DeleteRequest: {
          Key: AWSKeyHelper.fromModel(item, null)
        }
      };
      tableReq.push(newItem);
    });

    return request;
  }
}
