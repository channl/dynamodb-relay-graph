/* @flow */
import invariant from 'invariant';
import EntityResolver from '../query-resolvers/EntityResolver';
import QueryHelper from '../query-helpers/QueryHelper';
import EdgeConnectionQuery from '../query/EdgeConnectionQuery';
// import ExpressionHelper from '../query-helpers/ExpressionHelper';
import TypeHelper from '../query-helpers/TypeHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import DataMapper from '../query-helpers/DataMapper';
import DataModelHelper from '../query-helpers/DataModelHelper';
import DynamoDB from '../aws/DynamoDB';
import Instrument from '../utils/Instrument';
import type { Connection, Edge } from 'graphql-relay';
import type { DynamoDBSchema, ScanQueryResponse, QueryRequest } from 'aws-sdk-promise';
// eslint-disable-next-line no-unused-vars
import type { ConnectionArgs, QueryExpression, Model, TypedMaybeDataModel,
  TypedDataModel } from '../flow/Types';

export default class EdgeConnectionResolver {
  _dynamoDB: DynamoDB;
  _schema: DynamoDBSchema;
  _entityResolver: EntityResolver;
  _dataMapper: DataMapper;

  constructor(dynamoDB: DynamoDB, schema: DynamoDBSchema,
    entityResolver: EntityResolver, dataMapper: DataMapper) {
    this._dynamoDB = dynamoDB;
    this._schema = schema;
    this._entityResolver = entityResolver;
    this._dataMapper = dataMapper;
  }

  async resolveAsync(query: EdgeConnectionQuery,
    innerResult: Connection<Model>): Promise<Connection<Model>> {
    return await Instrument.funcAsync(this, async (): Promise<Connection<Model>> => {
      invariant(query, 'Argument \'query\' is null');
      invariant(innerResult, 'Argument \'innerResult\' is null');

      let expression = QueryHelper.getEdgeExpression(innerResult, query);
      if (typeof expression.id === 'string') {
        let item = await this._entityResolver.getAsync(expression.id);
        let dataModels = EdgeConnectionResolver._toTypedDataModels([ item ]);
        let conn: Connection<Model> = DataModelHelper
          .toPartialEdgeConnection(this._dataMapper, dataModels, false, false, null);
        return conn;
      }

      let request = this._getQueryRequest(query.type, expression,
        query.connectionArgs, query.isOut);
      let response = await this._dynamoDB.queryAsync(request);
      let conn: Connection<Model> = this._getResponseAsConnection(query, response);
      return conn;
    });
  }

  _getQueryRequest(type: string, modelExpression: QueryExpression,
    connectionArgs: ConnectionArgs): QueryRequest {
    invariant(typeof type === 'string', 'Type must be string');
    invariant(modelExpression, 'Argument \'modelExpression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    let expression = this._dataMapper.toDataModel(type, modelExpression);

    let request: QueryRequest = {
      TableName: TypeHelper.getTableName(type),
      ExclusiveStartKey: QueryHelper.getExclusiveStartKey(connectionArgs),
      Limit: QueryHelper.getLimit(connectionArgs),
      ScanIndexForward: QueryHelper.getScanIndexForward(connectionArgs),
      ProjectionExpression: QueryHelper.getProjectionExpression(expression, connectionArgs,
        [ 'inID', 'outID', 'createDate' ]),
      KeyConditionExpression: QueryHelper.getKeyConditionExpression(expression),
      ExpressionAttributeValues: QueryHelper.getExpressionAttributeValues(type,
        expression, this._schema, this._dataMapper),
      ExpressionAttributeNames: QueryHelper.getExpressionAttributeNames(expression, connectionArgs,
        [ 'inID', 'outID', 'createDate' ])
    };

    let indexName = QueryHelper.getIndexName(type, expression, connectionArgs, this._schema);
    if (indexName != null) {
      request.IndexName = indexName;
    }

    return request;
  }

  _getResponseAsConnection<T: Model>(query: EdgeConnectionQuery,
    response: ScanQueryResponse): Connection<T> {
    invariant(query, 'Argument \'query\' is null');
    invariant(response, 'Argument \'response\' is null');

    let edges = response.Items.map(item => {
      let dataModel = AttributeMapHelper.toDataModel(query.type, item);
      // $FlowIgnore
      let model: Edge = this._dataMapper.fromDataModel(query.type, dataModel);
      let cursor = DataModelHelper.toCursor({type: query.type, dataModel},
        query.connectionArgs.order);
      let partialEdge: Edge<T> = {
        node: model,
        cursor,
      };
      return partialEdge;
    });

    if (QueryHelper.isForwardScan(query.connectionArgs)) {
      let pageInfo = {
        startCursor: edges[0] ? edges[0].cursor : null,
        endCursor: edges[edges.length - 1] ? edges[edges.length - 1].cursor : null,
        hasNextPage: typeof response.LastEvaluatedKey !== 'undefined',
        hasPreviousPage: false
      };
      return { edges, pageInfo };
    }

    let pageInfo = {
      startCursor: edges[0] ? edges[0].cursor : null,
      endCursor: edges[edges.length - 1] ? edges[edges.length - 1].cursor : null,
      hasNextPage: false,
      hasPreviousPage: typeof response.LastEvaluatedKey !== 'undefined'
    };

    return {
      edges: edges.reverse(),
      pageInfo
    };
  }

  static _toTypedDataModels(typedMaybeDataModels: TypedMaybeDataModel[]): TypedDataModel[] {
    let items:TypedDataModel[] = typedMaybeDataModels
      .filter(item => item.dataModel != null)
      .map(item => {
        invariant(item.dataModel != null, 'Item was invalid');
        let result = (item:TypedDataModel);
        return result;
      });

    return items;
  }
}
