/* @flow */
import DataLoader from 'dataloader';
import ExpressionHelper from '../query-resolvers/ExpressionHelper';
import warning from 'warning';
import BaseResolver from '../query-resolvers/BaseResolver';
import DynamoDB from '../store/DynamoDB';
import AWSConvertor from '../query-helpers/AWSConvertor';
// import { log } from '../Global';

export default class EntityResolver extends BaseResolver {
  loader: any;
  convertor: AWSConvertor;
  dynamoDB: DynamoDB;
  schema: any;
  batchSize: number;
  timeout: number;
  initialRetryDelay: number;
  getNextRetryDelay: any;

  constructor(dynamoDB: DynamoDB, schema: any) {
    super();
    this.loader = new DataLoader(globalIds => this.getManyAsync(globalIds));
    this.convertor = new AWSConvertor();
    this.dynamoDB = dynamoDB;
    this.schema = schema;
    this.batchSize = 100;
    this.timeout = 60000;
    this.initialRetryDelay = 50;
    this.getNextRetryDelay = curr => curr * 2;
  }

  async getAsync(key: any) {
    if (ExpressionHelper.isGlobalIdExpression(key)) {
      return this.loader.load(key);
    }

    if (ExpressionHelper.isModelExpression(key)) {
      return this.loader.load(this.convertor.getGlobalIdFromModel(key));
    }

    if (ExpressionHelper.isModelExpression(key)) {
      return this.loader.load(this.convertor.getGlobalIdFromModel(key));
    }

    warning(false, 'EntityResolver.getAsync', JSON.stringify({
      class: 'EntityResolver',
      function: 'getAsync',
      key
    }));

    throw new Error('NotSupportedError(getAsync)');
  }

  async getManyAsync(globalIds: string[]) {
    try {
      // Extract the types and ids
      let typeAndKeys = globalIds
        .map(id => this.convertor.getTypeAndAWSKeyFromGlobalId(id));

      // Generate a full request and then split into batches
      let metaData = {};
      let fullRequest = this.getFullRequestAndMetaData(typeAndKeys, metaData);
      let requestChunks = this.getRequestChunks(fullRequest);

      // Execute each batch query
      let responses = await Promise.all(
        requestChunks.map(request => this.resolveBatchAsync(request)));

      let fullResponse = this.getFullResponse(responses);

      // Extract the results from response in the correct order
      let typeIdAndAWSItems = typeAndKeys.map(typeAndKey =>
        this.toTypeIdAndAWSItem(typeAndKey, metaData, fullRequest, fullResponse)
      );

      // Convert the results into models
      let results = typeIdAndAWSItems.map(data => {
        return data.item ?
          this.convertor.getModelFromAWSItem(data.type, data.item) :
          null;
      });

      return results;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver',
        function: 'getManyAsync',
        globalIds
      }));
      throw ex;
    }
  }

  async resolveBatchAsync(request: any) {
    try {
      let localRequest = request;
      let fullResponse = { Responses: {} };
      let startTime = Date.now();
      let retryDelay = this.initialRetryDelay;
      while (!this.isTimeoutExceeded(startTime)) {

        let response = await this.dynamoDB.batchGetItemAsync(localRequest);

        // Append any completed responses into our full response
        fullResponse = this.getFullResponse([ fullResponse, response.data ]);
        if (Object.keys(response.data.UnprocessedKeys).length === 0) {
          return fullResponse;
        }

        // Create a new localRequest using unprocessedItems
        warning(false,
          'Some items in the batch were unprocessed, retrying in ' +
          retryDelay + 'ms');

        localRequest = { RequestItems: response.data.UnprocessedKeys };

        // Pause before retrying
        await this.setTimeoutAsync(retryDelay);

        // Increase the next retry delay using the exponential algorithm
        retryDelay = this.getNextRetryDelay(retryDelay);
      }

      throw new Error('TimeoutError (resolveBatchAsync)');
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver',
        function: 'resolveBatchAsync',
        request
      }));
      throw ex;
    }
  }

  getFullResponse(responses: any[]) {
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

  setTimeoutAsync(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  isTimeoutExceeded(startTime: number) {
    return startTime + this.timeout < Date.now();
  }

  getRequestItemCount(request: any) {
    return Object
      .keys(request.RequestItems)
      .map(tn => request.RequestItems[tn].Keys.length)
      .reduce((pre, cur) => pre + cur);
  }

  toTypeIdAndAWSItem(typeAndKey: any, metaData: any,
    request: any, response: any) {
    try {
      let tableName = this.convertor.getTableName(typeAndKey.type);
      let metaDataItem = metaData[tableName];
      let requestItem = request.RequestItems[tableName].Keys;
      let responseItem = response.Responses[tableName];

      // Get the matching request
      let index = metaDataItem
        .typeAndKeys
        .findIndex(i => i.type === typeAndKey.type && i.key.id === typeAndKey.key.id);
      let requestObject = requestItem[index];
      if (index === -1 || !requestObject) {
        throw new Error('UnexpectedMissingItemError');
      }

      // Get the matching response
      let responseObject = responseItem.find(i =>
        this.isMatchingResponseObject(typeAndKey.type, requestObject, i));

      let result = {
        type: typeAndKey.type,
        id: typeAndKey.key.id,
        item: responseObject
      };

      return result;

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver',
        function: 'toTypeIdAndAWSItem',
        typeAndKey, metaData, response, request
      }));

      throw ex;
    }
  }

  isMatchingResponseObject(type: string,
    requestObject: any, responseObject: any) {
    try {

      let requestModel = this.convertor.getModelFromAWSItem(type, requestObject);
      let responseModel = this.convertor.getModelFromAWSItem(type, responseObject);

      if (type.endsWith('Edge')) {
        return this.areEqual(requestModel.outID, responseModel.outID) &&
          this.areEqual(requestModel.inID, responseModel.inID);
      }

      debugger;
      return this.areEqual(requestModel.id, responseModel.id);
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver',
        function: 'isMatchingResponseObject',
        type, requestObject, responseObject
      }));
      throw ex;
    }
  }

  areEqual(a: any, b: any) {
    if (a instanceof Buffer && b instanceof Buffer) {
      return a.equals(b);
    }

    return a === b;
  }

  getRequestChunks(fullRequest: any) {
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

        if (count >= this.batchSize) {
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

  getFullRequestAndMetaData(typeAndKeys: any[], metaData: any) {
    // The metadate here stores the mapping between the
    // request item and the type and id
    let request = {RequestItems: {}};
    typeAndKeys
      .forEach(typeAndKey => {
        let tableName = this.convertor.getTableName(typeAndKey.type);
        if (request.RequestItems[tableName]) {
          request.RequestItems[tableName].Keys.push(typeAndKey.key);
          metaData[tableName].typeAndKeys.push(typeAndKey);
        } else {
          request.RequestItems[tableName] = { Keys: [ typeAndKey.key ] };
          metaData[tableName] = { typeAndKeys: [ typeAndKey ] };
        }
      });

    return request;
  }

  getAttributeType(tableSchema: any, name: string) {
    let def = tableSchema
      .AttributeDefinitions
      .find(a => a.AttributeName === name);
    if (def) {
      return def.AttributeType;
    }

    throw new Error('NotSupportedError (getAttributeType)');
  }
}
