/* @flow */
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import invariant from 'invariant';

export default class NodeConnectionQuery extends BaseQuery {
  expression: any;
  connectionArgs: any;

  constructor(inner: ?BaseQuery, expression: any, connectionArgs: any) {
    super(inner);
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(
      connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    this.expression = expression;
    this.connectionArgs = connectionArgs;
  }

  out(expression: any, connectionArgs: any): EdgeConnectionQuery {
    return new EdgeConnectionQuery(this, expression, connectionArgs, true);
  }

  in(expression: any, connectionArgs: any): EdgeConnectionQuery {
    return new EdgeConnectionQuery(this, expression, connectionArgs, false);
  }

  single(): SingleQuery {
    return new SingleQuery(this, false);
  }

  singleOrNull(): SingleQuery {
    return new SingleQuery(this, true);
  }
}
