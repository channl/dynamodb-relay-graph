/* @flow */
import { invariant } from '../Global';
import BaseQuery from '../query/BaseQuery';
import Graph from '../Graph';

export default class SingleQuery extends BaseQuery {
  isNullValid: boolean;

  constructor(graph: Graph, inner: ?BaseQuery, isNullValid: boolean) {
    super(graph, inner);

    invariant(typeof isNullValid === 'boolean', 'Argument \'isNullValid\' must be a boolean');
    this.isNullValid = isNullValid;
  }
}
