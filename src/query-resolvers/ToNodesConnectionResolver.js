/* @flow */
import EntityResolver from '../query-resolvers/EntityResolver';
import ExpressionHelper from '../query-helpers/ExpressionHelper';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import Instrument from '../utils/Instrument';
import { invariant } from '../Global';
import type { Connection } from 'graphql-relay';
import type { QueryExpression, DRGEdge } from '../flow/Types';

export default class ToNodesConnectionResolver {
  _entityResolver: EntityResolver;

  constructor(entityResolver: EntityResolver) {
    this._entityResolver = entityResolver;
  }

  async resolveAsync(query: ToNodesConnectionQuery, innerResult: Connection<DRGEdge>)
    : Promise<Connection> {
    return await Instrument.funcAsync(this, async () => {
      invariant(query != null, 'Argument \'query\' is null');
      invariant(innerResult != null, 'Argument \'innerResult\' is null');

      let nodeIds = this.constructor._getNodeIds(query.expression, query.isOut, innerResult);
      let nodes = await Promise.all(nodeIds.map(id => this._entityResolver.getAsync(id)));
      let edges = nodes.map((node, i) => {
        invariant(innerResult != null, 'Argument \'innerResult\' is null');
        return { cursor: innerResult.edges[i].cursor, node};
      });

      let startCursor = edges[0] ? edges[0].cursor : null;
      let endCursor = edges[edges.length - 1] ?
        edges[edges.length - 1].cursor :
        null;

      let result = {
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
