/* @flow */
import Graph from '../../src/graph/Graph';
import { log } from '../../src/Global';

export default class App {
  _graph: Graph;

  constructor() {

    let dbConfig = {
      apiVersion: '2012-08-10',
      region: 'us-east-1',
      dynamoDbCrc32: false,
    };

    let dbSchema = {
      tables: [ {
        TableName: 'Users',
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'B' },
          { AttributeName: 'phoneNumber', AttributeType: 'S' },
        ],
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' },
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        GlobalSecondaryIndexes: [ {
          IndexName: 'PhoneNumber',
          KeySchema: [ { AttributeName: 'phoneNumber', KeyType: 'HASH' } ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
          ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
        } ]
      } ]
    };

    this._graph = new Graph(dbConfig, dbSchema);
  }

  async testAsync() {
    let query = {
      type: 'User',
      id: new Buffer('MLVPsHX4SP2y3tJBdcZMOw==', 'base64')
    };
    let connectionArgs = {
      first: 1
    };
    let result = this._graph.v(query, connectionArgs).getAsync();
    log(result);
  }
}
