/* @flow */
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import invariant from 'invariant';
import Graph from '../graph/Graph';

export default class NodeConnectionQuery extends BaseQuery {
  expression: any;
  connectionArgs: any;

  constructor(graph: Graph, inner: ?BaseQuery, expression: any, connectionArgs: any) {
    super(graph, inner);
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(
      connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    this.expression = expression;
    this.connectionArgs = connectionArgs;
  }

  out(expression: any, connectionArgs: any): EdgeConnectionQuery {
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, true);
  }

  in(expression: any, connectionArgs: any): EdgeConnectionQuery {
    return new EdgeConnectionQuery(this.graph, this, expression, connectionArgs, false);
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this, false);
  }

  singleOrNull(): SingleQuery {
    return new SingleQuery(this.graph, this, true);
  }
}
