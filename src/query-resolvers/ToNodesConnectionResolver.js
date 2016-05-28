/* @flow */
import warning from 'warning';
import EntityResolver from '../query-resolvers/EntityResolver';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';
import DynamoDB from '../store/DynamoDB';
import { log } from '../Global';

export default class ToNodesConnectionResolver extends EntityResolver {
  constructor(dynamoDB: DynamoDB, schema: any) {
    super(dynamoDB, schema);
  }

  canResolve(query: any): boolean {
    return (query instanceof ToNodesConnectionQuery);
  }

  async resolveAsync(query: any, innerResult: any, options: any) {
    let sw = null;
    if (options && options.stats) {
      sw = options
      .stats
      .timer('ToNodesConnectionResolver.resolveAsync')
      .start();
    }

    try {
      let nodeIds = await this.getNodeIds(query, innerResult);
      let nodes = await Promise.all(nodeIds.map(id => this.getAsync(id)));
      let edges = nodes.map((node, i) => {
        return { cursor: innerResult.edges[i].cursor, node};
      });

      let startCursor = edges[0] ? edges[0].cursor : null;
      let endCursor = edges[edges.length - 1] ?
        edges[edges.length - 1].cursor :
        null;

      let result = {
        edges,
        pageInfo: {
          startCursor,
          endCursor,
          hasPreviousPage: innerResult.pageInfo.hasPreviousPage,
          hasNextPage: innerResult.pageInfo.hasNextPage
        }
      };

      if (options && options.logs) {
        log(JSON.stringify({
          class: 'ToNodesConnectionResolver', query, innerResult, result}));
      }

      return result;

    } catch (ex) {
      warning(false, JSON.stringify({
        class: 'ToNodesConnectionResolver',
        function: 'resolveAsync',
        query, innerResult
      }));

      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }

  async getNodeIds(query: any, innerResult: any) {
    return innerResult
      .edges
      .map(edge => {
        return {
          type: query.expression.type,
          id: query.isOut ? edge.outID : edge.inID
        };
      });
  }
}