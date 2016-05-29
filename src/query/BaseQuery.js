/* @flow */
import { invariant } from '../Global';
import Graph from '../graph/Graph';

export default class BaseQuery {
  graph: Graph;
  inner: ?BaseQuery;

  constructor(graph: Graph, inner: ?BaseQuery) {
    invariant(typeof graph !== 'undefined', 'Argument \'graph\' is undefined');
    invariant(typeof inner !== 'undefined', 'Argument \'inner\' is undefined');
    this.graph = graph;
    this.inner = inner;
  }

  async getAsync(): Promise<any> {
    return this.graph.getAsync(this);
  }
}
