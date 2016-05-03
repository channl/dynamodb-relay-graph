import BaseQuery from '../query/BaseQuery';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import invariant from 'invariant';

export default class NodeConnectionQuery extends BaseQuery {
  constructor(inner, expression, connectionArgs) {
    super(inner);
    invariant(expression, 'Argument \'expression\' is null or undefined');
    invariant(
      connectionArgs, 'Argument \'connectionArgs\' is null or undefined');
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
