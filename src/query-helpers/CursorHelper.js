/* @flow */
import invariant from 'invariant';
import type { AttributeMap } from 'aws-sdk';

export default class CursorHelper {

  static toAWSKey(cursor: string): AttributeMap {
    invariant(typeof cursor === 'string', 'Argument \'cursor\' is not a string');
    let b = new Buffer(cursor, 'base64');
    let json = b.toString('ascii');
    let item: Object = JSON.parse(json);

    // Create real buffer objects from the JSON
    // B.data versus B seems to be due to differences in Buffer implementation
    Object
      .keys(item)
      .map(name => item[name])
      .filter(a => typeof a.B !== 'undefined')
      .forEach(a => {
        a.B = typeof a.B.data !== 'undefined' ?
          new Buffer(a.B.data) :
          new Buffer(a.B);
      });

    return item;
  }
}
