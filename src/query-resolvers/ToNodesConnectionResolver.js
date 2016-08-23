/* @flow */
import EntityResolver from '../query-resolvers/EntityResolver';
import ExpressionHelper from '../query-helpers/ExpressionHelper';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import Instrument from '../utils/Instrument';
import { invariant } from '../Global';
import type { Connection, Edge } from 'graphql-relay';
// eslint-disable-next-line no-unused-vars
import type { QueryExpression, DRGEdge, Model } from '../flow/Types';

export default class ToNodesConnectionResolver {
  _entityResolver: EntityResolver;

  constructor(entityResolver: EntityResolver) {
    this._entityResolver = entityResolver;
  }

  async resolveAsync<T: Model>(query: ToNodesConnectionQuery, innerResult: Connection<DRGEdge>)
    : Promise<Connection<T>> {
    return await Instrument.funcAsync(this, async () => {
      invariant(query != null, 'Argument \'query\' is null');
      invariant(innerResult != null, 'Argument \'innerResult\' is null');

      let nodeIds = this.constructor._getNodeIds(query.expression, query.isOut, innerResult);
      let nodes: T[] = await Promise.all(nodeIds.map(id => {
        let prom: Promise<T> = this._entityResolver.getAsync(id);
        return prom;
      }));
      let edges: Edge<T>[] = nodes.map((node: T, i) => {
        invariant(innerResult != null, 'Argument \'innerResult\' is null');
        let edge: Edge<T> = { cursor: innerResult.edges[i].cursor, node};
        return edge;
      });

      let startCursor = edges[0] ? edges[0].cursor : null;
      let endCursor = edges[edges.length - 1] ?
        edges[edges.length - 1].cursor :
        null;

      let result: Connection<T> = {
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

  static _getNodeIds(expression: QueryExpression, isOut: boolean, innerResult: Connection<DRGEdge>)
    : string[] {
    return Instrument.func(this, () => {
      return innerResult
        .edges
        .map(edge => {
          invariant(typeof expression.type === 'string', 'Type must be string');
          let model = {
            type: expression.type,
            id: isOut ? edge.node.outID : edge.node.inID
          };
          return ExpressionHelper.toGlobalId(model);
        });
    });
  }
}
