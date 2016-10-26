/* @flow */
import invariant from 'invariant';
import DynamoDB from '../aws/DynamoDB';
import DataModelHelper from '../query-helpers/DataModelHelper';
import DataMapper from '../query-helpers/DataMapper';
import BatchingDynamoDB from '../utils/BatchingDynamoDB';
import Instrument from '../logging/Instrument';
import { fromGlobalId } from 'graphql-relay';
import type { TypedDataModel, Model } from '../flow/Types';

export default class EntityWriter {
  _dynamoDB: BatchingDynamoDB;
  _dataMapper: DataMapper;

  constructor(dynamoDB: DynamoDB, dataMapper: DataMapper) {
    invariant(dynamoDB != null, 'Argument \'dynamoDB\' is null');
    invariant(dataMapper != null, 'Argument \'dynamoDB\' is null');
    this._dynamoDB = new BatchingDynamoDB(dynamoDB);
    this._dataMapper = dataMapper;
  }

  async writeManyAsync(itemsToPut: Model[], itemsToDelete: Model[]): Promise<void> {
    // eslint-disable-next-line max-len, no-caller
    return await Instrument.funcAsync(this, arguments, async () => {
      invariant(itemsToPut != null, 'Argument \'itemsToPut\' is null');
      invariant(itemsToDelete != null, 'Argument \'itemsToDelete\' is null');
      if (itemsToPut.length === 0 && itemsToDelete.length === 0) {
        return;
      }

      // Convert to data model format
      let dataModelsToPut = itemsToPut.map(model => {
        let { type } = fromGlobalId(model.id);
        let dataModel = this._dataMapper.toDataModel(type, model);
        let typedDataModel: TypedDataModel = { type, dataModel };
        return typedDataModel;
      });

      let dataModelsToDelete = itemsToDelete.map(model => {
        let { type } = fromGlobalId(model.id);
        let dataModel = this._dataMapper.toDataModel(type, model);
        let typedDataModel: TypedDataModel = { type, dataModel };
        return typedDataModel;
      });

      // Convert to a dynamo request
      let request = DataModelHelper.toBatchWriteItemRequest(dataModelsToPut, dataModelsToDelete);

      // Execute the batch request
      let response = await this._dynamoDB.batchWriteItemAsync(request);
      invariant(Object.keys(response.UnprocessedItems).length === 0,
        'There were unprocessed items');
    });
  }
}
