/* @flow */
import { invariant } from '../Global';
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import ConnectionHelper from '../query-helpers/ConnectionHelper';
import Graph from '../Graph';
import type { Connection } from 'graphql-relay';
import type { QueryExpression, ConnectionArgs, EdgeModel, NodeModel } from '../flow/Types';

export default class ToNodesConnectionQuery extends BaseQuery {
  isOut: boolean;
  expression: QueryExpression;

  constructor(graph: Graph, inner: ?BaseQuery, isOut: boolean, expression: QueryExpression) {
    super(graph, inner);
    invariant(typeof isOut === 'boolean', 'Argument \'isOut\' must be boolean');
    invariant(expression, 'Argument \'expression\' is null');
    this.isOut = isOut;
    this.expression = expression;
  }

  out(expression: QueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, true);
  }

  in(expression: QueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, false);
  }
/*
  cast<T>(castFunc: (item: EdgeModel) => T): CastConnectionQuery<T> {
    return new CastConnectionQuery(this.graph, this, castFunc);
  }
*/
  async getAsync<T>(castFunc: (item: NodeModel) => T = i => ((i: any): T)): Promise<Connection<T>> {
    let innerResult = await this.getInnerResultAsync();
    let connection = await this.graph._toNodesConnectionResolver.resolveAsync(this, innerResult);
    return ConnectionHelper.castTo(connection, castFunc);
  }

  async getInnerResultAsync(): Promise<Connection<EdgeModel>> {
    if (this.inner == null) {
      let result: Connection<EdgeModel> = {
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

    if (this.inner instanceof EdgeConnectionQuery) {
      return await this.inner.getAsync();
    }

    invariant(false, 'Inner query type \'' + this.inner.constructor.name + '\' was not supported');
  }
}
