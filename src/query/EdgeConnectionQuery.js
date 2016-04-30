import SingleQuery from '../query/SingleQuery';
import BaseQuery from '../query/BaseQuery';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import Guard from '../model/Guard';

export default class EdgeConnectionQuery extends BaseQuery {
  constructor(inner, expression, connectionArgs, isOut) {
    super(inner);
    Guard(expression, 'expression').isNotUndefinedOrNull();
    Guard(connectionArgs, 'connectionArgs').isNotUndefinedOrNull();
    this.expression = expression;
    this.connectionArgs = connectionArgs;
    this.isOut = isOut;
  }

  out(expression) {
    return new ToNodesConnectionQuery(this, true, expression);
  }

  in(expression) {
    return new ToNodesConnectionQuery(this, false, expression);
  }

  single() {
    return new SingleQuery(this, false);
  }

  singleOrNull() {
    return new SingleQuery(this, true);
  }
}
