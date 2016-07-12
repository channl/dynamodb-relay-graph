/* @flow */
import { invariant, warning } from '../Global';
import AWSConvertor from '../query-helpers/AWSConvertor';
import type { BatchGetItemRequest, BatchGetItemResponse, ItemKey } from 'aws-sdk-promise';
import type { TypeAndKey, RequestMetadata } from '../flow/Types';

export default class RequestHelper {
  _convertor: AWSConvertor;

  constructor(convertor: AWSConvertor) {
    this._convertor = convertor;
  }

  getFullRequestAndMetaData(typeAndKeys: TypeAndKey[], metaData: RequestMetadata)
    : BatchGetItemRequest {
    invariant(typeAndKeys, 'Argument \'typeAndKeys\' is null');
    invariant(metaData, 'Argument \'metaData\' is null');

    // The metadate here stores the mapping between the
    // request item and the type and id
    let request: BatchGetItemRequest = { RequestItems: {} };
    typeAndKeys
      .forEach(typeAndKey => {
        let tableName = this._convertor.getTableName(typeAndKey.type);
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

  getRequestChunks(fullRequest: BatchGetItemRequest, batchSize: number) {
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

  isMatchingResponseObject(type: string,
    requestObject: ItemKey, responseObject: ItemKey): boolean {
    try {
      invariant(type, 'Argument \'type\' is null');
      invariant(requestObject, 'Argument \'requestObject\' is null');
      invariant(responseObject, 'Argument \'responseObject\' is null');

      let requestModel = this._convertor.getModelFromAWSItem(type, requestObject);
      let responseModel = this._convertor.getModelFromAWSItem(type, responseObject);

      if (type.endsWith('Edge')) {
        return this.areEqual(requestModel.outID, responseModel.outID) &&
          this.areEqual(requestModel.inID, responseModel.inID);
      }

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

  toTypeIdAndAWSItem(typeAndKey: TypeAndKey, metaData: RequestMetadata,
    request: BatchGetItemRequest, response: BatchGetItemResponse) {
    try {
      invariant(typeAndKey, 'Argument \'typeAndKey\' is null');
      invariant(metaData, 'Argument \'metaData\' is null');
      invariant(request, 'Argument \'request\' is null');
      invariant(response, 'Argument \'response\' is null');

      let tableName = this._convertor.getTableName(typeAndKey.type);
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
}
