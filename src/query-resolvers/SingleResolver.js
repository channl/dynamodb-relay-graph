/* @flow */
import invariant from 'invariant';
import Instrument from '../logging/Instrument';
import SingleQuery from '../query/SingleQuery';
import type { Connection } from 'graphql-relay';
// eslint-disable-next-line no-unused-vars
import type { Model } from '../flow/Types';

export default class SingleResolver {

  async resolveAsync<T: Model>(query: SingleQuery, innerResult: Connection<T>): Promise<T> {
    // eslint-disable-next-line max-len, no-caller
    return await Instrument.funcAsync(this, arguments, async () => {
      invariant(query, 'Argument \'query\' is null');
      invariant(innerResult, 'Argument \'innerResult\' is null');

      if (innerResult && innerResult.edges && innerResult.edges.length === 1) {
        return innerResult.edges[0].node;
      }

      throw new Error('SingleItemNotFound');
    });
  }
}
