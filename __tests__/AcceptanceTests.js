/* @flow */
import Graph from '../src/graph/Graph';
import { log } from '../src/Global';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('AcceptanceTests', () => {

  it('Can query for node', async () => {

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

    let graph = new Graph(dbConfig, dbSchema);
    let result = await graph
      .v({type: 'User', id: new Buffer('MLVPsHX4SP2y3tJBdcZMOw==', 'base64')}, {first: 1})
      .getAsync();

    log(JSON.stringify(result, null, 2));
    expect(result);
  });

  it('Can query for node and traverse edge', async () => {

    let dbConfig = {
      apiVersion: '2012-08-10',
      region: 'us-east-1',
      dynamoDbCrc32: false,
    };

    let dbSchema = {
      tables: [
        {
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
        },
        {
          TableName: 'Contacts',
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'B' },
          ],
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
        },
        {
          TableName: 'UserContactEdges',
          AttributeDefinitions: [
            { AttributeName: 'outID', AttributeType: 'B' },
            { AttributeName: 'inID', AttributeType: 'B' },
            { AttributeName: 'userOrder', AttributeType: 'S' },
            { AttributeName: 'inPhoneNumber', AttributeType: 'S' },
          ],
          KeySchema: [
            // This primary key is outID+inID so that we can do a fast individual
            // edge get and connection traversal in most used direction
            { AttributeName: 'outID', KeyType: 'HASH' },
            { AttributeName: 'inID', KeyType: 'RANGE' },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
          LocalSecondaryIndexes: [
            // This index is for connection traversal in most used direction
            // with a special order applied
            {
              IndexName: 'UserOrder',
              KeySchema: [
                { AttributeName: 'outID', KeyType: 'HASH' },
                { AttributeName: 'userOrder', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            },
            // This index is for connection traversal in most used direction
            // with ablity to filter / query by contact phone number
            {
              IndexName: 'InPhoneNumber',
              KeySchema: [
                { AttributeName: 'outID', KeyType: 'HASH' },
                { AttributeName: 'inPhoneNumber', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            }
          ],
          GlobalSecondaryIndexes: [
            // This index is for connection traversal in opposite direction
            {
              IndexName: 'UserOrderReverse',
              KeySchema: [
                { AttributeName: 'inID', KeyType: 'HASH' },
                { AttributeName: 'userOrder', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
              }
            }
          ],
        },
      ]
    };

    let graph = new Graph(dbConfig, dbSchema);
    let result = await graph
      .v({type: 'User', id: new Buffer('MLVPsHX4SP2y3tJBdcZMOw==', 'base64')}, {first: 1})
      .out({type: 'UserContactEdge'}, {first: 3})
      .in({type: 'Contact'})
      .getAsync();

    log(JSON.stringify(result, null, 2));
    expect(result);
  });

});
