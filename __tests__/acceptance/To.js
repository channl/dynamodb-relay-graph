/* @flow */
import invariant from 'invariant';
import type { NodeModel, EdgeModel } from '../../src/flow/Types';

export type Contact = {
  type: string,
  id: Buffer,
  createDate: number,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  userId?: Buffer,
  privateChannelId?: Buffer,
};

export type User = {
  type: string,
  id: Buffer,
  createDate: number,
  countryCode: string,
  phoneNumber: string,
  firstName?: string,
  lastName?: string,
  password: string,
  isVerified: boolean,
  verificationCode: string,
  privateTagId?: Buffer,
  tagId?: Buffer,
};

export type UserContactEdge = {
  type: string,
  inID: Buffer,
  outID: Buffer,
  createDate: number,
  userOrder: string,
  inPhoneNumber: string,
};

export default class To {

  static Contact(value: NodeModel): Contact {
    invariant(typeof value.type === 'string', 'Error');
    invariant(value.type === 'Contact', 'Error');
    invariant(value.id instanceof Buffer, 'Error');
    let model = ((value: any): Contact);
    return model;
  }

  static User(value: NodeModel): User {
    invariant(typeof value.type === 'string', 'Error');
    invariant(value.type === 'User', 'Error');
    invariant(value.id instanceof Buffer, 'Error');
    let model = ((value: any): User);
    return model;
  }

  static UserContactEdge(value: EdgeModel): UserContactEdge {
    invariant(typeof value.type === 'string', 'Error');
    invariant(value.type === 'UserContactEdge', 'Error');
    invariant(value.inID instanceof Buffer, 'Error');
    invariant(value.outID instanceof Buffer, 'Error');
    let model = ((value: any): UserContactEdge);
    return model;
  }
}
