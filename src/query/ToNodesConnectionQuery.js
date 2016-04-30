import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import Guard from '../util/Guard';

export default class ToNodesConnectionQuery extends BaseQuery {
  constructor(inner, isOut, expression) {
    super(inner);
    Guard(isOut, 'isOut').isBoolean().isNotNull();
    Guard(expression, 'expression').isNotUndefinedOrNull();
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
