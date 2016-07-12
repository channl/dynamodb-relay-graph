/* @flow */
import { invariant } from '../Global';
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import Graph from '../graph/Graph';
import type { Connection } from 'graphql-relay';
import type {
  EdgeQueryExpression,
  ConnectionArgs,
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
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, true);
  }

  in(expression: EdgeQueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
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
