/* @flow */
// import fs from 'fs';
import Graph from '../../src/Graph';
// import DynamoDB from '../../src/aws/DynamoDB';
// import EntityWriter from '../../src/query-writers/EntityWriter';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import To from '../acceptance/To';
// import type { NodeQueryExpression } from '../src/flow/Types';

describe('AcceptanceTests', () => {

/*
  it('Can do test upload', async function(done) {
    try {
      this.timeout(10000);

      let dbConfig = {
        apiVersion: '2012-08-10',
        region: 'us-east-1',
        dynamoDbCrc32: false,
      };

      // let dbSchema = DynamoDBSchema;
      let db = new DynamoDB(dbConfig);
      let writer = new EntityWriter(db);

      let readFileAsync = async path => {
        return new Promise((resolve, reject) => {
          fs.readFile(path, (err, data) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(data);
          });
        });
      };

      let content = await readFileAsync('./__tests__/acceptance/TestUpload.json');
      let json = JSON.parse(content);
      await writer.writeManyAsync(json.itemsToPut, json.itemsToDelete);

      done();
    } catch (e) {
      done(e);
    }
  });
*/

  it('Can update node', async function(done) {
    try {
      this.timeout(20000);

      let dbConfig = {
        apiVersion: '2012-08-10',
        region: 'us-east-1',
        dynamoDbCrc32: false,
      };

      let dbSchema = {
        tables: [ {
          TableName: 'Settings',
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
          ],
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
          ],
          ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
        } ]
      };

      let graph = new Graph(dbConfig, dbSchema);
      for (let i = 0; i < 10; i++) {
        let item = {
          type: 'Setting',
          id: 'test',
          currentBlogId: Math.random().toString()
        };

        await graph.addAsync(item);
      }
      done();
    } catch (e) {
      done(e);
    }
  });

  it('Can query for nodes', async function(done) {
    try {
      this.timeout(10000);

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
        .v({type: 'User'}, {first: 2})
        .getAsync(To.User);

      let expected = {
        edges: [ null, null ],
        pageInfo: {
          // eslint-disable-next-line max-len
          startCursor: 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbNDgsMTgxLDc5LDE3NiwxMTcsMjQ4LDcyLDI1MywxNzgsMjIyLDIxMCw2NSwxMTcsMTk4LDc2LDU5XX19fQ==',
          // eslint-disable-next-line max-len
          endCursor: 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbNTksMTA5LDg0LDcwLDIxNSw2NSw3Myw1OCwxNDEsNDYsODcsNzMsNTcsMTY3LDEyMCw5M119fX0=',
          hasPreviousPage: false,
          hasNextPage: true
        }
      };

      expect(result.edges.length).to.deep.equal(expected.edges.length);
      expect(result.pageInfo).to.deep.equal(expected.pageInfo);
      done();
    } catch (e) {
      done(e);
    }
  });

  it('Can query for node', async function(done) {
    try {
      this.timeout(10000);

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
        .single()
        .getAsync(To.User);

      expect(result);
      done();
    } catch (e) {
      done(e);
    }
  });

  it('Can query for node that does not exist', async function(done) {
    try {
      this.timeout(10000);

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
        .v({type: 'User', id: new Buffer('ABCPsHX4SP2y3tJBdcZMOw==', 'base64')}, {first: 1})
        .getAsync(To.User);

      let expected = {
        edges: [],
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          hasNextPage: false
        }
      };

      expect(result).to.deep.equal(expected);
      done();
    } catch (e) {
      done(e);
    }
  });

  it('Can query for node and traverse edge', async function(done) {
    try {
      this.timeout(10000);

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
        .getAsync(To.Contact);

      let expected = {
        edges: [ null, null, null ],
        pageInfo: {
          // eslint-disable-next-line max-len
          startCursor: 'eyJvdXRJRCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbNDgsMTgxLDc5LDE3NiwxMTcsMjQ4LDcyLDI1MywxNzgsMjIyLDIxMCw2NSwxMTcsMTk4LDc2LDU5XX19LCJpbklEIjp7IkIiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOls1MSw0OCw5OCw1Myw1MiwxMDIsOTgsNDgsNDUsNTUsNTMsMTAyLDU2LDQ1LDUyLDU2LDEwMiwxMDAsNDUsOTgsNTAsMTAwLDEwMSw0NSwxMDAsNTAsNTIsNDksNTUsNTMsOTksNTQsNTIsOTksNTEsOTgsOTQsNDAsNTMsNTMsNTMsNDEsMzIsNTMsNTQsNTIsNDUsNTYsNTMsNTYsNTFdfX19',
          // eslint-disable-next-line max-len
          endCursor: 'eyJvdXRJRCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbNDgsMTgxLDc5LDE3NiwxMTcsMjQ4LDcyLDI1MywxNzgsMjIyLDIxMCw2NSwxMTcsMTk4LDc2LDU5XX19LCJpbklEIjp7IkIiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOls1MSw0OCw5OCw1Myw1MiwxMDIsOTgsNDgsNDUsNTUsNTMsMTAyLDU2LDQ1LDUyLDU2LDEwMiwxMDAsNDUsOTgsNTAsMTAwLDEwMSw0NSwxMDAsNTAsNTIsNDksNTUsNTMsOTksNTQsNTIsOTksNTEsOTgsOTQsNDMsNDksNTAsNTMsNTQsNTUsNTEsNDgsNTEsNDgsNTUsNDhdfX19',
          hasPreviousPage: false,
          hasNextPage: true
        }
      };

      expect(result.edges.length).to.deep.equal(expected.edges.length);
      expect(result.pageInfo).to.deep.equal(expected.pageInfo);
      done();
    } catch (e) {
      done(e);
    }
  });

});
