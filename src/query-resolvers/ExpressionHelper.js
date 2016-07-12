/* @flow */
import type { QueryExpression } from '../flow/Types.js';

export default class ExpressionHelper {
  static isGlobalIdExpression(expression: QueryExpression): boolean {
    return typeof expression === 'string';
  }

  static isModelExpression(expression: QueryExpression): boolean {
    return this.isNodeModelExpression(expression) || this.isEdgeModelExpression(expression);
  }

  static isNodeModelExpression(expression: QueryExpression): boolean {
    // $FlowIgnore
    return expression.type != null && expression.id != null;
  }

  static isEdgeModelExpression(expression: QueryExpression): boolean {
    // $FlowIgnore
    return expression.type != null && expression.inID != null && expression.outID != null;
  }

  static isTypeOnlyExpression(expression: QueryExpression): boolean {
    return Object.keys(expression).filter(name => name !== 'type').length === 0;
  }
}
