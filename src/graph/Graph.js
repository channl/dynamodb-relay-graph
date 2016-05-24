import invariant from 'invariant';
import warning from 'warning';
import DynamoDB from '../store/DynamoDB';
import AggregateQuery from '../query/AggregateQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import AggregateResolver from '../query-resolvers/AggregateResolver';
import EdgeConnectionResolver from '../query-resolvers/EdgeConnectionResolver';
import NodeConnectionResolver from '../query-resolvers/NodeConnectionResolver';
import SingleResolver from '../query-resolvers/SingleResolver';
import EntityWriter from '../query-writers/EntityWriter';
import ToNodesConnectionResolver
  from '../query-resolvers/ToNodesConnectionResolver';

export default class Graph {

  constructor(
    dynamoDBConfig,
    schema) {

    invariant(dynamoDBConfig, 'Argument \'dynamoDBConfig\' is null');
    invariant(schema, 'Argument \'schema\' is null');

    this.schema = schema;
    let dynamoDB = new DynamoDB(dynamoDBConfig);
    this.writer = new EntityWriter(dynamoDB, schema);

    let res1 = new AggregateResolver((query, innerResult, stats) => this.getQueryAsync(query, innerResult, stats));
    let res2 = new EdgeConnectionResolver(dynamoDB, schema);
    let res3 = new NodeConnectionResolver(dynamoDB, schema);
    let res4 = new SingleResolver();
    let res5 = new ToNodesConnectionResolver(dynamoDB, schema);

    this.resolvers = [
      res1,
      res2,
      res3,
      res4,
      res5
    ];
  }

/*

  getIdFromAWSKey(type, key) {
    try {
      invariant(type, 'Argument \'type\' is null');
      invariant(key, 'Argument \'key\' is null');

      if (type.endsWith('Edge')) {
        return Buffer.concat(key.outID.B, key.inID.B, 72);
      }

      return key.id.B;

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'Graph', function: 'getIdFromAWSKey',
        type, key}, null, 2));
      throw ex;
    }
  }
*/
  static v(expression, connectionArgs) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    if (Array.isArray(expression)) {
      return new AggregateQuery(
        null,
        expression.map(e => this.v(e, connectionArgs)));
    }

    return new NodeConnectionQuery(null, expression, connectionArgs);
  }

  static e(expression, connectionArgs) {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    if (Array.isArray(expression)) {
      return new AggregateQuery(
        null,
        expression.map(exp => this.e(exp, connectionArgs)));
    }

    return new EdgeConnectionQuery(null, expression, connectionArgs);
  }

  async addAsync(item) {
    invariant(item, 'Argument \'item\' is null');
    return this.writer.writeManyAsync([ item ], [ ]);
  }

  async addManyAsync(items) {
    invariant(items, 'Argument \'items\' is null');
    return this.writer.writeManyAsync(items, [ ]);
  }

  async removeAsync(item) {
    invariant(item, 'Argument \'item\' is null');
    return this.writer.writeManyAsync([ ], [ item ]);
  }

  async removeManyAsync(items) {
    invariant(items, 'Argument \'items\' is null');
    return this.writer.writeManyAsync([ ], items);
  }

  async putAsync(item) {
    invariant(item, 'Argument \'item\' is null');
    return this.writer.writeManyAsync([ item ], [ ]);
  }

  async putManyAsync(items) {
    invariant(items, 'Argument \'items\' is null');
    return this.writer.writeManyAsync(items, [ ]);
  }

  async getAsync(query, options) {
    invariant(query, 'Argument \'query\' is null');

    let innerResult = null;
    if (query.inner) {
      innerResult = await this.getAsync(query.inner, options);
    }

    let result = await this.getQueryAsync(query, innerResult, options);
    return result;
  }

  async getQueryAsync(query, innerResult, options) {
    let resolver = this.resolvers.find(r => r.canResolve(query));
    if (!resolver) {
      throw new Error('The query type was not supported');
    }

    return await resolver.resolveAsync(query, innerResult, options);
  }
}
