/* @flow */
import BaseQuery from '../query/BaseQuery';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import ConnectionHelper from '../query-helpers/ConnectionHelper';
import invariant from 'invariant';
import Graph from '../Graph';
import type { Connection } from 'graphql-relay';
import type { EdgeModel } from '../flow/Types';

export default class CastConnectionQuery<T> extends BaseQuery {
  _castFunc: (item: EdgeModel) => T;

  constructor(
    graph: Graph,
    inner: ?BaseQuery,
    castFunc: (item: EdgeModel) => T) {

    super(graph, inner);
    this._castFunc = castFunc;
  }

  async getAsync(): Promise<Connection<T>> {
    invariant(this.inner != null, 'Inner query cannot be null');

    if (this.inner instanceof NodeConnectionQuery ||
        this.inner instanceof EdgeConnectionQuery ||
        this.inner instanceof ToNodesConnectionQuery) {
      let connection = await this.inner.getAsync();
      return ConnectionHelper.castTo(connection, this._castFunc);
    }

    invariant(false, 'Inner query type \'' + this.inner.constructor.name + '\' was not supported');
  }
}
