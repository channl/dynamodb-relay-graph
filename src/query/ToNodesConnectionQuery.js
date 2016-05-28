/* @flow */
import invariant from 'invariant';
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';

export default class ToNodesConnectionQuery extends BaseQuery {
  isOut: boolean;
  expression: any;

  constructor(inner: ?BaseQuery, isOut: boolean, expression: any) {
    super(inner);
    invariant(typeof isOut === 'boolean', 'Argument \'isOut\' must be boolean');
    invariant(expression, 'Argument \'expression\' is null');
    this.isOut = isOut;
    this.expression = expression;
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
