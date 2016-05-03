import invariant from 'invariant';

export default class BaseQuery {
  constructor(inner) {
    invariant(typeof inner !== 'undefined', 'Argument \'inner\' is undefined');
    this.inner = inner;
  }
}
