/* @flow */
import { invariant } from '../Global';
import type { Options } from '../flow/Types';
import BaseQuery from '../query/BaseQuery';

export default class BaseResolver {

  canResolve(query: BaseQuery): boolean { // eslint-disable-line no-unused-vars
    invariant('NotImplemented');
    return false;
  }

  async resolveAsync(
    query: Object,
    innerResult: Object,
    options: ?Options): Promise<?Object> { // eslint-disable-line no-unused-vars
    invariant('NotImplemented');
  }
}
