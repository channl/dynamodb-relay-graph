/* @flow */
import { invariant } from '../Global';
import TypeHelper from '../query-helpers/TypeHelper';
import AWSItemHelper from '../query-helpers/AWSItemHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import type { BatchGetItemRequest, BatchGetItemResponse } from 'aws-sdk-promise';
import type { TypeAndKey, Model } from '../flow/Types';

export default class TypeAndKeyHelper {
  static toBatchGetItemRequest(items: TypeAndKey[]): BatchGetItemRequest {
    invariant(items, 'Argument \'items\' is null');

    let request: BatchGetItemRequest = { RequestItems: {} };
    items
      .forEach(typeAndKey => {
        let tableName = TypeHelper.getTableName(typeAndKey.type);
        if (!request.RequestItems[tableName]) {
          request.RequestItems[tableName] = { Keys: [] };
        }

        request.RequestItems[tableName].Keys.push(typeAndKey.key);
      });

    return request;
  }

  static fromBatchGetItemResponse(response: BatchGetItemResponse,
    typeAndKeys: TypeAndKey[]): Model[] {
    invariant(response != null, 'Argument \'response\' is null');
    invariant(typeAndKeys != null, 'Argument \'typeAndKeys\' is null');

    let result = typeAndKeys.map(typeAndKey => this._getModelFromResponse(typeAndKey, response));
    return result;
  }

  static _getModelFromResponse(typeAndKey: TypeAndKey, response: BatchGetItemResponse): Model {
    let tableName = TypeHelper.getTableName(typeAndKey.type);
    let responseItems = response.Responses[tableName];
    let responseItem = responseItems
      .find(item => AttributeMapHelper.isSupersetOf(item, typeAndKey.key));
    invariant(responseItem != null, 'Response item is null');
    return AWSItemHelper.toModel(typeAndKey.type, responseItem);
  }
}
