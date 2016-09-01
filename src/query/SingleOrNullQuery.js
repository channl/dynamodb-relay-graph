/* @flow */
import { invariant } from '../Global';
import BaseQuery from '../query/BaseQuery';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import Graph from '../Graph';
import type { Model } from '../flow/Types';

export default class SingleOrNullQuery extends BaseQuery {
  constructor(graph: Graph, inner: BaseQuery) {
    super(graph, inner);
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
