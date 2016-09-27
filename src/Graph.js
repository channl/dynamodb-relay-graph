/* @flow */
import invariant from 'invariant';
import DynamoDB from './aws/DynamoDB';
import EdgeConnectionQuery from './query/EdgeConnectionQuery';
import NodeConnectionQuery from './query/NodeConnectionQuery';
// import GlobalIdHelper from './query-helpers/GlobalIdHelper';
// import ModelHelper from './query-helpers/ModelHelper';
import EntityResolver from './query-resolvers/EntityResolver';
import EdgeConnectionResolver from './query-resolvers/EdgeConnectionResolver';
import NodeConnectionResolver from './query-resolvers/NodeConnectionResolver';
import SingleResolver from './query-resolvers/SingleResolver';
import SingleOrNullResolver from './query-resolvers/SingleOrNullResolver';
import EntityWriter from './query-writers/EntityWriter';
import ToNodesConnectionResolver from './query-resolvers/ToNodesConnectionResolver';
import DataMapper from './query-helpers/DataMapper';
import type { DynamoDBConfig, DynamoDBSchema } from 'aws-sdk-promise';
import type { QueryExpression, ConnectionArgs } from './flow/Types';

export default class Graph {
  _writer: EntityWriter;
  _entityResolver: EntityResolver;
  _edgeConnectionResolver: EdgeConnectionResolver;
  _nodeConnectionResolver: NodeConnectionResolver;
  _singleResolver: SingleResolver;
  _singleOrNullResolver: SingleOrNullResolver;
  _toNodesConnectionResolver: ToNodesConnectionResolver;
  _dataMapper: DataMapper;

  constructor(dynamoDBConfig: DynamoDBConfig, schema: DynamoDBSchema, dataMapper: DataMapper) {
    invariant(dynamoDBConfig != null, 'Argument \'dynamoDBConfig\' is null');
    invariant(schema != null, 'Argument \'schema\' is null');
    invariant(dataMapper != null, 'Argument \'dataMapper\' is null');

    let dynamoDB = new DynamoDB(dynamoDBConfig);
    this._dataMapper = dataMapper;
    this._entityResolver = new EntityResolver(dynamoDB, this._dataMapper);
    this._writer = new EntityWriter(dynamoDB, this._dataMapper);
    this._singleResolver = new SingleResolver();
    this._singleOrNullResolver = new SingleOrNullResolver();
    // eslint-disable-next-line max-len
    this._edgeConnectionResolver = new EdgeConnectionResolver(dynamoDB, schema, this._entityResolver, this._dataMapper);
    // eslint-disable-next-line max-len
    this._nodeConnectionResolver = new NodeConnectionResolver(dynamoDB, schema, this._entityResolver, this._dataMapper);
    // eslint-disable-next-line max-len
    this._toNodesConnectionResolver = new ToNodesConnectionResolver(this._entityResolver, this._dataMapper);
  }

  // eslint-disable-next-line max-len
  v(type: string, expression: QueryExpression, connectionArgs: ConnectionArgs): NodeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    return new NodeConnectionQuery(this, type, expression, connectionArgs);
  }

  // eslint-disable-next-line max-len
  e(type: string, expression: QueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    return new EdgeConnectionQuery(this, null, type, expression, connectionArgs, true);
  }

  async addAsync(item: Object): Promise<void> {
    invariant(item, 'Argument \'item\' is null');
    return this._writer.writeManyAsync([ item ], [ ]);
  }

  async addManyAsync(items: Object[]): Promise<void> {
    invariant(items, 'Argument \'items\' is null');
    return this._writer.writeManyAsync(items, [ ]);
  }

  async removeAsync(item: Object): Promise<void> {
    invariant(item, 'Argument \'item\' is null');
    return this._writer.writeManyAsync([ ], [ item ]);
  }

  async removeManyAsync(items: Object[]): Promise<void> {
    invariant(items, 'Argument \'items\' is null');
    return this._writer.writeManyAsync([ ], items);
  }

  async putAsync(item: Object): Promise<void> {
    invariant(item, 'Argument \'item\' is null');
    return this._writer.writeManyAsync([ item ], [ ]);
  }

  async putManyAsync(items: Object[]): Promise<void> {
    invariant(items, 'Argument \'items\' is null');
    return this._writer.writeManyAsync(items, [ ]);
  }
/*
  static getCursor(model: Model, order: ?string): string {
    invariant(model, 'Argument \'model\' is null');
    return ModelHelper.toCursor(model, order);
  }

  static getGlobalId(model: Model): string {
    invariant(model, 'Argument \'model\' is null');
    return ModelHelper.toGlobalId(model);
  }

  static fromGlobalId(globalId: string): Model {
    invariant(typeof globalId !== 'string', 'Argument \'globalId\' is not of type string');
    return GlobalIdHelper.toModel(globalId);
  }
*/
}
