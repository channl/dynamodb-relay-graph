/* @flow */
export type ID = string;

export type Contact = {
  id: ID,
  firstName: ?string,
  lastName: ?string,
  phoneNumber: string,
  userId: ?ID,
  user: ?User,
  privateChannelId: ?ID,
  // privateChannel: ?Channel,
};

export type User = {
  id: ID,
  countryCode: string,
  phoneNumber: string,
  firstName: string,
  lastName: string,
  password: string,
  isVerified: boolean,
  verificationCode: string,
  imageUrl: ?string,
  privateTagId: ID,
  // privateTag: Tag,
  tagId: ID,
  // tag: Tag,
  // eslint-disable-next-line max-len
  // contacts(order: string, orderDesc: Boolean, query: string, before: string, after: string, first: Int, last: Int): UserContactConnection,
  // eslint-disable-next-line max-len
  // channels(order: string, orderDesc: Boolean, query: string, before: string, after: string, first: Int, last: Int): ChannelConnection,
};

export type UserContactEdge = {
  node: ?Contact,
  cursor: string,
  id: ID,
  inID: ID,
  outID: ID,
  createDate: number,
  userOrder: string,
  inPhoneNumber: string,
};
