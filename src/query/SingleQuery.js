/* @flow */
import invariant from 'invariant';
import BaseQuery from '../query/BaseQuery';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import Graph from '../Graph';
// eslint-disable-next-line no-unused-vars
import type { Model } from '../flow/Types';

export default class SingleQuery extends BaseQuery {
  constructor(graph: Graph, inner: BaseQuery) {
    super(graph, inner);
  }

  async getAsync<T>(castFunc: (item: Model) => T = i => ((i: any): T)): Promise<T> {
    if (this.inner instanceof NodeConnectionQuery) {
      let innerResult = await this.inner.getAsync();
      let result = await this.graph._singleResolver.resolveAsync(this, innerResult);
      invariant(result != null, 'Result was null');
      return castFunc(result);
    }

    invariant(false, 'Inner query type not supported');
  }
}
