/* @flow */
import Instrument from '../utils/Instrument';
import SingleOrNullQuery from '../query/SingleOrNullQuery';
import { invariant } from '../Global';
import type { Connection } from 'graphql-relay';
import type { Model } from '../flow/Types';

export default class SingleOrNullResolver {

  async resolveAsync(query: SingleOrNullQuery, innerResult: Connection): Promise<?Model> {
    return await Instrument.funcAsync(this, async () => {
      invariant(query, 'Argument \'query\' is null');
      invariant(innerResult, 'Argument \'innerResult\' is null');

      if (innerResult && innerResult.edges && innerResult.edges.length === 1) {
        let result = innerResult.edges[0].node;
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
    });
  }
}
