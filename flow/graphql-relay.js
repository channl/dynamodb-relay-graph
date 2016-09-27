/* @flow */
import type {
  GraphQLFieldConfig, InputObjectConfigFieldMap,    // eslint-disable-line no-unused-vars
  GraphQLFieldConfigMap, GraphQLResolveInfo,        // eslint-disable-line no-unused-vars
  GraphQLObjectType, GraphQLFieldConfigArgumentMap, // eslint-disable-line no-unused-vars
  GraphQLString, GraphQLInt,                        // eslint-disable-line no-unused-vars
  GraphQLNodeDefinitions,                           // eslint-disable-line no-unused-vars
} from 'graphql';

declare module 'graphql-relay' {

  declare type ConnectionCursor = string

  declare type PageInfo = {
    startCursor: ?ConnectionCursor,
    endCursor: ?ConnectionCursor,
    hasPreviousPage: boolean,
    hasNextPage: boolean,
  }

  declare type Connection<T> = {
    edges: Array<Edge<T>>;
    pageInfo: PageInfo;
  }

  declare type Edge<T> = {
    node: T;
    cursor: ConnectionCursor;
  }

  declare type ConnectionArguments = {
    before?: ?ConnectionCursor;
    after?: ?ConnectionCursor;
    first?: ?number;
    last?: ?number;
  }

  declare type ResolvedGlobalId = {
    type: string,
    id: string,
  };

  declare type mutationFn =
    (object: Object, ctx: Object, info: GraphQLResolveInfo) => Object |
    (object: Object, ctx: Object, info: GraphQLResolveInfo) => Promise<Object>;

  declare type MutationConfig = {
    name: string,
    inputFields: InputObjectConfigFieldMap,
    outputFields: GraphQLFieldConfigMap,
    mutateAndGetPayload: mutationFn,
  };

  declare class FromGlobalId {
    (globalId: string): ResolvedGlobalId;
  }

  declare class ToGlobalId {
    (type: string, id: string): string;
  }

  declare class MutationWithClientMutationId {
    (config: MutationConfig): GraphQLFieldConfig;
  }

  declare class GlobalIdField {
    (typeName?: ?string,
      idFetcher?: (object: any, context: any, info: GraphQLResolveInfo) => string)
      : GraphQLFieldConfig
  }

  declare type ConnectionConfig = {
    name?: ?string,
    nodeType: GraphQLObjectType,
    resolveNode?: ?Function,
    resolveCursor?: ?Function,
    edgeFields?: ?(() => GraphQLFieldConfigMap) | ?GraphQLFieldConfigMap,
    connectionFields?: ?(() => GraphQLFieldConfigMap) | ?GraphQLFieldConfigMap,
  };

  declare type GraphQLConnectionDefinitions = {
    edgeType: GraphQLObjectType,
    connectionType: GraphQLObjectType,
  };

  declare class ConnectionDefinitions {
    (config: ConnectionConfig): GraphQLConnectionDefinitions;
  }

  declare var fromGlobalId: FromGlobalId;

  declare var toGlobalId: ToGlobalId;

  declare var mutationWithClientMutationId: MutationWithClientMutationId;

  declare var globalIdField: GlobalIdField;

  declare var connectionDefinitions: ConnectionDefinitions;

  declare type ForwardConnectionArgs = {
    after: {
      type: GraphQLString
    },
    first: {
      type: GraphQLInt
    },
  };

  /**
   * Returns a GraphQLFieldConfigArgumentMap appropriate to include on a field
   * whose return type is a connection type with backward pagination.
   */
  declare type BackwardConnectionArgs = {
    before: {
      type: GraphQLString
    },
    last: {
      type: GraphQLInt
    },
  };

  declare type ConnectionArgs = ForwardConnectionArgs | BackwardConnectionArgs;

  declare var forwardConnectionArgs: ForwardConnectionArgs;

  declare var backwardConnectionArgs: BackwardConnectionArgs;

  declare var connectionArgs: ConnectionArgs;

  declare type typeResolverFn = (object: any) => ?GraphQLObjectType |
                        (object: any) => ?Promise<GraphQLObjectType>;

  declare function nodeDefinitions(
    idFetcher: ((id: string, context: any, info: GraphQLResolveInfo) => any),
    typeResolver?: ?typeResolverFn
  ): GraphQLNodeDefinitions;

}
