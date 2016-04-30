import Guard from '../util/Guard';
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
    dynamoDB,
    schema,
    getTableName,
    getModelFromAWSItem,
    getIdFromAWSKey,
    toAWSKey) {
    this.writer = new EntityWriter(dynamoDB, getTableName, schema);

    let res1 = new AggregateResolver(
      (query, innerResult, stats) =>
      this.getQueryAsync(query, innerResult, stats));

    let res2 = new EdgeConnectionResolver(
      dynamoDB,
      schema,
      getTableName,
      getModelFromAWSItem,
      getIdFromAWSKey,
      toAWSKey);

    let res3 = new NodeConnectionResolver(
      dynamoDB,
      schema,
      getTableName,
      getModelFromAWSItem,
      getIdFromAWSKey,
      toAWSKey);

    let res4 = new SingleResolver();

    let res5 = new ToNodesConnectionResolver(
      dynamoDB,
      schema,
      getTableName,
      getModelFromAWSItem,
      getIdFromAWSKey,
      toAWSKey);

    this.resolvers = [
      res1,
      res2,
      res3,
      res4,
      res5
    ];
  }

  static v(expression, connectionArgs) {
    Guard(expression, 'expression').isNotUndefinedOrNull();
    Guard(connectionArgs, 'connectionArgs').isNotUndefinedOrNull();

    if (Array.isArray(expression)) {
      return new AggregateQuery(
        null,
        expression.map(e => this.v(e, connectionArgs)));
    }

    return new NodeConnectionQuery(null, expression, connectionArgs);
  }

  static e(expression, connectionArgs) {
    Guard(expression, 'expression').isNotUndefinedOrNull();
    Guard(connectionArgs, 'connectionArgs').isNotUndefinedOrNull();

    if (Array.isArray(expression)) {
      return new AggregateQuery(
        null,
        expression.map(exp => this.e(exp, connectionArgs)));
    }

    return new EdgeConnectionQuery(null, expression, connectionArgs);
  }

  async addAsync(item) {
    Guard(item, 'item').isNotUndefinedOrNull();
    return this.writer.writeManyAsync([ item ], [ ]);
  }

  async addManyAsync(items) {
    Guard(items, 'items').isNotUndefinedOrNull();
    return this.writer.writeManyAsync(items, [ ]);
  }

  async removeAsync(item) {
    Guard(item, 'item').isNotUndefinedOrNull();
    return this.writer.writeManyAsync([ ], [ item ]);
  }

  async removeManyAsync(items) {
    Guard(items, 'items').isNotUndefinedOrNull();
    return this.writer.writeManyAsync([ ], items);
  }

  async putAsync(item) {
    Guard(item, 'item').isNotUndefinedOrNull();
    return this.writer.writeManyAsync([ item ], [ ]);
  }

  async putManyAsync(items) {
    Guard(items, 'items').isNotUndefinedOrNull();
    return this.writer.writeManyAsync(items, [ ]);
  }

  async getAsync(query, options) {
    Guard(query, 'query').isNotUndefinedOrNull();

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
