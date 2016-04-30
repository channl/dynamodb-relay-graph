import BaseQuery from '../query/BaseQuery';
import SingleQuery from '../query/SingleQuery';

export default class AggregateQuery extends BaseQuery {
  constructor(inner, items) {
    super(inner);
    this.items = items;
  }

  single() {
    return new SingleQuery(this, false);
  }

  singleOrNull() {
    return new SingleQuery(this, true);
  }
}
