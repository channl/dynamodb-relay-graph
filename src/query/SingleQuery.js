/* @flow */
import invariant from 'invariant';
import BaseQuery from '../query/BaseQuery';

export default class SingleQuery extends BaseQuery {
  isNullValid: boolean;

  constructor(inner: ?BaseQuery, isNullValid: boolean) {
    super(inner);
    invariant(
      typeof isNullValid === 'boolean',
      'Argument \'isNullValid\' must be a boolean');

    this.isNullValid = isNullValid;
  }
}
