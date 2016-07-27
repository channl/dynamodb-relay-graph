/* @flow */
import { invariant } from '../Global';
import AttributeValueHelper from '../query-helpers/AttributeValueHelper';
import type { AttributeMap } from 'aws-sdk-promise';

export default class AttributeMapHelper {

  static areEqual(a: AttributeMap, b: ?AttributeMap) {
    if (b == null) {
      return false;
    }

    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }

    for (let key of Object.keys(a)) {
      if (!AttributeValueHelper.areEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  static isSupersetOf(superset: AttributeMap, base: AttributeMap) {
    invariant(superset != null, 'Argument \'superset\' is null');
    invariant(base != null, 'Argument \'base\' is null');

    for (let key of Object.keys(base)) {
      if (!AttributeValueHelper.areEqual(base[key], superset[key])) {
        return false;
      }
    }

    return true;
  }
}
