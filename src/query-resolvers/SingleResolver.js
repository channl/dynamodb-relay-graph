/* @flow */
import Instrument from '../utils/Instrument';
import SingleQuery from '../query/SingleQuery';
import { invariant } from '../Global';
import type { Connection } from 'graphql-relay';
import type { Model } from '../flow/Types';

export default class SingleResolver {

  async resolveAsync(query: SingleQuery, innerResult: Connection): Promise<Model> {
    return await Instrument.funcAsync(this, async () => {
      invariant(query, 'Argument \'query\' is null');
      invariant(innerResult, 'Argument \'innerResult\' is null');

      if (innerResult && innerResult.edges && innerResult.edges.length === 1) {
        return innerResult.edges[0].node;
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
