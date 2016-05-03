import invariant from 'invariant';
import BaseQuery from '../query/BaseQuery';

export default class SingleQuery extends BaseQuery {
  constructor(inner, isNullValid) {
    super(inner);
    invariant(
      typeof isNullValid === 'boolean',
      'Argument \'isNullValid\' must be a boolean');

    this.isNullValid = isNullValid;
  }
}
