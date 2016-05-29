/* @flow */
import invariant from 'invariant';
import DynamoDB from '../store/DynamoDB';
import AggregateQuery from '../query/AggregateQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import AggregateResolver from '../query-resolvers/AggregateResolver';
import EdgeConnectionResolver from '../query-resolvers/EdgeConnectionResolver';
import NodeConnectionResolver from '../query-resolvers/NodeConnectionResolver';
import SingleResolver from '../query-resolvers/SingleResolver';
import BaseResolver from '../query-resolvers/BaseResolver';
import EntityWriter from '../query-writers/EntityWriter';
import ToNodesConnectionResolver
  from '../query-resolvers/ToNodesConnectionResolver';

import type { DynamoDBConfig, DynamoDBSchema } from '../store/DynamoDB';

type ConnectionArgs = {
  first?: number,
  last?: number,
  before?: string,
  after?: string,
  order?: string,
};

export default class Graph {
  _writer: EntityWriter;
  _resolvers: BaseResolver[];

  constructor(
    dynamoDBConfig: DynamoDBConfig,
    schema: DynamoDBSchema) {

    invariant(dynamoDBConfig, 'Argument \'dynamoDBConfig\' is null');
    invariant(schema, 'Argument \'schema\' is null');

    let dynamoDB = new DynamoDB(dynamoDBConfig);
    this._writer = new EntityWriter(dynamoDB, schema);

    let res1 = new AggregateResolver((query, innerResult, stats) =>
      this.getQueryAsync(query, innerResult, stats));

    let res2 = new EdgeConnectionResolver(dynamoDB, schema);
    let res3 = new NodeConnectionResolver(dynamoDB, schema);
    let res4 = new SingleResolver();
    let res5 = new ToNodesConnectionResolver(dynamoDB, schema);

    this._resolvers = [
      res1,
      res2,
      res3,
      res4,
      res5
    ];
  }

  v(expression: any, connectionArgs: ConnectionArgs): NodeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    return new NodeConnectionQuery(this, null, expression, connectionArgs);
  }

  vs(expression: any[], connectionArgs: ConnectionArgs): AggregateQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    return new AggregateQuery(
      this,
      null,
      expression.map(e => this.v(e, connectionArgs)));
  }

  e(expression: any, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    return new EdgeConnectionQuery(this, null, expression, connectionArgs, true);
  }

  es(expression: any[], connectionArgs: ConnectionArgs): AggregateQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    return new AggregateQuery(
      this,
      null,
      expression.map(exp => this.e(exp, connectionArgs)));
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

  async getAsync(query: any, options: any): Promise<any> {
    invariant(query, 'Argument \'query\' is null');

    let innerResult = null;
    if (query.inner) {
      innerResult = await this.getAsync(query.inner, options);
    }

    let result = await this.getQueryAsync(query, innerResult, options);
    return result;
  }

  async getQueryAsync(
    query: any,
    innerResult: any,
    options: any): Promise<any> {

    let resolver = this._resolvers.find(r => r.canResolve(query));
    if (!resolver) {
      throw new Error('The query type was not supported');
    }

    return await resolver.resolveAsync(query, innerResult, options);
  }
}
