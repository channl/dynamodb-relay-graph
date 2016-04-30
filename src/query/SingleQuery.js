import BaseQuery from '../query/BaseQuery';
import Guard from '../util/Guard';

export default class SingleQuery extends BaseQuery {
  constructor(inner, isNullValid) {
    super(inner);
    Guard(isNullValid, 'isNullValid').isBoolean().isNotNull();
    this.isNullValid = isNullValid;
  }
}
