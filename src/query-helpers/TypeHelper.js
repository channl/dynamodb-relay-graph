/* @flow */
import { invariant } from '../Global';

export default class TypeHelper {

  static getTypeName(tableName: string) {
    invariant(typeof tableName === 'string', 'Argument \'tableName\' is not a string');
    return tableName.substr(0, tableName.length - 1);
  }

  static getTableName(type: string) {
    invariant(typeof type === 'string', 'Argument \'type\' is not a string');
    return type + 's';
  }
}
