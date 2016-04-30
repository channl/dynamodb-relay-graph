import logger from '../logging/logger';
import BaseResolver from '../query-resolvers/BaseResolver';
import AggregateQuery from '../query/AggregateQuery';

export default class AggregateResolver extends BaseResolver {
  constructor(getQueryAsync) {
    super();
    this.getQueryAsync = getQueryAsync;
  }

  canResolve(query) {
    return (query instanceof AggregateQuery);
  }

  async resolveAsync(query, innerResult, options) {
    let sw = null;
    if (options && options.stats) {
      sw = options.stats.timer('AggregateResolver.resolveAsync').start();
    }

    try {
      logger.trace('AggregateResolver.resolveAsync');
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
        logger.debug(
          'AggregateResolver succeeded',
          JSON.stringify({query, innerResult, result}));
      }
      return result;
    } catch (ex) {
      logger.warn(
        'AggregateResolver failed',
        JSON.stringify({query, innerResult}));
      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }
}
