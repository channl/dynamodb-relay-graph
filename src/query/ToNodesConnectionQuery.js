/* @flow */
import invariant from 'invariant';
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import Graph from '../graph/Graph';

import type {
  EdgeQueryExpression,
  ConnectionArgs,
  Connection,
} from '../flow/Types';

export default class ToNodesConnectionQuery extends BaseQuery {
  isOut: boolean;
  expression: EdgeQueryExpression;

  constructor(graph: Graph, inner: ?BaseQuery, isOut: boolean, expression: EdgeQueryExpression) {
    super(graph, inner);
    invariant(typeof isOut === 'boolean', 'Argument \'isOut\' must be boolean');
    invariant(expression, 'Argument \'expression\' is null');
    this.isOut = isOut;
    this.expression = expression;
  }

  out(expression: EdgeQueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, true);
  }

  in(expression: EdgeQueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, false);
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this, false);
  }

  singleOrNull(): SingleQuery {
    return new SingleQuery(this.graph, this, true);
  }

  async getAsync(): Promise<Connection> {
    return this.graph.getAsync(this);
  }
}
