/* @flow */
import SingleQuery from '../query/SingleQuery';
import BaseQuery from '../query/BaseQuery';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import { invariant } from '../Global';
import Graph from '../graph/Graph';

import type { EdgeQueryExpression, ConnectionArgs } from '../flow/Types';

export default class EdgeConnectionQuery extends BaseQuery {
  expression: EdgeQueryExpression;
  connectionArgs: ConnectionArgs;
  isOut: boolean;

  constructor(
    graph: Graph,
    inner: ?BaseQuery,
    expression: EdgeQueryExpression,
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

  out(expression: EdgeQueryExpression): ToNodesConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    return new ToNodesConnectionQuery(this.graph, this, true, expression);
  }

  in(expression: EdgeQueryExpression): ToNodesConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    return new ToNodesConnectionQuery(this.graph, this, false, expression);
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this, false);
  }

  singleOrNull(): SingleQuery {
    return new SingleQuery(this.graph, this, true);
  }
}
