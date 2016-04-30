import Guard from '../util/Guard';

export default class BaseQuery {
  constructor(inner) {
    Guard(inner, 'inner').isNotUndefined();
    this.inner = inner;
  }
}
