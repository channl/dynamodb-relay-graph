import logger from '../logging/logger';
import EntityResolver from '../query-resolvers/EntityResolver';
import ToNodesConnectionQuery from '../query/ToNodesConnectionQuery';

export default class ToNodesConnectionResolver extends EntityResolver {
  constructor(
    dynamoDB,
    schema,
    getTableName,
    getModelFromAWSItem,
    getIdFromAWSKey,
    toAWSKey) {
    super(
      dynamoDB,
      schema,
      getTableName,
      getModelFromAWSItem,
      getIdFromAWSKey,
      toAWSKey);
  }

  canResolve(query) {
    return (query instanceof ToNodesConnectionQuery);
  }

  async resolveAsync(query, innerResult, options) {
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
        logger.debug(
          'ToNodesConnectionResolver succeeded',
          JSON.stringify({query, innerResult, result}));
      }
      return result;

    } catch (ex) {
      logger.warn(
        'ToNodesConnectionResolver failed',
        JSON.stringify({query, innerResult}));
      throw ex;
    } finally {
      if (sw) {
        sw.end();
      }
    }
  }

  async getNodeIds(query, innerResult) {
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
