/* @flow */
import BaseQuery from '../query/BaseQuery';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import ConnectionHelper from '../query-helpers/ConnectionHelper';
import invariant from 'invariant';
import Graph from '../Graph';
import type { Connection } from 'graphql-relay';
import type { QueryExpression, ConnectionArgs, EdgeModel, NodeModel } from '../flow/Types';

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
/*
  cast<T>(castFunc: (item: EdgeModel) => T): CastConnectionQuery<T> {
    return new CastConnectionQuery(this.graph, this, castFunc);
  }
*/
  async getAsync<T>(castFunc: (item: EdgeModel) => T = i => ((i: any): T)): Promise<Connection<T>> {
    let innerResult = await this.getInnerResultAsync();
    let connection = await this.graph._edgeConnectionResolver.resolveAsync(this, innerResult);
    return ConnectionHelper.castTo(connection, castFunc);
  }

  async getInnerResultAsync(): Promise<Connection<NodeModel>> {
    if (this.inner == null) {
      let result: Connection<NodeModel> = {
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
