/* @flow */
import warning from 'warning';
import BaseResolver from '../query-resolvers/BaseResolver';
import AggregateQuery from '../query/AggregateQuery';
import { log } from '../Global';

export default class AggregateResolver extends BaseResolver {
  getQueryAsync: any;

  constructor(getQueryAsync: any) {
    super();
    this.getQueryAsync = getQueryAsync;
  }

  canResolve(query: any): boolean {
    return (query instanceof AggregateQuery);
  }

  async resolveAsync(query: any, innerResult: any, options: any) {
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
          JSON.stringify({query, innerResult, result}));
      }

      return result;
    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'AggregateResolver',
        function: 'resolveAsync',
        query,
        innerResult}));
      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }
}
