/* @flow */
import { invariant } from '../Global';
import BaseQuery from '../query/BaseQuery';
import SingleQuery from '../query/SingleQuery';
import Graph from '../graph/Graph';

export default class AggregateQuery extends BaseQuery {
  items: any[];

  constructor(graph: Graph, inner: ?BaseQuery, items: any[]) {
    super(graph, inner);

    invariant(items, 'Argument \'items\' is null');
    this.items = items;
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this, false);
  }

  singleOrNull(): SingleQuery {
    return new SingleQuery(this.graph, this, true);
  }
}
