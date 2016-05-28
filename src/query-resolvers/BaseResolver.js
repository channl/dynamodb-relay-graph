/* @flow */
import { invariant } from '../Global';

export default class BaseResolver {

  canResolve(query: any): boolean { // eslint-disable-line no-unused-vars
    invariant('NotImplemented');
    return false;
  }

  async resolveAsync(
    query: any,
    innerResult: any,
    options: any): Promise<any> { // eslint-disable-line no-unused-vars
    invariant('NotImplemented');
  }
}
