/* @flow */
import { invariant } from '../Global';
import Graph from '../Graph';

export default class BaseQuery {
  graph: Graph;
  inner: ?BaseQuery;

  constructor(graph: Graph, inner: ?BaseQuery) {
    invariant(typeof graph !== 'undefined', 'Argument \'graph\' is undefined');
    this.graph = graph;
    this.inner = inner;
  }
}
