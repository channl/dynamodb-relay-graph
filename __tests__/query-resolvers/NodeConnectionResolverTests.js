/* @flow */
// import NodeConnectionResolver from '../../src/query-resolvers/NodeConnectionResolver';
// import { log } from '../../src/Global';
// import { expect } from 'chai';
// import { describe, it } from 'mocha';
// eslint-disable-next-line no-unused-vars
import type { Model } from '../../src/flow/Types';
// import type { User } from '../acceptance/GraphQLTypes';
/*
class EntityResolver {
  // eslint-disable-next-line no-unused-vars
  getAsync<T: Model>(globalId: string): T {
    let user: User = {
      id: '123',
      countryCode: '123',
      phoneNumber: '123',
      firstName: '123',
      lastName: '123',
      password: '123',
      isVerified: true,
      verificationCode: '123',
      imageUrl: null,
      privateTagId: '123',
      tagId: '123',
    };
    let model = (user: Model);
    return model;
  }
}

describe('NodeConnectionResolverTests', () => {

  it('Can resolve node', async () => {
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

      let entityResolver = new EntityResolver();
      let resolver = new NodeConnectionResolver(dynamoDB, dbSchema, entityResolver);
      let query = new NodeConnectionQuery();
      let connection = await resolver.resolveAsync(query);

    } catch (e) {
      log(e);
      log(e.stack);
      throw e;
    }
  });
});
*/
