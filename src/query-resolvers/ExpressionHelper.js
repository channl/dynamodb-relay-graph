export default class ExpressionHelper {
  static isNodeGlobalIdExpression(expression) {
    return typeof expression === 'string';
  }

  static isNodeTypeAndIdExpression(expression) {
    return typeof expression.type !== 'undefined' &&
      typeof expression.id !== 'undefined';
  }

  static isEdgeExpression(expression) {
    return typeof expression.type !== 'undefined' &&
      typeof expression.inID !== 'undefined' &&
      typeof expression.outID !== 'undefined';
  }

  static isTypeOnlyExpression(expression) {
    return Object.keys(expression).filter(name => name !== 'type').length === 0;
  }
}
