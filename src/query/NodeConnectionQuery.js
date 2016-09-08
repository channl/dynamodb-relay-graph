/* @flow */
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import SingleOrNullQuery from '../query/SingleOrNullQuery';
import ConnectionHelper from '../query-helpers/ConnectionHelper';
import invariant from 'invariant';
import type Graph from '../Graph';
import type { Connection } from 'graphql-relay';
import type { QueryExpression, ConnectionArgs, Model } from '../flow/Types';

export default class NodeConnectionQuery {
  graph: Graph;
  type: string;
  expression: QueryExpression;
  connectionArgs: ConnectionArgs;

  // eslint-disable-next-line max-len
  constructor(graph: Graph, type: string, expression: QueryExpression, connectionArgs: ConnectionArgs) {
    invariant(typeof graph !== 'undefined', 'Argument \'graph\' is undefined');
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    this.graph = graph;
    this.type = type;
    this.expression = expression;
    this.connectionArgs = connectionArgs;
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this);
  }

  singleOrNull(): SingleOrNullQuery {
    return new SingleOrNullQuery(this.graph, this);
  }

  // eslint-disable-next-line max-len
  out(type: string, expression: QueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    return new EdgeConnectionQuery(this.graph, this, type, expression, connectionArgs, true);
  }

  // eslint-disable-next-line max-len
  in(type: string, expression: QueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    return new EdgeConnectionQuery(this.graph, this, type, expression, connectionArgs, false);
  }

  async getAsync<T>(castFunc: (item: Model) => T = i => ((i: any): T)): Promise<Connection<T>> {
    if(this.inner != null) {
      invariant(false, 'Inner query type \'' +
        this.inner.constructor.name + '\' was not supported');
    }
    let connection = await this.graph._nodeConnectionResolver.resolveAsync(this);
    return ConnectionHelper.castTo(connection, castFunc);
  }
}
