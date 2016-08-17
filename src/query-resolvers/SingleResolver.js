/* @flow */
import Instrument from '../utils/Instrument';
import SingleQuery from '../query/SingleQuery';
import { invariant } from '../Global';

export default class SingleResolver {

  async resolveAsync(query: SingleQuery, innerResult: ?Object): Promise<?Object> {
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
