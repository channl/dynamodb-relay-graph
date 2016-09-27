/* @flow */
import invariant from 'invariant';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
import SingleQuery from '../query/SingleQuery';
import SingleOrNullQuery from '../query/SingleOrNullQuery';
import ConnectionHelper from '../query-helpers/ConnectionHelper';
import type Graph from '../Graph';
import type { Connection } from 'graphql-relay';
import type { QueryExpression, ConnectionArgs, Model } from '../flow/Types';

export default class ToNodesConnectionQuery {
  graph: Graph;
  inner: EdgeConnectionQuery;
  type: string;
  isOut: boolean;
  expression: QueryExpression;

  // eslint-disable-next-line max-len
  constructor(graph: Graph, inner: EdgeConnectionQuery, type: string, isOut: boolean, expression: QueryExpression) {
    invariant(typeof graph !== 'undefined', 'Argument \'graph\' is undefined');
    invariant(typeof isOut === 'boolean', 'Argument \'isOut\' must be boolean');
    invariant(expression, 'Argument \'expression\' is null');
    this.graph = graph;
    this.inner = inner;
    this.type = type;
    this.isOut = isOut;
    this.expression = expression;
  }

  single(): SingleQuery {
    return new SingleQuery(this.graph, this);
  }

  singleOrNull(): SingleOrNullQuery {
    return new SingleOrNullQuery(this.graph, this);
  }

  // eslint-disable-next-line max-len
  out(type: string, expression: QueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    return new EdgeConnectionQuery(this.graph, this, type, expression, connectionArgs, true);
  }

  // eslint-disable-next-line max-len
  in(type: string, expression: QueryExpression, connectionArgs: ConnectionArgs): EdgeConnectionQuery {
    invariant(expression, 'Argument \'expression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');
    return new EdgeConnectionQuery(this.graph, this, type, expression, connectionArgs, false);
  }

  async getAsync<T>(castFunc: (item: Model) => T = i => ((i: any): T)): Promise<Connection<T>> {
    let innerResult = await this.getInnerResultAsync();
    let connection = await this.graph._toNodesConnectionResolver.resolveAsync(this, innerResult);
    return ConnectionHelper.castTo(connection, castFunc);
  }

  async getInnerResultAsync(): Promise<Connection<Model>> {
    if (this.inner == null) {
      let result: Connection<Model> = {
        edges: [],
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          hasNextPage: false,
        }
      };
      return result;
    }

    return await this.inner.getAsync();
  }
}
