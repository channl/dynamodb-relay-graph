/* @flow */
import AWS from 'aws-sdk';
import invariant from 'invariant';
// import log from '../logging/log';
import type { DynamoDBConfig, DescribeTableRequest, DescribeTableResponse, UpdateTableRequest,
  UpdateTableResponse, ListTablesRequest, ListTablesResponse, DeleteTableRequest,
  DeleteTableResponse, ScanRequest, ScanQueryResponse, QueryRequest, PutItemRequest,
  PutItemResponse, GetItemRequest, GetItemResponse, BatchGetItemRequest, BatchGetItemResponse,
  UpdateItemRequest, UpdateItemResponse, DeleteItemRequest, DeleteItemResponse,
  BatchWriteItemRequest, BatchWriteItemResponse,
} from 'aws-sdk';

export default class DynamoDB {
  _db: AWS.DynamoDB;

  constructor(dynamoDBConfig: DynamoDBConfig) {
    invariant(dynamoDBConfig != null, 'Parameter \'dynamoDBConfig\' is not set');
    this._db = new AWS.DynamoDB(dynamoDBConfig);
  }

  static create(region: string): DynamoDB {
    return new DynamoDB({
      region,
      apiVersion: '2012-08-10',
      dynamoDbCrc32: false,
      httpOptions: { timeout: 5000 }
    });
  }

  async listTablesAsync(params: ?ListTablesRequest): Promise<ListTablesResponse> {
    return await this._db.listTables(params).promise();
  }

  async deleteTableAsync(params:DeleteTableRequest): Promise<DeleteTableResponse> {
    return await this._db.deleteTable(params).promise();
  }

  async createTableAsync(params:any): Promise<any> {
    return await this._db.createTable(params).promise();
  }

  async describeTableAsync(params: DescribeTableRequest): Promise<DescribeTableResponse> {
    invariant(params != null, 'Parameter \'params\' is not set');
    return await this._db.describeTable(params).promise();
  }

  async updateTableAsync(params: UpdateTableRequest): Promise<UpdateTableResponse> {
    invariant(params != null, 'Parameter \'params\' is not set');
    return await this._db.updateTable(params).promise();
  }

  async scanAsync(params: ScanRequest): Promise<ScanQueryResponse> {
    return await this._db.scan(params).promise();
  }

  async queryAsync(params: QueryRequest): Promise<ScanQueryResponse> {
    return await this._db.query(params).promise();
  }

  async putItemAsync(params: PutItemRequest): Promise<PutItemResponse> {
    return await this._db.putItem(params).promise();
  }

  async getItemAsync(params: GetItemRequest): Promise<GetItemResponse> {
    return await this._db.getItem(params).promise();
  }

  async batchGetItemAsync(params: BatchGetItemRequest): Promise<BatchGetItemResponse> {
    return await this._db.batchGetItem(params).promise();
  }

  async batchWriteItemAsync(params: BatchWriteItemRequest): Promise<BatchWriteItemResponse> {
    try {
      return await this._db.batchWriteItem(params).promise();
    } catch (ex) {
      // if (ex.message === 'Provided list of item keys contains duplicates') {
        // let firstDuplicate = this._getFirstDuplicate(params);
        // log('WARN: ' + JSON.stringify(firstDuplicate));
      // }
      throw ex;
    }
  }

  async deleteItemAsync(params: DeleteItemRequest): Promise<DeleteItemResponse> {
    return await this._db.deleteItem(params).promise();
  }

  async updateItemAsync(params: UpdateItemRequest): Promise<UpdateItemResponse> {
    return await this._db.updateItem(params).promise();
  }
}
