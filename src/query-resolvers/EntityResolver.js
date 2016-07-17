/* @flow */
import DataLoader from 'dataloader';
import ExpressionHelper from '../query-helpers/ExpressionHelper';
import warning from 'warning';
import DynamoDB from '../aws/DynamoDB';
import AWSConvertor from '../query-helpers/AWSConvertor';
import { invariant } from '../Global';
import BatchingDynamoDB from '../utils/BatchingDynamoDB';
import type { BatchGetItemRequest, AttributeMap } from 'aws-sdk-promise';
import type { QueryExpression, TypeAndKey } from '../flow/Types';

export default class EntityResolver {
  _loader: any;
  _dynamoDB: BatchingDynamoDB;

  constructor(dynamoDB: DynamoDB) {
    invariant(dynamoDB, 'Argument \'dynamoDB\' is null');

    this._loader = new DataLoader(globalIds => this._loadAsync(globalIds));
    this._dynamoDB = new BatchingDynamoDB(dynamoDB);
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
      let request = this.constructor._getRequest(typeAndKeys);
      let response = await this._dynamoDB.batchGetItemAsync(request);
      let result = this.constructor._toResult(response, typeAndKeys);
      // Request and Response are sorted by table so order by original request
      return result;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'EntityResolver',
        function: '_loadAsync',
        globalIds
      }));
      throw ex;
    }
  }

  static _toResult(response, typeAndKeys) {
    let items = Object
      .keys(response.Responses)
      .map(tableName => {
        let responseItems = response.Responses[tableName];
        responseItems.map(item => {
          return {
            item,
            model: AWSConvertor.getModelFromAWSItem(AWSConvertor.getTypeName(tableName), item)
          };
        });
      }
    );

    // TODO
    let result = typeAndKeys.map(i => items.find(item => item === i));
    return result;
  }

  static _getRequest(typeAndKeys: TypeAndKey[]): BatchGetItemRequest {
    invariant(typeAndKeys, 'Argument \'typeAndKeys\' is null');

    // The metadate here stores the mapping between the
    // request item and the type and id
    let request: BatchGetItemRequest = { RequestItems: {} };
    typeAndKeys
      .forEach(typeAndKey => {
        let tableName = AWSConvertor.getTableName(typeAndKey.type);
        if (!request.RequestItems[tableName]) {
          request.RequestItems[tableName] = { Keys: [] };
        }

        request.RequestItems[tableName].Keys.push(typeAndKey.key);
      });

    return request;
  }

  static _areEqual(a: any, b: any) {
    if (a instanceof Buffer && b instanceof Buffer) {
      return a.equals(b);
    }

    return a === b;
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
