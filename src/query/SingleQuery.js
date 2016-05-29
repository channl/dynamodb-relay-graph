/* @flow */
import invariant from 'invariant';
import BaseQuery from '../query/BaseQuery';
import Graph from '../graph/Graph';

export default class SingleQuery extends BaseQuery {
  isNullValid: boolean;

  constructor(graph: Graph, inner: ?BaseQuery, isNullValid: boolean) {
    super(graph, inner);
    invariant(
      typeof isNullValid === 'boolean',
      'Argument \'isNullValid\' must be a boolean');

    this.isNullValid = isNullValid;
  }
}
