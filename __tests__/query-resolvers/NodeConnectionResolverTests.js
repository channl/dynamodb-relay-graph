/* @flow
import NodeConnectionResolver from '../../src/query-resolvers/NodeConnectionResolver';
import { log } from '../../src/Global';
// import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('NodeConnectionResolverTests', () => {

  it('Can update node', () => {
    try {

      let dynamoDB = {};

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

      let resolver = new NodeConnectionResolver(dynamoDB, dbSchema);

    } catch (e) {
      log(e);
      log(e.stack);
      throw e;
    }
  });
});
*/
