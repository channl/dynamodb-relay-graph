/* @flow */
import warning from 'warning';
import BaseResolver from '../query-resolvers/BaseResolver';
import BaseQuery from '../query/BaseQuery';
import AggregateQuery from '../query/AggregateQuery';
import { log, invariant } from '../Global';
import type { Options } from '../flow/Types';

export default class AggregateResolver extends BaseResolver {
  getQueryAsync: any;

  constructor(getQueryAsync: any) {
    super();
    invariant(getQueryAsync, 'Argument \'getQueryAsync\' is null');
    this.getQueryAsync = getQueryAsync;
  }

  canResolve(query: BaseQuery): boolean {
    invariant(query, 'Argument \'query\' is null');
    return (query instanceof AggregateQuery);
  }

  async resolveAsync(query: AggregateQuery,
    innerResult: Object, options: ?Options): Promise<?Object> {
    invariant(query, 'Argument \'query\' is null');
    invariant(innerResult, 'Argument \'innerResult\' is null');

    let sw = null;
    if (options && options.stats) {
      sw = options.stats.timer('AggregateResolver.resolveAsync').start();
    }

    try {
      let results = await Promise.all(
        query.items.map(innerQuery =>
          this.getQueryAsync(innerQuery, innerResult, options)));

      let edges = results
        .map(r => r.edges)
        .reduce((pre, cur) => pre.concat(cur), []);

      let result = {
        edges,
        pageInfo: {
          startCursor: edges[0] ? edges[0].cursor : null,
          endCursor: edges[edges.length - 1] ?
            edges[edges.length - 1].cursor :
            null,
          hasPreviousPage: false,
          hasNextPage: false
        }
      };

      if (options && options.logs) {
        log('AggregateResolver succeeded',
          JSON.stringify({
            query: query.clone(),
            innerResult,
            result}));
      }

      return result;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'AggregateResolver',
        function: 'resolveAsync',
        query: query.clone(),
        innerResult}));
      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }
}
