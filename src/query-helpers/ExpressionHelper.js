/* @flow */
import { invariant } from '../Global';
import ModelHelper from '../query-helpers/ModelHelper';
import type { QueryExpression } from '../flow/Types';

export default class ExpressionHelper {

  static toGlobalId(expression: QueryExpression): string {
    invariant(ExpressionHelper.isModelExpression(expression), 'Expression is invalid');
    return ModelHelper.toGlobalId(expression);
  }

  static isModelExpression(expression: QueryExpression): boolean {
    return this.isNodeModelExpression(expression) || this.isEdgeModelExpression(expression);
  }

  static isNodeModelExpression(expression: QueryExpression): boolean {
    return expression.type != null && expression.id != null;
  }

  static isEdgeModelExpression(expression: QueryExpression): boolean {
    return expression.type != null && expression.inID != null && expression.outID != null;
  }

  static isTypeOnlyExpression(expression: QueryExpression): boolean {
    return Object.keys(expression).filter(name => name !== 'type').length === 0;
  }
}
