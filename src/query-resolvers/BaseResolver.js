/* @flow */
import { invariant } from '../Global';
import type { Options } from '../flow/Types';

export default class BaseResolver {

  canResolve(query: any): boolean { // eslint-disable-line no-unused-vars
    invariant('NotImplemented');
    return false;
  }

  async resolveAsync(
    query: any,
    innerResult: any,
    options: Options): Promise<any> { // eslint-disable-line no-unused-vars
    invariant('NotImplemented');
  }
}
