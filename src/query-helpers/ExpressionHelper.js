/* @flow */
import { invariant } from '../Global';
import AWSConvertor from '../query-helpers/AWSConvertor';
import type { QueryExpression } from '../flow/Types';

export default class ExpressionHelper {

  static getGlobalIdFromExpression(expression: QueryExpression): string {
    if (ExpressionHelper.isGlobalIdExpression(expression) && typeof expression === 'string') {
      return expression;
    }

    if (ExpressionHelper.isModelExpression(expression)) {
      return AWSConvertor.getGlobalIdFromModel(expression);
    }

    invariant(false, 'Unsupported QueryExpression');
  }

  static isGlobalIdExpression(expression: QueryExpression): boolean {
    return typeof expression === 'string';
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
