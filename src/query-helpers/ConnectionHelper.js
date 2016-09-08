/* @flow */
import type { Connection } from 'graphql-relay';
import type { Model } from '../flow/Types';

export default class ConnectionHelper {

  static castTo<T>(value: Connection<Model>, castFunc: (item: Model) => T): Connection<T> {
    let connection = {
      edges: value.edges.map(edge => {
        return {
          node: castFunc(edge.node),
          cursor: edge.cursor,
        };
      }),
      pageInfo: value.pageInfo,
    };

    return connection;
  }

}
