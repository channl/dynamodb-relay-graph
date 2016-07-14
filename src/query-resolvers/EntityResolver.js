/* @flow */
import DataLoader from 'dataloader';
import ExpressionHelper from '../query-resolvers/ExpressionHelper';
import warning from 'warning';
import RequestHelper from '../query-resolvers/RequestHelper';
import DynamoDB from '../aws/DynamoDB';
import AWSConvertor from '../query-helpers/AWSConvertor';
import { invariant } from '../Global';
import BatchingDynamoDB from '../utils/BatchingDynamoDB';
import type { DynamoDBSchema, BatchGetItemRequest,
  BatchGetItemResponse, AttributeMap } from 'aws-sdk-promise';
import type { QueryExpression, TypeAndKey, RequestMetadata } from '../flow/Types';

export default class EntityResolver {
  _loader: any;
  _convertor: AWSConvertor;
  _dynamoDB: DynamoDB;
  _schema: DynamoDBSchema;
  _batchSize: number;
  _batchingDynamoDB: BatchingDynamoDB;

  constructor(dynamoDB: DynamoDB, schema: DynamoDBSchema) {
    invariant(dynamoDB, 'Argument \'dynamoDB\' is null');
    invariant(schema, 'Argument \'schema\' is null');

    this._loader = new DataLoader(globalIds => this._loadAsync(globalIds));
    this._dynamoDB = dynamoDB;
    this._schema = schema;
    this._batchSize = 100;
    this._batchingDynamoDB = new BatchingDynamoDB(dynamoDB);
  }

  async getAsync(expression: QueryExpression) {
    invariant(expression != null, 'Argument \'expression\' is null');

    // Convert expression to globalId and fetch it
    let globalId = ExpressionHelper.getGlobalIdFromExpression(expression);
    return this._loader.load(globalId);
  }

  async _loadAsync(globalIds: string[]) {
    try {
      invariant(globalIds, 'Argument \'globalIds\' is null');

      // Convert globalIds to types and keys
      let typeAndKeys = globalIds.map(AWSConvertor.getTypeAndAWSKeyFromGlobalId);
      let metaData = {};
      let request = RequestHelper.getFullRequestAndMetaData(typeAndKeys, metaData);
      let response = await this._batchingDynamoDB.batchGetItemAsync(request);

      // Extract the results from response in the correct order
      let results = typeAndKeys
        .map(typeAndKey => {
          let data = this.constructor._toTypeIdAndAWSItem(typeAndKey, metaData, request, response);
          return data.item ? AWSConvertor.getModelFromAWSItem(data.type, data.item) : null;
        });

      return results;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver',
        function: '_loadAsync',
        globalIds
      }));
      throw ex;
    }
  }

  static _toTypeIdAndAWSItem(typeAndKey: TypeAndKey, metaData: RequestMetadata,
    request: BatchGetItemRequest, response: BatchGetItemResponse) {
    try {
      invariant(typeAndKey != null, 'Argument \'typeAndKey\' is null');
      invariant(metaData != null, 'Argument \'metaData\' is null');
      invariant(request != null, 'Argument \'request\' is null');
      invariant(response != null, 'Argument \'response\' is null');

      let tableName = AWSConvertor.getTableName(typeAndKey.type);
      let metaDataItem = metaData[tableName];
      invariant(metaDataItem != null, '\'metaDataItem\' is null');

      let requestItem = request.RequestItems[tableName].Keys;
      let responseItem = response.Responses[tableName];

      // Get the matching request
      let index = metaDataItem
        .typeAndKeys
        .findIndex(i => i.type === typeAndKey.type && this._areKeysEqual(i.key, typeAndKey.key));
      invariant(index >= 0, 'Metadata typeAndKey not found');

      let requestObject = requestItem[index];
      invariant(requestObject != null, 'Request item not found');

      // Get the matching response
      let responseObject = responseItem
        .find(i => this._isMatchingResponseObject(typeAndKey.type, requestObject, i));
      invariant(responseObject != null, 'Response item not found');

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

  static _isMatchingResponseObject(type: string,
    requestObject: AttributeMap, responseObject: AttributeMap): boolean {
    try {
      invariant(type, 'Argument \'type\' is null');
      invariant(requestObject, 'Argument \'requestObject\' is null');
      invariant(responseObject, 'Argument \'responseObject\' is null');

      let requestModel = AWSConvertor.getModelFromAWSItem(type, requestObject);
      let responseModel = AWSConvertor.getModelFromAWSItem(type, responseObject);

      if (type.endsWith('Edge')) {
        return this._areEqual(requestModel.outID, responseModel.outID) &&
          this._areEqual(requestModel.inID, responseModel.inID);
      }

      return this._areEqual(requestModel.id, responseModel.id);
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver',
        function: 'isMatchingResponseObject',
        type, requestObject, responseObject
      }));
      throw ex;
    }
  }

  static _areEqual(a: any, b: any) {
    if (a instanceof Buffer && b instanceof Buffer) {
      return a.equals(b);
    }

    return a === b;
  }

  static _areKeysEqual(a: AttributeMap, b: AttributeMap) {
    // TODO deep equals?
    if (Object.keys(a).length !== Object.keys(a).length) {
      return false;
    }

    for (let key of Object.keys(a)) {
      for (let keyValue of Object.keys(a[key])) {
        let valA = a[key][keyValue];
        let valB = b[key][keyValue];
        if (!this._areEqual(valA, valB)) {
          return false;
        }
      }
    }

    return true;
  }
}
