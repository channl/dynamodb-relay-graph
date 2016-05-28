/* @flow */
import invariant from 'invariant';

export default class BaseQuery {
  inner: ?BaseQuery;

  constructor(inner: ?BaseQuery) {
    invariant(typeof inner !== 'undefined', 'Argument \'inner\' is undefined');
    this.inner = inner;
  }

  async getAsync(): Promise<any> {
    invariant('NotImplemented');
  }
}
