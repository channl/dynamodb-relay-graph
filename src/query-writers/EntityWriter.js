import logger from '../logging/logger';

export default class EntityWriter {
  constructor(dynamoDB, getTableName, schema) {
    this.dynamoDB = dynamoDB;
    this.getTableName = getTableName;
    this.schema = schema;
    this.batchSize = 25;
    this.timeout = 120000;
    this.initialRetryDelay = 50;
    this.getNextRetryDelay = curr => curr * 2;
  }

  async writeManyAsync(itemsToPut, itemsToDelete, stats) {
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

      // Write each request chunk
      logger.debug('Writing a full batch of ' +
        this.getRequestItemCount(fullRequest) + ' items in ' +
        requestChunks.length + ' chunks');

      // HACK MOVED THIS TO SEQUENTIAL AS IT WAS TIMINGOUT
      // await Promise.all(requestChunks.map(request =>
      // this.writeBatchAsync(request)));
      for(let i = 0; i < requestChunks.length; i++) {
        let request = requestChunks[i];
        await this.writeBatchAsync(request);
      }

    } catch (ex) {
      // TODO Need to implement some kind of best attempt rollback
      logger.warn(
        'EntityWriter.writeManyAsync failed',
        JSON.stringify({itemsToPut, itemsToDelete}));
      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }

  async writeBatchAsync(request) {
    let startTime = Date.now();
    let retryDelay = this.initialRetryDelay;
    let localRequest = request;
    while (!this.isTimeoutExceeded(startTime)) {

      logger.debug('Writing a batch of ' +
        this.getRequestItemCount(localRequest) + ' items');
      let response = await this.dynamoDB.batchWriteItemAsync(localRequest);
      if (Object.keys(response.data.UnprocessedItems).length === 0) {
        return;
      }

      // Create a new request using unprocessedItems
      logger.warn('Some items in the batch were unprocessed, retrying in ' +
        retryDelay + 'ms');
      localRequest = { RequestItems: response.data.UnprocessedItems };

      // Pause before retrying
      await this.setTimeoutAsync(retryDelay);

      // Increase the next retry delay using the exponential algorithm
      retryDelay = this.getNextRetryDelay(retryDelay);
    }

    throw new Error('TimeoutError (writeBatchAsync)');
  }

  setTimeoutAsync(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  isTimeoutExceeded(startTime) {
    return startTime + this.timeout < Date.now();
  }

  getRequestItemCount(request) {
    return Object
      .keys(request.RequestItems)
      .map(tn => request.RequestItems[tn].length)
      .reduce((pre, cur) => pre + cur);
  }

  checkForDuplicateKeys(request) {
    return Object
      .keys(request.RequestItems)
      .forEach(tn => {
        let items = request.RequestItems[tn];
        let dupes = items
          .map(i => JSON.stringify(i))
          .filter((value, index, self) => self.indexOf(value) !== index);
        if (dupes.length > 0) {
          logger.crit('duplicateKeys', JSON.stringify(dupes));
        }
      });
  }

  getRequestChunks(fullRequest) {
    let requests = [];
    let request = {RequestItems: {}};
    requests.push(request);

    let count = 0;
    let tableNames = Object.keys(fullRequest.RequestItems);
    for(let j in tableNames) {
      if ({}.hasOwnProperty.call(tableNames, j)) {
        let tableName = tableNames[j];
        let tableReq = fullRequest.RequestItems[tableName];
        for (let i in tableReq) {

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

          request.RequestItems[tableName].push(tableReq[i]);
          count++;
        }
      }
    }

    return requests;
  }

  getRequest(itemsToPut, itemsToDelete) {
    let request = {RequestItems: {}};

    itemsToPut.forEach(item => {
      let tableName = this.getTableName(item.type);
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = [];
      }

      let tableReq = request.RequestItems[tableName];
      let newItem = {
        PutRequest: {
          Item: item.toAWSItem()
        }
      };
      tableReq.push(newItem);
    });

    itemsToDelete.forEach(item => {
      let tableName = this.getTableName(item.type);
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = [];
      }

      let tableReq = request.RequestItems[tableName];
      let newItem = {
        DeleteRequest: {
          Key: item.toAWSKey(null)
        }
      };
      tableReq.push(newItem);
    });

    return request;
  }
}
