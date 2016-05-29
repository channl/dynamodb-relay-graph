/* @flow */
import BaseQuery from '../query/BaseQuery';
import SingleQuery from '../query/SingleQuery';
import Graph from '../graph/Graph';

export default class AggregateQuery extends BaseQuery {
  items: any[];

  constructor(graph: Graph, inner: ?BaseQuery, items: any[]) {
    super(graph, inner);
    this.items = items;
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this, false);
  }

  singleOrNull(): SingleQuery {
    return new SingleQuery(this.graph, this, true);
  }
}
