/* @flow */
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import SingleOrNullQuery from '../query/SingleOrNullQuery';
import ConnectionHelper from '../query-helpers/ConnectionHelper';
import invariant from 'invariant';
import type Graph from '../Graph';
import type { Connection } from 'graphql-relay';
import type { QueryExpression, ConnectionArgs, Model } from '../flow/Types';

export default class EdgeConnectionQuery {
  graph: Graph;
  inner: ?NodeConnectionQuery | ?ToNodesConnectionQuery;
  type: string;
  expression: QueryExpression;
  connectionArgs: ConnectionArgs;
  isOut: boolean;

  constructor(
    graph: Graph,
    inner: ?NodeConnectionQuery | ?ToNodesConnectionQuery,
    type: string,
    expression: QueryExpression,
    connectionArgs: ConnectionArgs,
    isOut: boolean) {

    invariant(typeof graph !== 'undefined', 'Argument \'graph\' is undefined');
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    invariant(typeof isOut === 'boolean', 'Argument \'isOut\' is not boolean');
    this.graph = graph;
    this.inner = inner;
    this.type = type;
    this.expression = expression;
    this.connectionArgs = connectionArgs;
    this.isOut = isOut;
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this);
  }

  singleOrNull(): SingleOrNullQuery {
    return new SingleOrNullQuery(this.graph, this);
  }

  out(type: string, expression: QueryExpression): ToNodesConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    return new ToNodesConnectionQuery(this.graph, this, type, true, expression);
  }

  in(type: string, expression: QueryExpression): ToNodesConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    return new ToNodesConnectionQuery(this.graph, this, type, false, expression);
  }

  async getAsync<T>(castFunc: (item: Model) => T = i => ((i: any): T)): Promise<Connection<T>> {
    let innerResult = await this.getInnerResultAsync();
    let connection = await this.graph._edgeConnectionResolver.resolveAsync(this, innerResult);
    return ConnectionHelper.castTo(connection, castFunc);
  }

  async getInnerResultAsync(): Promise<Connection<Model>> {
    if (this.inner == null) {
      let result: Connection<Model> = {
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
