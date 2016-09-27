/* @flow */
import invariant from 'invariant';
import uuid from 'node-uuid';
import type { Value } from '../flow/Types';

export default class TypeHelper {

  static getTypeName(tableName: string) {
    invariant(typeof tableName === 'string', 'Argument \'tableName\' is not a string');
    return tableName.substr(0, tableName.length - 1);
  }

  static getTableName(type: string) {
    invariant(typeof type === 'string', 'Argument \'type\' is not a string');
    return type + 's';
  }

  static getTypeMaxValue(asType: string): Value {
    invariant(typeof asType === 'string', 'Argument \'asType\' is not a string');

    switch (asType) {
      case 'S':
        return 'ZZZZZZZZZZ';
      case 'N':
        return Number.MAX_SAFE_INTEGER;
      case 'B':
        return new Buffer(uuid.parse('ffffffff-ffff-ffff-ffff-ffffffffffff'));
      default:
        invariant(false, 'Type was invalid');
    }
  }

  static getTypeMinValue(asType: string): Value {
    invariant(typeof asType === 'string', 'Argument \'asType\' is not a string');

    switch (asType) {
      case 'S':
        return ' ';
      case 'N':
        return 0;
      case 'B':
        return new Buffer(uuid.parse('00000000-0000-0000-0000-000000000000'));
      default:
        invariant(false, 'Type was invalid');
    }
  }
}
