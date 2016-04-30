import logger from '../logging/logger';
import stats from '../logging/stats';
import AWS from 'aws-sdk-promise';

export default class DynamoDB {

  constructor(dynamoDBConfig) {
    this.dyn = new AWS.DynamoDB(dynamoDBConfig);
  }

  async listTablesAsync() {
    let sw = stats.timer('Dynamo.listTablesAsync').start();
    try {
      logger.trace('Dynamo.listTablesAsync');
      let response = await this.dyn.listTables().promise();
      this.ensureResponseIsValid(response);

      if (response.data.TableNames) {
        return response.data.TableNames;
      }

      return [];
    } catch (ex) {
      logger.warn('FailedDynamoDBOperation (listTables)');
      throw ex;
    } finally {
      sw.end();
    }
  }

  async deleteTableAsync(params) {
    let sw = stats.timer('Dynamo.deleteTableAsync').start();
    try {
      logger.trace('Dynamo.deleteTableAsync', JSON.stringify(params));
      let response = await this.dyn.deleteTable(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn(
        'FailedDynamoDBOperation (deleteTable)',
        JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async createTableAsync(params) {
    let sw = stats.timer('Dynamo.createTableAsync').start();
    try {
      logger.trace('Dynamo.createTableAsync', JSON.stringify(params));
      let response = await this.dyn.createTable(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn(
        'FailedDynamoDBOperation (createTable)',
        JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async describeTableAsync(params) {
    let sw = stats.timer('Dynamo.describeTableAsync').start();
    try {
      logger.trace('Dynamo.describeTableAsync', params);
      let response = await this.dyn.describeTable(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn(
        'FailedDynamoDBOperation (describeTable)',
        JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async updateTableAsync(params) {
    let sw = stats.timer('Dynamo.updateTableAsync').start();
    try {
      logger.trace('Dynamo.updateTableAsync', params);
      let response = await this.dyn.updateTable(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn(
        'FailedDynamoDBOperation (updateTable)',
        JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async scanAsync(params) {
    let sw = stats.timer('Dynamo.scanAsync').start();
    try {
      logger.trace('Dynamo.scanAsync', params);
      let response = await this.dyn.scan(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn('FailedDynamoDBOperation (scan)', JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async queryAsync(params) {
    let sw = stats.timer('Dynamo.queryAsync').start();
    try {
      logger.trace('Dynamo.queryAsync', JSON.stringify(params));
      let response = await this.dyn.query(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn('FailedDynamoDBOperation (query)', JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async putItemAsync(params) {
    let sw = stats.timer('Dynamo.putItemAsync').start();
    try {
      logger.trace('Dynamo.putItemAsync', JSON.stringify(params));
      let response = await this.dyn.putItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn('FailedDynamoDBOperation (putItem)', JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async getItemAsync(params) {
    let sw = stats.timer('Dynamo.getItemAsync').start();
    let swTable = stats
      .timer('Dynamo.getItemAsync.' + params.TableName)
      .start();

    try {
      logger.trace('Dynamo.getItemAsync', JSON.stringify(params));
      let response = await this.dyn.getItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn('FailedDynamoDBOperation (getItem)', JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
      swTable.end();
    }
  }

  async batchGetItemAsync(params) {
    let sw = stats.timer('Dynamo.batchGetItemAsync').start();
    try {
      logger.trace('Dynamo.batchGetItemAsync', JSON.stringify(params));
      let response = await this.dyn.batchGetItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn(
        'FailedDynamoDBOperation (batchGetItem)',
        JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async batchWriteItemAsync(params) {
    let sw = stats.timer('Dynamo.batchWriteItemAsync').start();
    try {
      logger.trace('Dynamo.batchWriteItemAsync', JSON.stringify(params));
      let response = await this.dyn.batchWriteItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn(
        'FailedDynamoDBOperation (batchWriteItem)',
        JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async deleteItemAsync(params) {
    let sw = stats.timer('Dynamo.deleteItemAsync').start();
    try {
      logger.trace('Dynamo.deleteItemAsync', JSON.stringify(params));
      let response = await this.dyn.deleteItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn(
        'FailedDynamoDBOperation (deleteItem)',
        JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async updateItemAsync(params) {
    let sw = stats.timer('Dynamo.updateItemAsync').start();
    try {
      logger.trace('Dynamo.updateItemAsync', JSON.stringify(params));
      let response = await this.dyn.updateItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      logger.warn(
        'FailedDynamoDBOperation (updateItem)',
        JSON.stringify(params));
      throw ex;
    } finally {
      sw.end();
    }
  }

  ensureResponseIsValid(response) {
    if (response.httpResponse.statusCode !== 200) {
      let ex = new Error('Error occurred');
      ex.response = response;
      throw ex;
    }
  }
}
