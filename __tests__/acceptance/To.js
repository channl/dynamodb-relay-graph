/* @flow */
import invariant from 'invariant';
import { fromGlobalId } from 'graphql-relay';
import type { Model } from '../../src/flow/Types';
import type { Contact, User, UserContactEdge } from './GraphQLTypes';

export default class To {

  static Contact(value: Model): Contact {
    invariant(value != null, 'Error');
    let { type } = fromGlobalId(value.id);
    invariant(type === 'Contact', 'Error');
    let model = ((value: any): Contact);
    return model;
  }

  static User(value: Model): User {
    invariant(value != null, 'Error');
    let { type } = fromGlobalId(value.id);
    invariant(type === 'User', 'Error');
    let model = ((value: any): User);
    return model;
  }

  static UserContactEdge(value: Model): UserContactEdge {
    invariant(value != null, 'Error');
    let { type } = fromGlobalId(value.id);
    invariant(type === 'UserContactEdge', 'Error');
    let model = ((value: any): UserContactEdge);
    return model;
  }
}
