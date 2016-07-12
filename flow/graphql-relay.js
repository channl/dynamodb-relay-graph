/* @flow */
declare module 'graphql-relay' {

  declare type Edge = {
    cursor: string,
    node: Node
  };

  declare type PageInfo = {
    startCursor: string,
    endCursor: string,
    hasPreviousPage: boolean,
    hasNextPage: boolean
  };

  declare type Connection = {
    edges: Edge[],
    pageInfo: PageInfo
  };

  declare type ResolvedGlobalId = {
    type: string,
    id: string,
  };

  declare class FromGlobalId {
    (globalId: string): ResolvedGlobalId;
  }

  declare class ToGlobalId {
    (type: string, id: string): string;
  }

  declare var fromGlobalId: FromGlobalId;

  declare var toGlobalId: ToGlobalId;
}
