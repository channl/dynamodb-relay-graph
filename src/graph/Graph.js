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
import uuid from 'node-uuid';
import ToNodesConnectionResolver
  from '../query-resolvers/ToNodesConnectionResolver';

export default class Graph {

  constructor(
    dynamoDBConfig,
    schema,
    getTableName) {

    invariant(dynamoDBConfig, 'Argument \'dynamoDBConfig\' is null');
    invariant(schema, 'Argument \'schema\' is null');
    invariant(getTableName, 'Argument \'getTableName\' is null');

    this.schema = schema;
    let dynamoDB = new DynamoDB(dynamoDBConfig);
    this.writer = new EntityWriter(dynamoDB, getTableName, schema);
    this.getTableName = getTableName;

    let res1 = new AggregateResolver(
      (query, innerResult, stats) =>
      this.getQueryAsync(query, innerResult, stats));

    let res2 = new EdgeConnectionResolver(
      dynamoDB,
      schema,
      getTableName,
      this.getModelFromAWSItem,
      (type, key) => this.getIdFromAWSKey(type, key),
      (type, id) => this.getAWSKeyFromId(type, id),
      (item, indexedByAttributeName) => this.getAWSKeyFromItem(item, indexedByAttributeName)
    );

    let res3 = new NodeConnectionResolver(
      dynamoDB,
      schema,
      getTableName,
      this.getModelFromAWSItem,
      (type, key) => this.getIdFromAWSKey(type, key),
      (type, id) => this.getAWSKeyFromId(type, id),
      (item, indexedByAttributeName) => this.getAWSKeyFromItem(item, indexedByAttributeName)
    );

    let res4 = new SingleResolver();

    let res5 = new ToNodesConnectionResolver(
      dynamoDB,
      schema,
      getTableName,
      this.getModelFromAWSItem,
      (type, key) => this.getIdFromAWSKey(type, key),
      (type, id) => this.getAWSKeyFromId(type, id),
      (item, indexedByAttributeName) => this.getAWSKeyFromItem(item, indexedByAttributeName)
    );

    this.resolvers = [
      res1,
      res2,
      res3,
      res4,
      res5
    ];
  }

  getModelFromAWSItem(type, item) {
    try {
      let model = { type };

      for (let name in item) {
        let attr = item[name];
        if (typeof attr.S !== 'undefined') {
          model[name] = item[name].S;
        } else if (typeof attr.N !== 'undefined') {
          model[name] = item[name].N;
        } else if (typeof attr.B !== 'undefined') {
          model[name] = item[name].B;
        } else if (typeof attr.BOOL !== 'undefined') {
          model[name] = item[name].BOOL;
        }
      }

      return model;
    } catch (ex) {
      warning(JSON.stringify({
        class: 'Graph',
        function: 'getModelFromAWSItem',
        type, item
      }));
      console.error(ex);
      throw ex;
    }
  }

  getAWSKeyFromItem(item, indexedByAttributeName) {
    try {
      invariant(item, 'Argument \'item\' is null');

      let key = null;
      if (item.type.endsWith('Edge')) {
        key = {
          outID: { B: item.outID },
          inID: { B: item.inID },
        };
      } else {
        key = {
          id: { B: item.id },
        };
      }

      if (typeof indexedByAttributeName !== 'undefined') {
        key[indexedByAttributeName] = {};

        let tableName = this.getTableName(item.type);

        let attributeType =
        this.getAttributeType(tableName, indexedByAttributeName);

        key[indexedByAttributeName][attributeType] =
          item[indexedByAttributeName].toString();
      }

      return key;

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'Graph', function: 'getAWSKeyFromItem',
        item, indexedByAttributeName}, null, 2));
      throw ex;
    }
  }

  getAttributeType(tableName, attributeName) {
    try {
      invariant(tableName, 'Argument \'tableName\' is null');
      invariant(attributeName, 'Argument \'attributeName\' is null');

      let table = this.schema.tables.find(t => t.TableName === tableName);
      let attibute = table
        .AttributeDefinitions
        .find(ad => ad.AttributeName === attributeName);

      return attibute.AttributeType;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'Graph', function: 'getAttributeType',
        tableName, attributeName}, null, 2));
      throw ex;
    }
  }

  getIdFromAWSKey(type, key) {
    try {
      invariant(type, 'Argument \'type\' is null');
      invariant(key, 'Argument \'key\' is null');

      if (type.endsWith('Edge')) {
        return uuid.unparse(key.outID.B) + uuid.unparse(key.inID.B);
      }

      if (type === 'Contact') {
        return key.id.B.toString('ascii');
      }

      return uuid.unparse(key.id.B);

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'Graph', function: 'getIdFromAWSKey',
        type, key}, null, 2));
      throw ex;
    }
  }

  getAWSKeyFromId(type, id) {
    try {
      invariant(type, 'Argument \'type\' is null');
      invariant(id, 'Argument \'id\' is null');

      debugger;
      if (type.endsWith('Edge')) {
        return {
          outID: { B: new Buffer(uuid.parse(id.substring(0, 36))) },
          inID: { B: new Buffer(id.substring(36)) }
        };
      }

      if (type === 'Contact') {
        return {
          id: { B: new Buffer(id) },
        };
      }

      return {
        id: { B: new Buffer(uuid.parse(id)) },
      };

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'Graph', function: 'getAWSKeyFromId',
        type, id}, null, 2));
      throw ex;
    }
  }

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
