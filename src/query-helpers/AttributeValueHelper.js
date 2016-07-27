/* @flow */
import { invariant } from '../Global';
import SingleValueHelper from '../query-helpers/SingleValueHelper';
import type { AttributeValue } from 'aws-sdk-promise';

export default class AttributeValueHelper {

  static areEqual(a: AttributeValue, b?: AttributeValue) {
    if (b == null) {
      return false;
    }

    if (typeof a.B !== 'undefined' && typeof b.B !== 'undefined') {
      return SingleValueHelper.areEqual(a.B, b.B);
    }

    if (typeof a.BOOL !== 'undefined' && typeof b.BOOL !== 'undefined') {
      return SingleValueHelper.areEqual(a.BOOL, b.BOOL);
    }

    if (typeof a.BS !== 'undefined' && typeof b.BS !== 'undefined') {
      if (a.BS.length !== b.BS.length) {
        return false;
      }
      // $FlowIgnore
      return a.BS.every((aa, i) => SingleValueHelper.areEqual(aa, b.BS[i]));
    }

    if (typeof a.L !== 'undefined' && typeof b.L !== 'undefined') {
      if (a.L.length !== b.L.length) {
        return false;
      }
      // $FlowIgnore
      return a.L.every((aa, i) => SingleValueHelper.areEqual(aa, b.L[i]));
    }
/*
    if (typeof a.M !== 'undefined' && typeof b.M !== 'undefined') {
      return ValueHelper.areEqual(a.M, b.M);
    }
*/
    if (typeof a.N !== 'undefined' && typeof b.N !== 'undefined') {
      return SingleValueHelper.areEqual(a.N, b.N);
    }

    if (typeof a.NS !== 'undefined' && typeof b.NS !== 'undefined') {
      if (a.NS.length !== b.NS.length) {
        return false;
      }
      // $FlowIgnore
      return a.NS.every((aa, i) => SingleValueHelper.areEqual(aa, b.NS[i]));
    }

    if (typeof a.S !== 'undefined' && typeof b.S !== 'undefined') {
      return SingleValueHelper.areEqual(a.S, b.S);
    }

    if (typeof a.SS !== 'undefined' && typeof b.SS !== 'undefined') {
      if (a.SS.length !== b.SS.length) {
        return false;
      }
      // $FlowIgnore
      return a.SS.every((aa, i) => SingleValueHelper.areEqual(aa, b.SS[i]));
    }

    invariant(false, 'AttributeValue type not supported');
  }
}
