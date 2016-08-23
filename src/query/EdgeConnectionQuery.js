/* @flow */
import SingleQuery from '../query/SingleQuery';
import SingleOrNullQuery from '../query/SingleOrNullQuery';
import BaseQuery from '../query/BaseQuery';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import { invariant } from '../Global';
import Graph from '../Graph';
import type { Connection } from 'graphql-relay';
// eslint-disable-next-line no-unused-vars
import type { QueryExpression, ConnectionArgs, DRGEdge } from '../flow/Types';

export default class EdgeConnectionQuery extends BaseQuery {
  expression: QueryExpression;
  connectionArgs: ConnectionArgs;
  isOut: boolean;

  constructor(
    graph: Graph,
    inner: ?BaseQuery,
    expression: QueryExpression,
    connectionArgs: ConnectionArgs,
    isOut: boolean) {

    super(graph, inner);
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    invariant(typeof isOut === 'boolean', 'Argument \'isOut\' is not boolean');
    this.expression = expression;
    this.connectionArgs = connectionArgs;
    this.isOut = isOut;
  }

  out(expression: QueryExpression): ToNodesConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    return new ToNodesConnectionQuery(this.graph, this, true, expression);
  }

  in(expression: QueryExpression): ToNodesConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    return new ToNodesConnectionQuery(this.graph, this, false, expression);
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this);
  }

  singleOrNull(): SingleOrNullQuery {
    return new SingleOrNullQuery(this.graph, this);
  }

  async getAsync<T: DRGEdge>(): Promise<Connection<T>> {
    let innerResult = await this.getInnerResultAsync();
    return await this.graph._edgeConnectionResolver.resolveAsync(this, innerResult);
  }

  async getInnerResultAsync<T: DRGEdge>(): Promise<Connection<T>> {
    if (this.inner == null) {
      let result: Connection<T> = {
        edges: [],
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          hasNextPage: false,
        }
      };
      return result;
    }

    if (this.inner instanceof NodeConnectionQuery) {
      return await this.inner.getAsync();
    }

    invariant(false, 'Inner query type \'' + this.inner.constructor.name + '\' was not supported');
  }
}
