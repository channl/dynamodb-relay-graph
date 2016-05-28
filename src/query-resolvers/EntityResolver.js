/* @flow */
import DataLoader from 'dataloader';
import ExpressionHelper from '../query-resolvers/ExpressionHelper';
import invariant from 'invariant';
import warning from 'warning';
import BaseResolver from '../query-resolvers/BaseResolver';
import { fromGlobalId, toGlobalId } from 'graphql-relay';
import DynamoDB from '../store/DynamoDB';

export default class EntityResolver extends BaseResolver {
  loader: any;
  dynamoDB: DynamoDB;
  schema: any;
  batchSize: number;
  timeout: number;
  initialRetryDelay: number;
  getNextRetryDelay: any;

  constructor(dynamoDB: DynamoDB, schema: any) {
    super();
    this.loader = new DataLoader(globalIds => this.getManyAsync(globalIds));
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
      return this.loader.load(this.getGlobalIdFromModel(key));
    }

    if (ExpressionHelper.isModelExpression(key)) {
      return this.loader.load(this.getGlobalIdFromModel(key));
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
        .map(id => this.getTypeAndAWSKeyFromGlobalId(id));

      // Generate a full request and then split into batches
      let metaData = {};
      let fullRequest = this.getFullRequestAndMetaData(typeAndKeys, metaData);
      let requestChunks = this.getRequestChunks(fullRequest);

/*      // logger.debug(
        'Resolving a full batch of ' + this.getRequestItemCount(fullRequest) +
        ' items in ' + requestChunks.length + ' chunks');
*/
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
          this.getModelFromAWSItem(data.type, data.item) :
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
    let localRequest = request;
    let fullResponse = { Responses: {} };
    let startTime = Date.now();
    let retryDelay = this.initialRetryDelay;
    while (!this.isTimeoutExceeded(startTime)) {

/*
      // logger.debug(
        'Resolving a batch of ' +
        this.getRequestItemCount(localRequest) + ' items');
*/

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

  toTypeIdAndAWSItem(typeAndId: any, metaData: any,
    request: any, response: any) {
    try {
      let tableName = this.getTableName(typeAndId.type);
      let metaDataItem = metaData[tableName];
      let requestItem = request.RequestItems[tableName].Keys;
      let responseItem = response.Responses[tableName];

      // Get the matching request
      let index = metaDataItem
        .typeAndKeys
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
      warning(false, JSON.stringify({
        class: 'EntityResolver',
        function: 'toTypeIdAndAWSItem',
        typeAndId, metaData, response, request
      }));

      throw ex;
    }
  }

  isMatchingResponseObject(type: string,
    requestObject: any, responseObject: any) {
    try {

      if (requestObject.id) {
        return requestObject.id.B.equals(responseObject.id.B);
      }

      if (requestObject.outID && requestObject.inID) {
        return requestObject.outID.B.equals(responseObject.outID.B) &&
          requestObject.inID.B.equals(responseObject.inID.B);
      }

      invariant(false, 'NotSupportedError(isMatchingResponseObject)');
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver',
        function: 'isMatchingResponseObject',
        type, requestObject, responseObject
      }));
      throw ex;
    }
  }

  getRequestChunks(fullRequest: any) {
    let requests: any[] = [];
    let request = {RequestItems: {}};
    requests.push(request);

    let count = 0;
    let tableNames: string[] = Object.keys(fullRequest.RequestItems);
    for(let tableName of tableNames) {
      let tableReq = fullRequest.RequestItems[tableName].Keys;
      if (!request.RequestItems[tableName]) {
        request.RequestItems[tableName] = { Keys: []};
      }
      for (let i of tableReq) {

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

    return requests;
  }

  getFullRequestAndMetaData(typeAndKeys: any[], metaData: any) {
    // The metadate here stores the mapping between the
    // request item and the type and id
    let request = {RequestItems: {}};
    typeAndKeys
      .forEach(typeAndKey => {
        let tableName = this.getTableName(typeAndKey.type);
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

  getGlobalIdFromModel(model: any) {
    try {
      invariant(model, 'Argument \'model\' is null');

      if (model.type.endsWith('Edge')) {
        return toGlobalId(model.type, model.outID.toString('base64') +
          model.inID.toString('base64'));
      }

      return toGlobalId(model.type, model.id.toString('base64'));

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'Graph', function: 'getGlobalIdFromModel',
        model}, null, 2));
      throw ex;
    }
  }

  getModelFromGlobalId(gid: string): any {
    try {
      invariant(gid, 'Argument \'gid\' is null');
      let {type, id} = fromGlobalId(gid);
      if (type.endsWith('Edge')) {
        return {
          type,
          outID: new Buffer(id.slice(0, 36), 'base64'),
          inID: new Buffer(id.slice(36), 'base64')
        };
      }

      return {
        type,
        id: new Buffer(id, 'base64'),
      };
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver', function: 'getModelFromGlobalId',
        gid}, null, 2));
      throw ex;
    }
  }

  getTypeAndAWSKeyFromGlobalId(id: string) {
    try {
      invariant(id, 'Argument \'id\' is null');

      let model = this.getModelFromGlobalId(id);
      if (model.type.endsWith('Edge')) {
        return {
          type: model.type,
          key: {
            outID: { B: model.outID },
            inID: { B: model.inID }
          }
        };
      }

      return {
        type: model.type,
        key: {
          id: { B: model.id },
        }
      };

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver', function: 'getTypeAndAWSKeyFromGlobalId',
        id}, null, 2));
      throw ex;
    }
  }

  getModelFromAWSItem(type: string, item: any): any {
    try {
      let model = { type };

      for (let name of item) {
        if ({}.hasOwnProperty.call(item, name)) {
          let attr = item[name];
          if (typeof attr.S !== 'undefined') {
            model[name] = item[name].S;
          } else if (typeof attr.N !== 'undefined') {
            model[name] = item[name].N;
          } else if (typeof attr.B !== 'undefined') {
            model[name] = item[name].B;
          } else if (typeof attr.BOOL !== 'undefined') {
            model[name] = item[name].BOOL;
          }
        }
      }

      return model;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver',
        function: 'getModelFromAWSItem',
        type, item
      }));
      throw ex;
    }
  }

  getAWSKeyFromModel(item: any, indexedByAttributeName: string) {
    try {
      invariant(item, 'Argument \'item\' is null');

      let key = null;
      if (item.type.endsWith('Edge')) {
        key = {
          outID: { B: item.outID },
          inID: { B: item.inID },
        };
      } else {
        key = {
          id: { B: item.id },
        };
      }

      if (typeof indexedByAttributeName !== 'undefined') {
        key[indexedByAttributeName] = {};

        let tableName = this.getTableName(item.type);

        let tableSchema = this
          .schema
          .tables
          .find(ts => ts.TableName === tableName);

        let attributeType = this.getAttributeType(
          tableSchema, indexedByAttributeName);

        key[indexedByAttributeName][attributeType] =
          item[indexedByAttributeName].toString();
      }

      return key;

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver', function: 'getAWSKeyFromModel',
        item, indexedByAttributeName}, null, 2));
      throw ex;
    }
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

  getTableName(type: string) {
    return type + 's';
  }
}
