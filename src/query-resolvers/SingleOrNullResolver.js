/* @flow */
import invariant from 'invariant';
import Instrument from '../logging/Instrument';
import SingleOrNullQuery from '../query/SingleOrNullQuery';
import type { Connection } from 'graphql-relay';
// eslint-disable-next-line no-unused-vars
import type { Model } from '../flow/Types';

export default class SingleOrNullResolver {

  async resolveAsync<T: Model>(query: SingleOrNullQuery, innerResult: Connection<T>): Promise<?T> {
    // eslint-disable-next-line max-len, no-caller
    return await Instrument.funcAsync(this, arguments, async () => {
      invariant(query, 'Argument \'query\' is null');
      invariant(innerResult, 'Argument \'innerResult\' is null');

      if (innerResult && innerResult.edges && innerResult.edges.length === 1) {
        let result = innerResult.edges[0].node;
        return result;
      }

      if (innerResult &&
        innerResult.edges &&
        innerResult.edges.length === 0) {
        return null;
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
