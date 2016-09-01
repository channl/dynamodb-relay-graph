/* @flow */
import { invariant } from '../Global';
import Graph from '../Graph';
import SingleQuery from '../query/SingleQuery';
import SingleOrNullQuery from '../query/SingleOrNullQuery';

export default class BaseQuery {
  graph: Graph;
  inner: ?BaseQuery;

  constructor(graph: Graph, inner: ?BaseQuery) {
    invariant(typeof graph !== 'undefined', 'Argument \'graph\' is undefined');
    this.graph = graph;
    this.inner = inner;
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this);
  }

  singleOrNull(): SingleOrNullQuery {
    return new SingleOrNullQuery(this.graph, this);
  }
}
