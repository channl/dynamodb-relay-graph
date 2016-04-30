import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import Guard from '../util/Guard';

export default class NodeConnectionQuery extends BaseQuery {
  constructor(inner, expression, connectionArgs) {
    super(inner);
    Guard(expression, 'expression').isNotUndefinedOrNull();
    Guard(connectionArgs, 'connectionArgs').isNotUndefinedOrNull();
    this.expression = expression;
    this.connectionArgs = connectionArgs;
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
