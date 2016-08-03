/* @flow */
import warning from 'warning';
import BaseResolver from '../query-resolvers/BaseResolver';
import EntityResolver from '../query-resolvers/EntityResolver';
import ExpressionHelper from '../query-helpers/ExpressionHelper';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import { log, invariant } from '../Global';
import type { Options } from '../flow/Types';

export default class ToNodesConnectionResolver extends BaseResolver {
  _entityResolver: EntityResolver;

  constructor(entityResolver: EntityResolver) {
    super();
    this._entityResolver = entityResolver;
  }

  canResolve(query: any): boolean {
    invariant(query, 'Argument \'query\' is null');
    return (query instanceof ToNodesConnectionQuery);
  }

  async resolveAsync(query: ToNodesConnectionQuery,
    innerResult: Object, options: ?Options): Promise<Object> {
    invariant(query, 'Argument \'query\' is null');
    invariant(innerResult, 'Argument \'innerResult\' is null');

    let sw = null;
    if (options && options.stats) {
      sw = options
      .stats
      .timer('ToNodesConnectionResolver.resolveAsync')
      .start();
    }

    try {
      let nodeIds = await this.getNodeIds(query, innerResult);
      let nodes = await Promise.all(nodeIds.map(id => this._entityResolver.getAsync(id)));
      let edges = nodes.map((node, i) => {
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

      if (options && options.logs) {
        log(JSON.stringify({
          class: 'ToNodesConnectionResolver',
          query: query.clone(),
          innerResult,
          result}));
      }

      return result;

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'ToNodesConnectionResolver',
        function: 'resolveAsync',
        query: query.clone(),
        innerResult
      }));

      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }

  async getNodeIds(query: ToNodesConnectionQuery, innerResult: any) {
    return innerResult
      .edges
      .map(edge => {
        invariant(typeof query.expression.type === 'string', 'Type must be string');
        let model = {
          type: query.expression.type,
          id: query.isOut ? edge.outID : edge.inID
        };
        return ExpressionHelper.toGlobalId(model);
      });
  }
}
