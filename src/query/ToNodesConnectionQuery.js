import invariant from 'invariant';
import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';

export default class ToNodesConnectionQuery extends BaseQuery {
  constructor(inner, isOut, expression) {
    super(inner);
    invariant(typeof isOut === 'boolean', 'Argument \'isOut\' must be boolean');
    invariant(expression, 'Argument \'expression\' is null');
    this.isOut = isOut;
    this.expression = expression;
  }

  out(expression, connectionArgs) {
    return new EdgeConnectionQuery(this, expression, connectionArgs, true);
  }

  in(expression, connectionArgs) {
    return new EdgeConnectionQuery(this, expression, connectionArgs, false);
  }

  single() {
    return new SingleQuery(this, false);
  }

  singleOrNull() {
    return new SingleQuery(this, true);
  }
}
