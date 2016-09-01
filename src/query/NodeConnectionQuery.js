/* @flow */
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import ConnectionHelper from '../query-helpers/ConnectionHelper';
import invariant from 'invariant';
import Graph from '../Graph';
import type { Connection } from 'graphql-relay';
// eslint-disable-next-line no-unused-vars
import type { QueryExpression, ConnectionArgs, Model, NodeModel } from '../flow/Types';

export default class NodeConnectionQuery extends BaseQuery {
  expression: QueryExpression;
  connectionArgs: ConnectionArgs;

  constructor(graph: Graph, expression: QueryExpression, connectionArgs: ConnectionArgs) {
    super(graph);
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    this.expression = expression;
    this.connectionArgs = connectionArgs;
  }

  out(expression: QueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, true);
  }

  in(expression: QueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, false);
  }
/*
  cast<T>(castFunc: (item: NodeModel) => T): CastConnectionQuery<T> {
    return new CastConnectionQuery(this.graph, this, castFunc);
  }
*/
  async getAsync<T>(castFunc: (item: Model) => T = i => ((i: any): T)): Promise<Connection<T>> {
    if(this.inner != null) {
      invariant(false, 'Inner query type \'' +
      this.inner.constructor.name + '\' was not supported');
    }
    let connection = await this.graph._nodeConnectionResolver.resolveAsync(this);
    return ConnectionHelper.castTo(connection, castFunc);
  }
}
