/* @flow */
import invariant from 'invariant';
import Instrument from '../utils/Instrument';
import SingleQuery from '../query/SingleQuery';
import type { Connection } from 'graphql-relay';
// eslint-disable-next-line no-unused-vars
import type { Model } from '../flow/Types';

export default class SingleResolver {

  async resolveAsync<T: Model>(query: SingleQuery, innerResult: Connection<T>): Promise<T> {
    return await Instrument.funcAsync(this, async () => {
      invariant(query, 'Argument \'query\' is null');
      invariant(innerResult, 'Argument \'innerResult\' is null');

      if (innerResult && innerResult.edges && innerResult.edges.length === 1) {
        return innerResult.edges[0].node;
      }

      throw new Error('SingleItemNotFound');
    });
  }
}
