/* @flow */
import invariant from 'invariant';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import BatchingDynamoDB from '../utils/BatchingDynamoDB';
import DataLoader from 'dataloader';
import DataMapper from '../query-helpers/DataMapper';
import DynamoDB from '../aws/DynamoDB';
import Instrument from '../utils/Instrument';
import DataModelHelper from '../query-helpers/DataModelHelper';
import TypeHelper from '../query-helpers/TypeHelper';
import type { BatchGetItemRequest, BatchGetItemResponse } from 'aws-sdk-promise';
import type { DataModel, TypeAndKey } from '../flow/Types';

export default class EntityResolver {
  _dataLoader: any;
  _dynamoDB: BatchingDynamoDB;
  _dataMapper: DataMapper;

  constructor(dynamoDB: DynamoDB, dataMapper: DataMapper) {
    invariant(dynamoDB, 'Argument \'dynamoDB\' is null');

    this._dataLoader = new DataLoader(globalIds => this._loadAsync(globalIds));
    this._dynamoDB = new BatchingDynamoDB(dynamoDB);
    this._dataMapper = dataMapper;
  }

  async getAsync(globalId: string): Promise<DataModel> {
    invariant(typeof globalId === 'string', 'Argument \'globalId\' is not a string');
    return this._dataLoader.load(globalId);
  }

  async _loadAsync(globalIds: string[]): Promise<DataModel[]> {
    return await Instrument.funcAsync(this, async () => {
      invariant(globalIds, 'Argument \'globalIds\' is null');

      // Convert to type and attribute map
      let typeAndKeys = globalIds.map(gid => {
        let { type, dataModel } = this._dataMapper.toDataModel({ id: gid });
        let key = DataModelHelper.toAWSKey(type, dataModel, null);
        return { type, key };
      });

      // Convert to a dynamo request
      let request = this._toBatchGetItemRequest(typeAndKeys);

      // Execute the batch request
      let response = await this._dynamoDB.batchGetItemAsync(request);

      // Extract the data models in the correct order
      return this._fromBatchGetItemResponse(response, typeAndKeys);
    });
  }

  _toBatchGetItemRequest(items: TypeAndKey[]): BatchGetItemRequest {
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

  _fromBatchGetItemResponse(response: BatchGetItemResponse,
    typeAndKeys: TypeAndKey[]): DataModel[] {
    invariant(response != null, 'Argument \'response\' is null');
    invariant(typeAndKeys != null, 'Argument \'typeAndKeys\' is null');
    let result: DataModel[] = typeAndKeys.map(typeAndKey => {
      let model: ?DataModel = this._getModelFromResponse(typeAndKey, response);
      // $FlowIgnore
      return model;
    });
    return result;
  }

  _getModelFromResponse(typeAndKey: TypeAndKey, response: BatchGetItemResponse): ?DataModel {
    let tableName = TypeHelper.getTableName(typeAndKey.type);
    let responseItems = response.Responses[tableName];
    let responseItem = responseItems
      .find(item => AttributeMapHelper.isSupersetOf(item, typeAndKey.key));
    if (responseItem == null) {
      return null;
    }

    return AttributeMapHelper.toDataModel(typeAndKey.type, responseItem);
  }
}
