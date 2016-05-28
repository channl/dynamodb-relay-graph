/* @flow */
import warning from 'warning';
import BaseResolver from '../query-resolvers/BaseResolver';
import SingleQuery from '../query/SingleQuery';
import { log } from '../Global';

export default class SingleResolver extends BaseResolver {
  canResolve(query: any): boolean {
    return (query instanceof SingleQuery);
  }

  async resolveAsync(query: any, innerResult: any, options: any) {
    let sw = null;
    if (options && options.stats) {
      sw = options.stats.timer('SingleResolver.resolveAsync').start();
    }

    try {
      if (innerResult && innerResult.edges && innerResult.edges.length === 1) {
        let result = innerResult.edges[0].node;

        if (options && options.logs) {
          log(JSON.stringify({
            class: 'SingleResolver', query, innerResult, result}));
        }

        return result;
      }

      if (innerResult &&
        innerResult.edges &&
        innerResult.edges.length === 0 &&
        query.isNullValid) {
        return null;
      }

      if (innerResult &&
        innerResult.edges &&
        innerResult.edges.length === 0 &&
        !query.isNullValid) {
        throw new Error('SingleItemNotFound');
      }

      if (innerResult &&
        innerResult.edges &&
        innerResult.edges.length > 1) {
        throw new Error('SingleItemNotFound');
      }

      throw new Error('NotSupportedError (getSingleAsync)');

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'SingleResolver',
        function: 'resolveAsync',
        query, innerResult
      }));

      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }
}
