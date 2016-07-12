/* @flow */
import DataLoader from 'dataloader';
import ExpressionHelper from '../query-resolvers/ExpressionHelper';
import warning from 'warning';
import BaseResolver from '../query-resolvers/BaseResolver';
import RequestHelper from '../query-resolvers/RequestHelper';
import DynamoDB from '../store/DynamoDB';
import AWSConvertor from '../query-helpers/AWSConvertor';
import { invariant } from '../Global';
import type { DynamoDBSchema, BatchGetItemResponse } from 'aws-sdk-promise';

export default class EntityResolver extends BaseResolver {
  loader: any;
  convertor: AWSConvertor;
  dynamoDB: DynamoDB;
  schema: DynamoDBSchema;
  batchSize: number;
  timeout: number;
  initialRetryDelay: number;
  getNextRetryDelay: any;
  requestHelper: RequestHelper;

  constructor(dynamoDB: DynamoDB, schema: DynamoDBSchema) {
    super();
    invariant(dynamoDB, 'Argument \'dynamoDB\' is null');
    invariant(schema, 'Argument \'schema\' is null');

    this.loader = new DataLoader(globalIds => this.getManyAsync(globalIds));
    this.convertor = new AWSConvertor();
    this.dynamoDB = dynamoDB;
    this.schema = schema;
    this.batchSize = 100;
    this.timeout = 60000;
    this.initialRetryDelay = 50;
    this.getNextRetryDelay = curr => curr * 2;
    this.requestHelper = new RequestHelper(this.convertor);
  }

  async getAsync(key: any) {
    invariant(key, 'Argument \'key\' is null');

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
      invariant(globalIds, 'Argument \'globalIds\' is null');

      // Extract the types and ids
      let typeAndKeys = globalIds
        .map(id => this.convertor.getTypeAndAWSKeyFromGlobalId(id));

      // Generate a full request and then split into batches
      let metaData = {};
      let fullRequest = this.requestHelper.getFullRequestAndMetaData(typeAndKeys, metaData);
      let requestChunks = this.requestHelper.getRequestChunks(fullRequest, this.batchSize);

      // Execute each batch query
      let responses = await Promise.all(
        requestChunks.map(request => this.resolveBatchAsync(request)));

      let fullResponse = this.getFullResponse(responses);

      // Extract the results from response in the correct order
      let typeIdAndAWSItems = typeAndKeys.map(typeAndKey =>
        this.requestHelper.toTypeIdAndAWSItem(typeAndKey, metaData, fullRequest, fullResponse)
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

  async resolveBatchAsync(request: any): Promise<BatchGetItemResponse> {
    try {
      invariant(request, 'Argument \'request\' is null');

      let localRequest = request;
      let fullResponse: BatchGetItemResponse = {
        ConsumedCapacity: [],
        Responses: {},
        UnprocessedKeys: {},
      };

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

  getFullResponse(responses: BatchGetItemResponse[]): BatchGetItemResponse {
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

  getRequestItemCount(request: any) {
    invariant(request, 'Argument \'request\' is null');
    return Object
      .keys(request.RequestItems)
      .map(tn => request.RequestItems[tn].Keys.length)
      .reduce((pre, cur) => pre + cur);
  }
}
