/* @flow */
import { invariant } from '../Global';
import type { AttributeValue } from 'aws-sdk-promise';
import type { Value } from '../flow/Types';

export default class ValueHelper {

  static isValue(value: Value): boolean {
    if (value instanceof Buffer) {
      return true;
    }

    if (typeof value === 'string') {
      return true;
    }

    if (typeof value === 'number') {
      return true;
    }

    if (typeof value === 'boolean') {
      return true;
    }

    if (Array.isArray(value) && value.every(i => i instanceof Buffer)) {
      return true;
    }

    if (Array.isArray(value) && value.every(i => typeof i === 'string')) {
      return true;
    }

    if (Array.isArray(value) && value.every(i => typeof i === 'number')) {
      return true;
    }

    return false;
  }

  static toAttributeValue(value: Value): AttributeValue {
    if (value instanceof Buffer) {
      return { B: value };
    }

    if (typeof value === 'string') {
      return { S: value };
    }

    if (typeof value === 'number') {
      return { N: value.toString(10) };
    }

    if (typeof value === 'boolean') {
      return { BOOL: value };
    }

    if (Array.isArray(value) && value.every(i => i instanceof Buffer)) {
      // $FlowIgnore
      let BS: Buffer[] = value;
      return { BS };
    }

    if (Array.isArray(value) && value.every(i => typeof i === 'string')) {
      // $FlowIgnore
      let SS: string[] = value;
      return { SS };
    }

    if (Array.isArray(value) && value.every(i => typeof i === 'number')) {
      let NS = value.map(i => i.toString(10));
      return { NS };
    }

    invariant(false, 'Attribute of type \'' + typeof value +
      '\' could not be converted to an AttributeValue');
  }

  static compare(a: Value, b: Value) {
    invariant(a != null, 'Argument \'a\' was null');
    invariant(b != null, 'Argument \'b\' was null');

    if (a instanceof Buffer && b instanceof Buffer) {
      return a.compare(b);
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return (a ? 1 : 0) - (b ? 1 : 0);
    }

    invariant(false, 'Value could not be converted to an AttributeValue');
  }

  static areEqual(a: Value, b: Value) {
    invariant(a != null, 'Argument \'a\' was null');
    invariant(b != null, 'Argument \'b\' was null');

    if (a instanceof Buffer && b instanceof Buffer) {
      return a.equals(b);
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return a === b;
    }

    if (typeof a === 'number' && typeof b === 'number') {
      return a === b;
    }

    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return a === b;
    }

    invariant(false, 'Value could not be converted to an AttributeValue');
  }
}
