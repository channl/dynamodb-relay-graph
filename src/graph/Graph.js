/* @flow */
import { invariant } from '../Global';
import DynamoDB from '../aws/DynamoDB';
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import EntityResolver from '../query-resolvers/EntityResolver';
import AggregateResolver from '../query-resolvers/AggregateResolver';
import EdgeConnectionResolver from '../query-resolvers/EdgeConnectionResolver';
import NodeConnectionResolver from '../query-resolvers/NodeConnectionResolver';
import SingleResolver from '../query-resolvers/SingleResolver';
import BaseResolver from '../query-resolvers/BaseResolver';
import EntityWriter from '../query-writers/EntityWriter';
import AWSConvertor from '../query-helpers/AWSConvertor';
import ToNodesConnectionResolver from '../query-resolvers/ToNodesConnectionResolver';
import type { DynamoDBConfig, DynamoDBSchema } from 'aws-sdk-promise';
import type { NodeQueryExpression, ConnectionArgs, Options } from '../flow/Types';

export default class Graph {
  _writer: EntityWriter;
  _resolvers: BaseResolver[];

  constructor(dynamoDBConfig: DynamoDBConfig, schema: DynamoDBSchema) {

    invariant(dynamoDBConfig, 'Argument \'dynamoDBConfig\' is null');

    let dynamoDB = new DynamoDB(dynamoDBConfig);
    let entityResolver = new EntityResolver(dynamoDB);

    this._writer = new EntityWriter(dynamoDB);

    let res1 = new AggregateResolver((query, innerResult, stats) =>
      this.getQueryAsync(query, innerResult, stats));
    let res2 = new EdgeConnectionResolver(dynamoDB, schema, entityResolver);
    let res3 = new NodeConnectionResolver(dynamoDB, schema, entityResolver);
    let res4 = new SingleResolver();
    let res5 = new ToNodesConnectionResolver(entityResolver);

    this._resolvers = [
      res1,
      res2,
      res3,
      res4,
      res5
    ];
  }

  v(expression: NodeQueryExpression, connectionArgs: ConnectionArgs): NodeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    return new NodeConnectionQuery(this, null, expression, connectionArgs);
  }

  e(expression: any, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    return new EdgeConnectionQuery(this, null, expression, connectionArgs, true);
  }

  async addAsync(item: any): Promise {
    invariant(item, 'Argument \'item\' is null');
    return this._writer.writeManyAsync([ item ], [ ]);
  }

  async addManyAsync(items: any[]): Promise {
    invariant(items, 'Argument \'items\' is null');
    return this._writer.writeManyAsync(items, [ ]);
  }

  async removeAsync(item: any): Promise {
    invariant(item, 'Argument \'item\' is null');
    return this._writer.writeManyAsync([ ], [ item ]);
  }

  async removeManyAsync(items: any[]): Promise {
    invariant(items, 'Argument \'items\' is null');
    return this._writer.writeManyAsync([ ], items);
  }

  async putAsync(item: any): Promise {
    invariant(item, 'Argument \'item\' is null');
    return this._writer.writeManyAsync([ item ], [ ]);
  }

  async putManyAsync(items: any[]): Promise {
    invariant(items, 'Argument \'items\' is null');
    return this._writer.writeManyAsync(items, [ ]);
  }

  async getAsync(query: BaseQuery, options: ?Options): Promise<Object> {
    invariant(query, 'Argument \'query\' is null');

    let innerResult = {};
    if (query.inner) {
      innerResult = await this.getAsync(query.inner, options);
    }

    let result = await this.getQueryAsync(query, innerResult, options);
    return result;
  }

  async getQueryAsync(
    query: BaseQuery,
    innerResult: Object,
    options: ?Options): Promise<Object> {
    invariant(query, 'Argument \'query\' is null');
    invariant(innerResult, 'Argument \'innerResult\' is null');

    let resolver = this._resolvers.find(r => r.canResolve(query));
    if (!resolver) {
      throw new Error('The query type was not supported');
    }

    return await resolver.resolveAsync(query, innerResult, options);
  }

  getCursor(model: Object, order: ?string) {
    invariant(model, 'Argument \'model\' is null');

    return AWSConvertor.toCursor(model, order);
  }

  getGlobalId(model: Object): string {
    invariant(model, 'Argument \'model\' is null');

    return AWSConvertor.getGlobalIdFromModel(model);
  }
}
