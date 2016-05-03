import warning from 'warning';
import stats from '../logging/stats';
import AWS from 'aws-sdk-promise';

export default class DynamoDB {

  constructor(dynamoDBConfig) {
    this.dyn = new AWS.DynamoDB(dynamoDBConfig);
  }

  async listTablesAsync() {
    let sw = stats.timer('Dynamo.listTablesAsync').start();
    try {
      let response = await this.dyn.listTables().promise();
      this.ensureResponseIsValid(response);

      if (response.data.TableNames) {
        return response.data.TableNames;
      }

      return [];
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'listTablesAsync'
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async deleteTableAsync(params) {
    let sw = stats.timer('Dynamo.deleteTableAsync').start();
    try {
      let response = await this.dyn.deleteTable(params).promise();
      this.ensureResponseIsValid(response);
      return response;
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

  async createTableAsync(params) {
    let sw = stats.timer('Dynamo.createTableAsync').start();
    try {
      let response = await this.dyn.createTable(params).promise();
      this.ensureResponseIsValid(response);
      return response;
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

  async describeTableAsync(params) {
    let sw = stats.timer('Dynamo.describeTableAsync').start();
    try {
      let response = await this.dyn.describeTable(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'describeTableAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async updateTableAsync(params) {
    let sw = stats.timer('Dynamo.updateTableAsync').start();
    try {
      let response = await this.dyn.updateTable(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'updateTableAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async scanAsync(params) {
    let sw = stats.timer('Dynamo.scanAsync').start();
    try {
      let response = await this.dyn.scan(params).promise();
      this.ensureResponseIsValid(response);
      return response;
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

  async queryAsync(params) {
    let sw = stats.timer('Dynamo.queryAsync').start();
    try {
      let response = await this.dyn.query(params).promise();
      this.ensureResponseIsValid(response);
      return response;
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

  async putItemAsync(params) {
    let sw = stats.timer('Dynamo.putItemAsync').start();
    try {
      let response = await this.dyn.putItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
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

  async getItemAsync(params) {
    let sw = stats.timer('Dynamo.getItemAsync').start();
    let swTable = stats
      .timer('Dynamo.getItemAsync.' + params.TableName)
      .start();

    try {
      let response = await this.dyn.getItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
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

  async batchGetItemAsync(params) {
    let sw = stats.timer('Dynamo.batchGetItemAsync').start();
    try {
      let response = await this.dyn.batchGetItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
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

  async batchWriteItemAsync(params) {
    let sw = stats.timer('Dynamo.batchWriteItemAsync').start();
    try {
      let response = await this.dyn.batchWriteItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'DynamoDB',
        function: 'batchWriteItemAsync',
        params
      }));
      throw ex;
    } finally {
      sw.end();
    }
  }

  async deleteItemAsync(params) {
    let sw = stats.timer('Dynamo.deleteItemAsync').start();
    try {
      let response = await this.dyn.deleteItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
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

  async updateItemAsync(params) {
    let sw = stats.timer('Dynamo.updateItemAsync').start();
    try {
      let response = await this.dyn.updateItem(params).promise();
      this.ensureResponseIsValid(response);
      return response;
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

  ensureResponseIsValid(response) {
    if (response.httpResponse.statusCode !== 200) {
      let ex = new Error('Error occurred');
      ex.response = response;
      throw ex;
    }
  }
}
