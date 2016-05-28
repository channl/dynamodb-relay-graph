/* @flow */
import SingleQuery from '../query/SingleQuery';
import BaseQuery from '../query/BaseQuery';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import invariant from 'invariant';

export default class EdgeConnectionQuery extends BaseQuery {
  expression: any;
  connectionArgs: any;
  isOut: boolean;

  constructor(
    inner: ?BaseQuery,
    expression: any,
    connectionArgs: any,
    isOut: boolean) {

    super(inner);
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(
      connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
    this.expression = expression;
    this.connectionArgs = connectionArgs;
    this.isOut = isOut;
  }

  out(expression: any): ToNodesConnectionQuery {
    return new ToNodesConnectionQuery(this, true, expression);
  }

  in(expression: any): ToNodesConnectionQuery {
    return new ToNodesConnectionQuery(this, false, expression);
  }

  single(): SingleQuery {
    return new SingleQuery(this, false);
  }

  singleOrNull(): SingleQuery {
    return new SingleQuery(this, true);
  }
}
