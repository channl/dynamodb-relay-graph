/* @flow */
import EntityResolver from '../query-resolvers/EntityResolver';
// import ExpressionHelper from '../query-helpers/ExpressionHelper';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import Instrument from '../utils/Instrument';
import { invariant } from '../Global';
import { toGlobalId } from 'graphql-relay';
import type { Connection, Edge } from 'graphql-relay';
import type { QueryExpression, Model } from '../flow/Types';

export default class ToNodesConnectionResolver {
  _entityResolver: EntityResolver;

  constructor(entityResolver: EntityResolver) {
    this._entityResolver = entityResolver;
  }

  async resolveAsync(query: ToNodesConnectionQuery, innerResult: Connection<Model>)
    : Promise<Connection<Model>> {
    return await Instrument.funcAsync(this, async () => {
      invariant(query != null, 'Argument \'query\' is null');
      invariant(innerResult != null, 'Argument \'innerResult\' is null');

      let nodeIds = this.constructor._getNodeIds(query.type, query.expression,
        query.isOut, innerResult);
      let nodes: Model[] = await Promise.all(nodeIds.map(id => {
        let prom: Promise<Model> = this._entityResolver.getAsync(id);
        return prom;
      }));
      let edges: Edge<Model>[] = nodes.map((node: Model, i) => {
        invariant(innerResult != null, 'Argument \'innerResult\' is null');
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
          let id = isOut ? edge.node.outID : edge.node.inID;
          invariant(typeof id === 'string', 'outID or inID must be a global id string');
          return toGlobalId(type, id);
        });
    });
  }
}
