/* @flow */
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import SingleOrNullQuery from '../query/SingleOrNullQuery';
import { invariant } from '../Global';
import Graph from '../Graph';
import type { Connection } from 'graphql-relay';
// eslint-disable-next-line no-unused-vars
import type { QueryExpression, ConnectionArgs, Model } from '../flow/Types';

export default class NodeConnectionQuery extends BaseQuery {
  expression: QueryExpression;
  connectionArgs: ConnectionArgs;

  constructor(graph: Graph, inner: ?BaseQuery, expression: QueryExpression,
    connectionArgs: ConnectionArgs) {
    super(graph, inner);

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

  single(): SingleQuery {
    return new SingleQuery(this.graph, this);
  }

  singleOrNull(): SingleOrNullQuery {
    return new SingleOrNullQuery(this.graph, this);
  }

  async getAsync<T: Model>(): Promise<Connection<T>> {
    if(this.inner != null) {
      invariant(false, 'Inner query type \'' +
      this.inner.constructor.name + '\' was not supported');
    }
    return await this.graph._nodeConnectionResolver.resolveAsync(this);
  }
}
