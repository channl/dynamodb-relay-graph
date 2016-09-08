/* @flow */
import invariant from 'invariant';
import { toGlobalId } from 'graphql-relay';

export default class GID {

  static forSetting(id: string): string {
    return id;
  }

  static forContact(id: Buffer): string {
    invariant(id instanceof Buffer, 'Error');
    return toGlobalId('Contact', id.toString('base64'));
  }

  static forUser(id: Buffer): string {
    invariant(id instanceof Buffer, 'Error');
    return toGlobalId('User', id.toString('base64'));
  }

  static forUserContactEdge(outID: Buffer, inID: Buffer): string {
    invariant(outID instanceof Buffer, 'Error');
    invariant(inID instanceof Buffer, 'Error');
    return toGlobalId('UserContactEdge', outID.toString('base64') + inID.toString('base64'));
  }
}
