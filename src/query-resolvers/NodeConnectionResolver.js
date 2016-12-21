/* @flow */
/* eslint-disable max-len */
import invariant from 'invariant';
import EntityResolver from '../query-resolvers/EntityResolver';
import QueryHelper from '../query-helpers/QueryHelper';
import NodeConnectionQuery from '../query/NodeConnectionQuery';
import TypeHelper from '../query-helpers/TypeHelper';
import AttributeMapHelper from '../query-helpers/AttributeMapHelper';
import DataModelHelper from '../query-helpers/DataModelHelper';
import DataMapper from '../query-helpers/DataMapper';
import DynamoDB from '../aws/DynamoDB';
import Instrument from '../logging/Instrument';
// eslint-disable-next-line no-unused-vars
import type { ConnectionArgs, QueryExpression, TypedDataModel, TypedMaybeDataModel, Model } from '../flow/Types';
import type { Connection } from 'graphql-relay';
import type { DynamoDBSchema, ScanQueryResponse, QueryRequest } from 'aws-sdk';

export default class NodeConnectionResolver {
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

  async resolveAsync(query: NodeConnectionQuery): Promise<Connection<Model>> {
    // eslint-disable-next-line max-len, no-caller
    return await Instrument.funcAsync(this, arguments, async () => {
      invariant(query != null, 'Argument \'query\' is null');

      // Generate the full expression using the query and any previous result
      let expression = QueryHelper.getExpression(query);

      // Specific GlobalId query
      if (typeof expression.id === 'string') {
        let item = await this._entityResolver.getAsync(expression.id);
        let dataModels = NodeConnectionResolver._toTypedDataModels([ item ]);
        return DataModelHelper.toConnection(this._dataMapper, dataModels, false, false, null);
      }

      // Type only query
      if (expression == null || Object.keys(expression).length === 0) {
        let request = this._getScanRequest(query.type, expression, query.connectionArgs);
        let response = await this._dynamoDB.scanAsync(request);
        invariant(typeof query.type === 'string', 'Type must be string');
        return await this._getResponseAsConnectionAsync(query, response);
      }

      // Complex query
      let request = this._getQueryRequest(query.type, expression, query.connectionArgs);
      let response = await this._dynamoDB.queryAsync(request);
      invariant(typeof query.type === 'string', 'Type must be string');
      return await this._getResponseAsConnectionAsync(query, response);
    });
  }

  _getScanRequest(type: string, modelExpression: QueryExpression, connectionArgs: ConnectionArgs) {
    invariant(typeof type === 'string', 'Type must be string');
    invariant(modelExpression, 'Argument \'modelExpression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    let expression = this._dataMapper.toDataModel(type, modelExpression);
    return {
      TableName: TypeHelper.getTableName(type),
      ExclusiveStartKey: QueryHelper.getExclusiveStartKey(connectionArgs),
      Limit: QueryHelper.getLimit(connectionArgs),
      ProjectionExpression: QueryHelper.getProjectionExpression(expression, connectionArgs, [ 'id' ]),
      ExpressionAttributeNames: QueryHelper.getExpressionAttributeNames(expression, connectionArgs, [ 'id' ])
    };
  }

  _getQueryRequest(type: string, modelExpression: QueryExpression, connectionArgs: ConnectionArgs) {
    invariant(typeof type === 'string', 'Type must be string');
    invariant(modelExpression, 'Argument \'modelExpression\' is null');
    invariant(connectionArgs, 'Argument \'connectionArgs\' is null');

    let expression = this._dataMapper.toDataModel(type, modelExpression);

    let request: QueryRequest = {
      TableName: TypeHelper.getTableName(type),
      ExclusiveStartKey: QueryHelper.getExclusiveStartKey(connectionArgs),
      Limit: QueryHelper.getLimit(connectionArgs),
      ScanIndexForward: QueryHelper.getScanIndexForward(connectionArgs),
      ProjectionExpression: QueryHelper.getProjectionExpression(expression, connectionArgs, [ 'id' ]),
      KeyConditionExpression: QueryHelper.getKeyConditionExpression(expression),
      ExpressionAttributeValues: QueryHelper.getExpressionAttributeValues(type, expression, this._schema, this._dataMapper),
      ExpressionAttributeNames: QueryHelper.getExpressionAttributeNames(expression, connectionArgs, [ 'id' ])
    };

    let indexName = QueryHelper.getIndexName(type, expression, connectionArgs, this._schema);
    if (indexName != null) {
      request.IndexName = indexName;
    }

    return request;
  }

  // eslint-disable-next-line no-unused-vars
  async _getResponseAsConnectionAsync(query: NodeConnectionQuery,
    response: ScanQueryResponse): Promise<Connection<Model>> {
    let nodeIds = response.Items.map(item => {
      invariant(typeof query.type === 'string', 'Type must be string');
      let dataModel = AttributeMapHelper.toDataModel(query.type, item);
      let model = this._dataMapper.fromDataModel(query.type, dataModel);
      return model.id;
    });
    let items = await Promise.all(nodeIds.map(id => this._entityResolver.getAsync(id)));
    let dataModels = NodeConnectionResolver._toTypedDataModels(items);
    let hasPreviousPage = QueryHelper.isForwardScan(query.connectionArgs) ? false : typeof response.LastEvaluatedKey !== 'undefined';
    let hasNextPage = QueryHelper.isForwardScan(query.connectionArgs) ? typeof response.LastEvaluatedKey !== 'undefined' : false;
    return DataModelHelper.toConnection(this._dataMapper, dataModels, hasPreviousPage, hasNextPage, query.connectionArgs.order);
  }

  static _toTypedDataModels(typedMaybeDataModels: TypedMaybeDataModel[]): TypedDataModel[] {
    let result: any = typedMaybeDataModels.filter(item => item.dataModel != null);
    return result;
  }
}
