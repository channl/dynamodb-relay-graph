/* @flow */
import BaseQuery from '../query/BaseQuery';
import SingleQuery from '../query/SingleQuery';

export default class AggregateQuery extends BaseQuery {
  items: any[];

  constructor(inner: ?BaseQuery, items: any[]) {
    super(inner);
    this.items = items;
  }

  single(): SingleQuery {
    return new SingleQuery(this, false);
  }

  singleOrNull(): SingleQuery {
    return new SingleQuery(this, true);
  }
}
