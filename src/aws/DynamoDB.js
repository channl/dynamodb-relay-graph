/* @flow */
import AWS from 'aws-sdk-promise';
import invariant from 'invariant';
import type { DynamoDBConfig, DescribeTableRequest, DescribeTableResponse, UpdateTableRequest,
  UpdateTableResponse, ListTablesRequest, ListTablesResponse, DeleteTableRequest,
  DeleteTableResponse, ScanRequest, ScanQueryResponse, QueryRequest, PutItemRequest,
  PutItemResponse, GetItemRequest, GetItemResponse, BatchGetItemRequest, BatchGetItemResponse,
  UpdateItemRequest, UpdateItemResponse, DeleteItemRequest, DeleteItemResponse,
  BatchWriteItemRequest, BatchWriteItemResponse,
} from 'aws-sdk-promise';

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
    let res = await this._db.listTables(params).promise();
    return res.data;
  }

  async deleteTableAsync(params:DeleteTableRequest): Promise<DeleteTableResponse> {
    let res = await this._db.deleteTable(params).promise();
    return res.data;
  }

  async createTableAsync(params:any): Promise<any> {
    let res = await this._db.createTable(params).promise();
    return res.data;
  }

  async describeTableAsync(params: DescribeTableRequest): Promise<DescribeTableResponse> {
    invariant(params != null, 'Parameter \'params\' is not set');
    let res = await this._db.describeTable(params).promise();
    return res.data;
  }

  async updateTableAsync(params: UpdateTableRequest): Promise<UpdateTableResponse> {
    invariant(params != null, 'Parameter \'params\' is not set');
    let res = await this._db.updateTable(params).promise();
    return res.data;
  }

  async scanAsync(params: ScanRequest): Promise<ScanQueryResponse> {
    let res = await this._db.scan(params).promise();
    return res.data;
  }

  async queryAsync(params: QueryRequest): Promise<ScanQueryResponse> {
    let res = await this._db.query(params).promise();
    return res.data;
  }

  async putItemAsync(params: PutItemRequest): Promise<PutItemResponse> {
    let res = await this._db.putItem(params).promise();
    return res.data;
  }

  async getItemAsync(params: GetItemRequest): Promise<GetItemResponse> {
    let res = await this._db.getItem(params).promise();
    return res.data;
  }

  async batchGetItemAsync(params: BatchGetItemRequest): Promise<BatchGetItemResponse> {
    let res = await this._db.batchGetItem(params).promise();
    return res.data;
  }

  async batchWriteItemAsync(params: BatchWriteItemRequest): Promise<BatchWriteItemResponse> {
    let res = await this._db.batchWriteItem(params).promise();
    return res.data;
  }

  async deleteItemAsync(params: DeleteItemRequest): Promise<DeleteItemResponse> {
    let res = await this._db.deleteItem(params).promise();
    return res.data;
  }

  async updateItemAsync(params: UpdateItemRequest): Promise<UpdateItemResponse> {
    let res = await this._db.updateItem(params).promise();
    return res.data;
  }
}
