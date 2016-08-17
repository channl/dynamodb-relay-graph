/* @flow */
import { invariant } from '../Global';
import DynamoDB from '../aws/DynamoDB';
import ModelHelper from '../query-helpers/ModelHelper';
import BatchingDynamoDB from '../utils/BatchingDynamoDB';
import Instrument from '../utils/Instrument';
import type { Model } from '../flow/Types';

export default class EntityWriter {
  _dynamoDB: BatchingDynamoDB;
  /*
  convertor: TypeHelper;
  batchSize: number;
  timeout: number;
  initialRetryDelay: number;
  getNextRetryDelay: (curr: number) => number;
  */

  constructor(dynamoDB: DynamoDB) {
    invariant(dynamoDB, 'Argument \'dynamoDB\' is null');

    this._dynamoDB = new BatchingDynamoDB(dynamoDB);
    /*
    this.convertor = new TypeHelper();
    this.batchSize = 25;
    this.timeout = 120000;
    this.initialRetryDelay = 50;
    this.getNextRetryDelay = curr => curr * 2;
    */
  }

  async writeManyAsync(itemsToPut: Model[], itemsToDelete: Model[]): Promise {
    return await Instrument.funcAsync(this, async () => {
      invariant(itemsToPut != null, 'Argument \'itemsToPut\' is null');
      invariant(itemsToDelete != null, 'Argument \'itemsToDelete\' is null');
      if (itemsToPut.length === 0 && itemsToDelete.length === 0) {
        return;
      }

      // Convert to a dynamo request
      let request = ModelHelper.toBatchWriteItemRequest(itemsToPut, itemsToDelete);

      // Execute the batch request
      let response = await this._dynamoDB.batchWriteItemAsync(request);
      invariant(Object.keys(response.UnprocessedItems).length === 0,
        'There were unprocessed items');
    });
  }
}
