/* @flow */
import invariant from 'invariant';
import type { SingleValue } from 'aws-sdk-promise';

export default class SingleValueHelper {

  static areEqual(a: SingleValue, b: SingleValue) {
    invariant(a != null, 'Argument \'a\' was null');
    invariant(b != null, 'Argument \'b\' was null');

    if (a instanceof Buffer && b instanceof Buffer) {
      return a.equals(b);
    }

    return a === b;
  }
}
