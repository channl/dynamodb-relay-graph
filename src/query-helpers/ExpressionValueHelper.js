/* @flow */
import ValueHelper from '../query-helpers/ValueHelper';

export default class ExpressionValueHelper {

  static isAfterExpression(expression: any): boolean {
    return typeof expression.after !== 'undefined';
  }

  static isBeforeExpression(expression: any): boolean {
    return typeof expression.before !== 'undefined';
  }

  static isBeginsWithExpression(expression: any): boolean {
    return typeof expression.begins_with !== 'undefined';
  }

  static isValueExpression(expression: any): boolean {
    return ValueHelper.isValue(expression);
  }
}
