/* @flow */
import invariant from 'invariant';
import DynamoDB from './aws/DynamoDB';
import EdgeConnectionQuery from './query/EdgeConnectionQuery';
import NodeConnectionQuery from './query/NodeConnectionQuery';
import DataModelHelper from './query-helpers/DataModelHelper';
import EntityResolver from './query-resolvers/EntityResolver';
import EdgeConnectionResolver from './query-resolvers/EdgeConnectionResolver';
import NodeConnectionResolver from './query-resolvers/NodeConnectionResolver';
import SingleResolver from './query-resolvers/SingleResolver';
import SingleOrNullResolver from './query-resolvers/SingleOrNullResolver';
import EntityWriter from './query-writers/EntityWriter';
import ToNodesConnectionResolver from './query-resolvers/ToNodesConnectionResolver';
import DataMapper from './query-helpers/DataMapper';
import { fromGlobalId } from 'graphql-relay';
import type { DynamoDBConfig, DynamoDBSchema } from 'aws-sdk';
import type { ExprModel, QueryExpression, ConnectionArgs } from './flow/Types';

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
    this._edgeConnectionResolver = new EdgeConnectionResolver(dynamoDB, schema,
      this._entityResolver, this._dataMapper);
    this._nodeConnectionResolver = new NodeConnectionResolver(dynamoDB, schema,
      this._entityResolver, this._dataMapper);
    this._toNodesConnectionResolver = new ToNodesConnectionResolver(this._entityResolver,
      this._dataMapper);
  }

  id(type: string, base64Buffer?: string | Buffer | Object): string {
    return this._dataMapper.id(type, base64Buffer);
  }

  v(type: string, expression: QueryExpression,
    connectionArgs: ConnectionArgs): NodeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    return new NodeConnectionQuery(this, type, expression, connectionArgs);
  }

  e(type: string, expression: QueryExpression,
    connectionArgs: ConnectionArgs): EdgeConnectionQuery {
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

  getCursor(item: ExprModel, order: ?string): string {
    invariant(item, 'Argument \'item\' is null');
    let { type } = fromGlobalId(item.id);
    let dataModel = this._dataMapper.toDataModel(type, item);
    return DataModelHelper.toCursor({type, dataModel}, order);
  }
}
