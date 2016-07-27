/* @flow */
import DataLoader from 'dataloader';
import warning from 'warning';
import DynamoDB from '../aws/DynamoDB';
import GlobalIdHelper from '../query-helpers/GlobalIdHelper';
import { invariant } from '../Global';
import BatchingDynamoDB from '../utils/BatchingDynamoDB';
import TypeAndKeyHelper from '../query-helpers/TypeAndKeyHelper';

export default class EntityResolver {
  _dataLoader: any;
  _dynamoDB: BatchingDynamoDB;

  constructor(dynamoDB: DynamoDB) {
    invariant(dynamoDB, 'Argument \'dynamoDB\' is null');

    this._dataLoader = new DataLoader(globalIds => this._loadAsync(globalIds));
    this._dynamoDB = new BatchingDynamoDB(dynamoDB);
  }

  async getAsync(globalId: string) {
    invariant(globalId != null, 'Argument \'globalId\' is null');
    return this._dataLoader.load(globalId);
  }

  async _loadAsync(globalIds: string[]) {
    try {
      invariant(globalIds, 'Argument \'globalIds\' is null');

      // Convert to type and attribute map
      let typeAndKeys = globalIds.map(GlobalIdHelper.toTypeAndAWSKey);

      // Convert to a dynamo request
      let request = TypeAndKeyHelper.toBatchGetItemRequest(typeAndKeys);

      // Execute the batch request
      let response = await this._dynamoDB.batchGetItemAsync(request);

      // Convert to models and return
      let result = TypeAndKeyHelper.fromBatchGetItemResponse(response, typeAndKeys);
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
}
