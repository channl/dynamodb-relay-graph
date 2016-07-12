/* @flow */
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import { invariant } from '../Global';
import Graph from '../graph/Graph';

import type {
  NodeQueryExpression,
  EdgeQueryExpression,
  ConnectionArgs
} from '../flow/Types';

export default class NodeConnectionQuery extends BaseQuery {
  expression: NodeQueryExpression;
  connectionArgs: ConnectionArgs;

  constructor(graph: Graph, inner: ?BaseQuery,
    expression: NodeQueryExpression,
    connectionArgs: ConnectionArgs) {
    super(graph, inner);
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    this.expression = expression;
    this.connectionArgs = connectionArgs;
  }

  out(expression: EdgeQueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, true);
  }

  in(expression: EdgeQueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, false);
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this, false);
  }

  singleOrNull(): SingleQuery {
    return new SingleQuery(this.graph, this, true);
  }
}
