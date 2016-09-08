/* @flow */
import { invariant } from '../Global';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import type Graph from '../Graph';
import type { Model } from '../flow/Types';

export type Query = EdgeConnectionQuery | NodeConnectionQuery | ToNodesConnectionQuery;

export default class SingleOrNullQuery {
  graph: Graph;
  inner: Query;

  constructor(graph: Graph, inner: Query) {
    invariant(typeof graph !== 'undefined', 'Argument \'graph\' is undefined');
    invariant(typeof inner !== 'undefined', 'Argument \'inner\' is undefined');
    this.graph = graph;
    this.inner = inner;
  }

  async getAsync<T>(castFunc: (item: Model) => T = i => ((i: any): T)): Promise<?T> {
    if (this.inner instanceof NodeConnectionQuery) {
      let innerResult = await this.inner.getAsync();
      let result = await this.graph._singleOrNullResolver.resolveAsync(this, innerResult);
      if (result == null) {
        return null;
      }

      return castFunc(result);
    }

    invariant(false, 'Inner query type not supported');
  }
}
