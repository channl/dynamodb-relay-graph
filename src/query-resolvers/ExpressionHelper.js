/* @flow */
export default class ExpressionHelper {
  static isGlobalIdExpression(expression) {
    return typeof expression === 'string';
  }

  static isModelExpression(expression) {
    return this.isNodeModelExpression(expression) ||
      this.isEdgeModelExpression(expression);
  }

  static isNodeModelExpression(expression) {
    return typeof expression.type !== 'undefined' &&
      typeof expression.id !== 'undefined';
  }

  static isEdgeModelExpression(expression) {
    return typeof expression.type !== 'undefined' &&
      typeof expression.inID !== 'undefined' &&
      typeof expression.outID !== 'undefined';
  }

  static isTypeOnlyExpression(expression) {
    return Object.keys(expression).filter(name => name !== 'type').length === 0;
  }
}
