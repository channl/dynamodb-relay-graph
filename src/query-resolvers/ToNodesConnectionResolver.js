/* @flow */
import invariant from 'invariant';
import EntityResolver from '../query-resolvers/EntityResolver';
import DataMapper from '../query-helpers/DataMapper';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import Instrument from '../logging/Instrument';
import type { Connection, Edge } from 'graphql-relay';
import type { QueryExpression, Model, TypedDataModel,
  TypedMaybeDataModel } from '../flow/Types';

export default class ToNodesConnectionResolver {
  _entityResolver: EntityResolver;
  _dataMapper: DataMapper;

  constructor(entityResolver: EntityResolver, dataMapper: DataMapper) {
    this._entityResolver = entityResolver;
    this._dataMapper = dataMapper;
  }

  async resolveAsync(query: ToNodesConnectionQuery, innerResult: Connection<Model>)
    : Promise<Connection<Model>> {
    // eslint-disable-next-line max-len, no-caller
    return await Instrument.funcAsync(this, arguments, async () => {
      invariant(query != null, 'Argument \'query\' is null');
      invariant(innerResult != null, 'Argument \'innerResult\' is null');

      let nodeIds = this.constructor._getNodeIds(query.type, query.expression,
        query.isOut, innerResult);

      let items: TypedMaybeDataModel[] = await Promise.all(
        nodeIds.map(id => this._entityResolver.getAsync(id)));

      let typedDataModels = ToNodesConnectionResolver._toTypedDataModels(items);
      let edges: Edge<Model>[] = typedDataModels.map((item, i) => {
        invariant(innerResult != null, 'Argument \'innerResult\' is null');
        invariant(item.dataModel != null, 'DataModel should not be null or undefined');
        let node = this._dataMapper.fromDataModel(item.type, item.dataModel);
        let edge: Edge<Model> = { cursor: innerResult.edges[i].cursor, node};
        return edge;
      });

      let startCursor = edges[0] ? edges[0].cursor : null;
      let endCursor = edges[edges.length - 1] ?
        edges[edges.length - 1].cursor :
        null;

      let result: Connection<Model> = {
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasPreviousPage: innerResult.pageInfo.hasPreviousPage,
          hasNextPage: innerResult.pageInfo.hasNextPage
        }
      };

      return result;
    });
  }

  static _getNodeIds(type: string, expression: QueryExpression, isOut: boolean,
    innerResult: Connection<Model>): string[] {
    return Instrument.func(this, () => {
      return innerResult
        .edges
        .map(edge => {
          invariant(typeof type === 'string', 'Type must be string');
          let gid = isOut ? edge.node.outID : edge.node.inID;
          invariant(typeof gid === 'string', 'outID or inID must be a global id string');
          return gid;
        });
    });
  }

  static _toTypedDataModels(typedMaybeDataModels: TypedMaybeDataModel[]): TypedDataModel[] {
    // $FlowIgnore
    return typedMaybeDataModels.filter(item => item.dataModel != null);
  }
}
