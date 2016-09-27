/* @flow */
import invariant from 'invariant';
import warning from 'warning';
import AWS from 'aws-sdk-promise';
import { json, stats } from '../Global';
import Instrument from '../utils/Instrument';
import type {
  DynamoDBConfig,
  DescribeTableRequest,
  DescribeTableResponse,
  UpdateTableRequest,
  UpdateTableResponse,
  ListTablesRequest,
  ListTablesResponse,
  DeleteTableRequest,
  DeleteTableResponse,
  ScanRequest,
  ScanQueryResponse,
  QueryRequest,
  PutItemRequest,
  PutItemResponse,
  GetItemRequest,
  GetItemResponse,
  BatchGetItemRequest,
  BatchGetItemResponse,
  UpdateItemRequest,
  UpdateItemResponse,
  DeleteItemRequest,
  DeleteItemResponse,
  BatchWriteItemRequest,
  BatchWriteItemResponse,
} from 'aws-sdk-promise';

export default class DynamoDB {
  _db: AWS.DynamoDB;

  constructor(dynamoDBConfig: DynamoDBConfig) {
    invariant(dynamoDBConfig != null, 'Parameter \'dynamoDBConfig\' is not set');
    this._db = new AWS.DynamoDB(dynamoDBConfig);
  }

  static create(region: string): DynamoDB {
    var dynamoDBConfig = {
      region,
      apiVersion: '2012-08-10',
      dynamoDbCrc32: false,
      httpOptions: { timeout: 5000 }
    };

    return new DynamoDB(dynamoDBConfig);
  }

  async listTablesAsync(params: ?ListTablesRequest): Promise<ListTablesResponse> {
    let sw = stats.timer('DynamoDB.listTablesAsync').start();
    try {
      let res = await this._db.listTables(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'listTablesAsync'
      }, null, json.padding));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async deleteTableAsync(params:DeleteTableRequest): Promise<DeleteTableResponse> {
    let sw = stats.timer('Dynamo.deleteTableAsync').start();
    try {
      let res = await this._db.deleteTable(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'deleteTableAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async createTableAsync(params:any): Promise<any> {
    let sw = stats.timer('Dynamo.createTableAsync').start();
    try {
      let res = await this._db.createTable(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'createTableAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async describeTableAsync(params: DescribeTableRequest): Promise<DescribeTableResponse> {
    let sw = stats.timer('DynamoDB.describeTableAsync').start();
    try {
      invariant(params != null, 'Parameter \'params\' is not set');
      let res = await this._db.describeTable(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'describeTableAsync',
        params
      }, null, json.padding));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async updateTableAsync(params: UpdateTableRequest): Promise<UpdateTableResponse> {
    let sw = stats.timer('DynamoDB.updateTableAsync').start();
    try {
      invariant(params != null, 'Parameter \'params\' is not set');
      let res = await this._db.updateTable(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'updateTableAsync',
        params
      }, null, json.padding));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async scanAsync(params: ScanRequest): Promise<ScanQueryResponse> {
    let sw = stats.timer('Dynamo.scanAsync').start();
    try {
      let res = await this._db.scan(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'scanAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async queryAsync(params: QueryRequest): Promise<ScanQueryResponse> {
    let sw = stats.timer('Dynamo.queryAsync').start();
    try {
      let res = await this._db.query(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'queryAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async putItemAsync(params: PutItemRequest): Promise<PutItemResponse> {
    let sw = stats.timer('Dynamo.putItemAsync').start();
    try {
      let res = await this._db.putItem(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'putItemAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async getItemAsync(params: GetItemRequest): Promise<GetItemResponse> {
    let sw = stats.timer('Dynamo.getItemAsync').start();
    let swTable = stats.timer('Dynamo.getItemAsync.' + params.TableName).start();
    try {
      let res = await this._db.getItem(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'getItemAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
      swTable.end();
    }
  }

  async batchGetItemAsync(params: BatchGetItemRequest): Promise<BatchGetItemResponse> {
    let sw = stats.timer('Dynamo.batchGetItemAsync').start();
    try {
      let res = await this._db.batchGetItem(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'batchGetItemAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async batchWriteItemAsync(params: BatchWriteItemRequest): Promise<BatchWriteItemResponse> {
    return await Instrument.funcAsync(this, async () => {
      let res = await this._db.batchWriteItem(params).promise();
      return res.data;
    });
  }

  async deleteItemAsync(params: DeleteItemRequest): Promise<DeleteItemResponse> {
    let sw = stats.timer('Dynamo.deleteItemAsync').start();
    try {
      let res = await this._db.deleteItem(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'deleteItemAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async updateItemAsync(params: UpdateItemRequest): Promise<UpdateItemResponse> {
    let sw = stats.timer('Dynamo.updateItemAsync').start();
    try {
      let res = await this._db.updateItem(params).promise();
      return res.data;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'updateItemAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }
}
