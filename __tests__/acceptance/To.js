/* @flow */
import invariant from 'invariant';
import { fromGlobalId } from 'graphql-relay';
import type { Model } from '../../src/flow/Types';
import type { Contact, User, UserContactEdge, Tag } from './GraphQLTypes';

export default class To {

  static Contact(value: Model): Contact {
    invariant(value != null, 'Argument \'value\' is null or undefined');
    let { type } = fromGlobalId(value.id);
    invariant(type === 'Contact', 'Type was \'' + type + '\' but should be \'Contact\'');
    let model = ((value: any): Contact);
    return model;
  }

  static User(value: Model): User {
    invariant(value != null, 'Argument \'value\' is null or undefined');
    let { type } = fromGlobalId(value.id);
    invariant(type === 'User', 'Error');
    let model = ((value: any): User);
    return model;
  }

  static UserContactEdge(value: Model): UserContactEdge {
    invariant(value != null, 'Argument \'value\' is null or undefined');
    let { type } = fromGlobalId(value.id);
    invariant(type === 'UserContactEdge', 'Error');
    let model = ((value: any): UserContactEdge);
    return model;
  }

  static Tag(value: Model): Tag {
    invariant(value != null, 'Argument \'value\' is null or undefined');
    let { type } = fromGlobalId(value.id);
    invariant(type === 'Tag', 'Error');
    let model = ((value: any): Tag);
    return model;
  }
}
