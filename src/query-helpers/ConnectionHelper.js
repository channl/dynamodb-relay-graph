/* @flow */
import type { Connection } from 'graphql-relay';
import type { EdgeModel } from '../flow/Types';

export default class ConnectionHelper {

  static castTo<T>(value: Connection<EdgeModel>, castFunc: (item: EdgeModel) => T): Connection<T> {
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
