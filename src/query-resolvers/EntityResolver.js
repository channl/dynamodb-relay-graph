import DataLoader from 'dataloader';
import ExpressionHelper from '../graph/ExpressionHelper';
import logger from '../logging/logger';
import BaseResolver from '../query-resolvers/BaseResolver';
import { fromGlobalId, toGlobalId } from 'graphql-relay';

export default class EntityResolver extends BaseResolver {

  constructor(
    dynamoDB,
    schema,
    getTableName,
    getModelFromAWSItem,
    getIdFromAWSKey,
    toAWSKey) {
    super();
    this.loader = new DataLoader(globalIds => this.getManyAsync(globalIds));
    this.dynamoDB = dynamoDB;
    this.schema = schema;
    this.getTableName = getTableName;
    this.getModelFromAWSItem = getModelFromAWSItem;
    this.getIdFromAWSKey = getIdFromAWSKey;
    this.toAWSKey = toAWSKey;
    this.batchSize = 100;
    this.timeout = 60000;
    this.initialRetryDelay = 50;
    this.getNextRetryDelay = curr => curr * 2;
  }

  async getAsync(key) {
    logger.trace('EntityResolver.getAsync');
    if (ExpressionHelper.isNodeGlobalIdExpression(key)) {
      return this.loader.load(key);
    }

    if (ExpressionHelper.isNodeTypeAndIdExpression(key)) {
      return this.loader.load(toGlobalId(key.type, key.id));
    }

    if (ExpressionHelper.isEdgeExpression(key)) {
      return this.loader.load(toGlobalId(key.type, key.outID + key.inID));
    }

    logger.warn('EntityResolver.getAsync', JSON.stringify(key));
    throw new Error('NotSupportedError(getAsync)');
  }

  async getManyAsync(globalIds) {
    try {
      logger.trace('EntityResolver.getManyAsync');

      // Extract the types and ids
      let typeAndIds = globalIds.map(fromGlobalId);

      // Generate a full request and then split into batches
      let metaData = {};
      let fullRequest = this.getFullRequestAndMetaData(typeAndIds, metaData);
      let requestChunks = this.getRequestChunks(fullRequest);

      // Execute each batch query
      logger.debug(
        'Resolving a full batch of ' + this.getRequestItemCount(fullRequest) +
        ' items in ' + requestChunks.length + ' chunks');
      let responses = await Promise.all(
        requestChunks.map(request => this.resolveBatchAsync(request)));
      let fullResponse = this.getFullResponse(responses);

      // Extract the results from response in the correct order
      let typeIdAndAWSItems = typeAndIds.map(typeAndId =>
        this.toTypeIdAndAWSItem(typeAndId, metaData, fullRequest, fullResponse)
      );

      // Convert the results into models
      let results = typeIdAndAWSItems.map(data => {
        return data.item ?
          this.getModelFromAWSItem(data.type, data.item) :
          null;
      });

      return results;
    } catch (ex) {
      logger.warn('EntityResolver.getManyAsync', JSON.stringify(globalIds));
      throw ex;
    }
  }

  async resolveBatchAsync(request) {
    let localRequest = request;
    let fullResponse = { Responses: {} };
    let startTime = Date.now();
    let retryDelay = this.initialRetryDelay;
    while (!this.isTimeoutExceeded(startTime)) {

      logger.debug(
        'Resolving a batch of ' +
        this.getRequestItemCount(localRequest) + ' items');

      let response = await this.dynamoDB.batchGetItemAsync(localRequest);

      // Append any completed responses into our full response
      fullResponse = this.getFullResponse([ fullResponse, response.data ]);
      if (Object.keys(response.data.UnprocessedKeys).length === 0) {
        return fullResponse;
      }

      // Create a new localRequest using unprocessedItems
      logger.warn(
        'Some items in the batch were unprocessed, retrying in ' +
        retryDelay + 'ms');

      localRequest = { RequestItems: response.data.UnprocessedKeys };

      // Pause before retrying
      await this.setTimeoutAsync(retryDelay);

      // Increase the next retry delay using the exponential algorithm
      retryDelay = this.getNextRetryDelay(retryDelay);
    }

    throw new Error('TimeoutError (resolveBatchAsync)');
  }

  getFullResponse(responses) {
    let fullResponse = { Responses: {} };
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
      .map(tn => request.RequestItems[tn].Keys.length)
      .reduce((pre, cur) => pre + cur);
  }

  toTypeIdAndAWSItem(typeAndId, metaData, request, response) {
    try {
      let tableName = this.getTableName(typeAndId.type);
      let metaDataItem = metaData[tableName];
      let requestItem = request.RequestItems[tableName].Keys;
      let responseItem = response.Responses[tableName];

      // Get the matching request
      let index = metaDataItem
        .typesAndIds
        .findIndex(i => i.type === typeAndId.type && i.id === typeAndId.id);
      let requestObject = requestItem[index];
      if (index === -1 || !requestObject) {
        throw new Error('UnexpectedMissingItemError');
      }

      // Get the matching response
      let responseObject = responseItem.find(i =>
        this.isMatchingResponseObject(typeAndId.type, requestObject, i));

      let result = {
        type: typeAndId.type,
        id: typeAndId.id,
        item: responseObject
      };

      return result;

    } catch (ex) {
      logger.warn(
        'EntityResolver.toTypeIdAndAWSItem',
        JSON.stringify({typeAndId, metaData, response, request}));
      throw ex;
    }
  }

  isMatchingResponseObject(type, requestObject, responseObject) {
    try {
      return this.getIdFromAWSKey(type, requestObject) ===
        this.getIdFromAWSKey(type, responseObject);
    } catch (ex) {
      logger.warn(
        'EntityResolver.isMatchingResponseObject',
        JSON.stringify({type, requestObject, responseObject}));
      throw ex;
    }
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
        let tableReq = fullRequest.RequestItems[tableName].Keys;
        if (!request.RequestItems[tableName]) {
          request.RequestItems[tableName] = { Keys: []};
        }
        for (let i in tableReq) {

          if (count >= this.batchSize) {
            // If we have reached the chunk item limit then create a new request
            request = {RequestItems: {}};
            request.RequestItems[tableName] = { Keys: []};
            requests.push(request);
            count = 0;
          }

          request.RequestItems[tableName].Keys.push(tableReq[i]);
          count++;
        }
      }
    }

    return requests;
  }

  getFullRequestAndMetaData(typeAndIds, metaData) {
    // The metadate here stores the mapping between the
    // request item and the type and id
    let request = {RequestItems: {}};
    typeAndIds
      .forEach(typeAndId => {
        let tableName = this.getTableName(typeAndId.type);
        let requestKey = this.toAWSKey(typeAndId.type, typeAndId.id);
        if (request.RequestItems[tableName]) {
          request.RequestItems[tableName].Keys.push(requestKey);
          metaData[tableName].typesAndIds.push(typeAndId);
        } else {
          request.RequestItems[tableName] = { Keys: [ requestKey ] };
          metaData[tableName] = { typesAndIds: [ typeAndId ] };
        }
      });

    return request;
  }
}
