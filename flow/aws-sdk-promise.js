/* @flow */
declare module 'aws-sdk-promise' {
  declare class DynamoDB {
    constructor(dynamoDBConfig: DynamoDBConfig): void;

    listTables(params: ?ListTablesRequest, callback: ?(err: ?Error,
      data: ListTablesResponse) => void): PromiseRequest<ListTablesResponse>;

    deleteTable(params: ?DeleteTableRequest,callback: ?(err: ?Error,
      data: DeleteTableResponse) => void): PromiseRequest<DeleteTableResponse>;

    createTable(params: ?CreateTableRequest, callback: ?(err: ?Error,
      data: CreateTableResponse) => void): PromiseRequest<CreateTableResponse>;

    describeTable(params: ?DescribeTableRequest, callback: ?(err: ?Error,
      data: DescribeTableResponse) => void): PromiseRequest<DescribeTableResponse>;

    updateTable(params: ?UpdateTableRequest, callback: ?(err: ?Error,
      data: UpdateTableResponse) => void): PromiseRequest<UpdateTableResponse>;

    scan(params: ?ScanRequest, callback: ?(err: ?Error,
      data: ScanQueryResponse) => void): PromiseRequest<ScanQueryResponse>;

    query(params: ?QueryRequest, callback: ?(err: ?Error,
      data: ScanQueryResponse) => void): PromiseRequest<ScanQueryResponse>;

    putItem(params: ?PutItemRequest, callback: ?(err: ?Error,
      data: PutItemResponse) => void): PromiseRequest<PutItemResponse>;

    getItem(params: ?GetItemRequest, callback: ?(err: ?Error,
      data: GetItemResponse) => void): PromiseRequest<GetItemResponse>;

    batchGetItem(params: ?BatchGetItemRequest, callback: ?(err: ?Error,
      data: BatchGetItemResponse) => void): PromiseRequest<BatchGetItemResponse>;

    batchWriteItem(params: ?BatchWriteItemRequest, callback: ?(err: ?Error,
      data: BatchWriteItemResponse) => void): PromiseRequest<BatchWriteItemResponse>;

    deleteItem(params: ?DeleteItemRequest, callback: ?(err: ?Error,
      data: DeleteItemResponse) => void): PromiseRequest<DeleteItemResponse>;

    updateItem(params: ?UpdateItemRequest, callback: ?(err: ?Error,
      data: UpdateItemResponse) => void): PromiseRequest<UpdateItemResponse>;
  }

  declare class CloudWatch {
    getMetricStatistics(params: ?GetMetricStatisticsRequest, callback: ?(err: ?Error,
      data: GetMetricStatisticsResponse) => void): PromiseRequest<GetMetricStatisticsResponse>;
  }

  declare class PromiseRequest<T> {
    promise(): Promise<DataResponse<T>>;
  }

  declare type DataResponse<T> = {
    data: T,
  };

  declare type ListTablesRequest = {
     ExclusiveStartTableName?: string,
     Limit?: number
  };

  declare type ListTablesResponse = {
     LastEvaluatedTableName?: string,
     TableNames: string[]
  };

  declare type DeleteTableRequest = {
     TableName: string,
  };

  declare type DeleteTableResponse = {
    TableDescription: TableDescription,
  };

  declare type CreateTableRequest = {
    AttributeDefinitions: AttributeDefinition[],
    KeySchema: KeyDefinition[],
    ProvisionedThroughput: ProvisionedThroughput,
    TableName: string,
    GlobalSecondaryIndexes: GlobalSecondaryIndex[],
    LocalSecondaryIndexes: LocalSecondaryIndex[],
    StreamSpecification: StreamSpecification,
  };

  declare type CreateTableResponse = {
    TableDescription: TableDescription,
  };

  declare type Map<TKey, TValue> = {
    [key: TKey]: TValue,
  };

  declare type ScanRequest = {
    AttributesToGet?: string[],
    ConditionalOperator?: string,
    ConsistentRead?: boolean,
    ExclusiveStartKey?: AttributeMap,
    ExpressionAttributeNames?: Map<string, string>,
    ExpressionAttributeValues?: AttributeMap,
    FilterExpression?: string,
    IndexName?: string,
    Limit?: number,
    ProjectionExpression?: string,
    ReturnConsumedCapacity?: string,
    ScanFilter?: any,
    Segment?: number,
    Select?: string,
    TableName: string,
    TotalSegments?: number
  };

  declare type ConsumedCapacityValue = {
     CapacityUnits: number,
  };

  declare type ConsumedCapacity = {
    CapacityUnits: number,
    GlobalSecondaryIndexes: ConsumedCapacityMap,
    LocalSecondaryIndexes: ConsumedCapacityMap,
    Table: ConsumedCapacityValue,
    TableName: string
  };

  declare type ConsumedCapacityMap = {
    [name: string]: ConsumedCapacityValue,
  };

  declare type ScanQueryResponse = {
    ConsumedCapacity: ConsumedCapacity,
    Count: number,
    Items: AttributeMap[],
    LastEvaluatedKey: AttributeMap,
    ScannedCount: number,
  };

  declare type QueryRequest = {
    AttributesToGet?: string[],
    ConditionalOperator?: string,
    ConsistentRead?: boolean,
    ExclusiveStartKey?: AttributeMap,
    ExpressionAttributeNames?: Map<string, string>,
    ExpressionAttributeValues?: AttributeMap,
    FilterExpression?: string,
    IndexName?: string,
    KeyConditionExpression?: string,
    KeyConditions?: any,
    Limit?: number,
    ProjectionExpression?: string,
    QueryFilter?: any,
    ReturnConsumedCapacity?: string,
    ScanIndexForward?: boolean,
    Select?: string,
    TableName: string,
  };

  declare type PutItemRequest = {
    ConditionalOperator?: string,
    ConditionExpression?: string,
    Expected?: any,
    ExpressionAttributeNames?: Map<string, string>,
    ExpressionAttributeValues?: AttributeMap,
    Item: AttributeMap,
    ReturnConsumedCapacity?: string,
    ReturnItemCollectionMetrics?: string,
    ReturnValues?: string,
    TableName: string,
  };

  declare type PutItemResponse = {
    Attributes: AttributeMap,
    ConsumedCapacity: ConsumedCapacity,
    ItemCollectionMetrics: ItemCollectionMetrics,
  };

  declare type ItemCollectionMetrics = {
    ItemCollectionKey: AttributeMap,
    SizeEstimateRangeGB: number[],
  }

  declare type GetItemRequest = {
    AttributesToGet: string[],
    ConsistentRead: boolean,
    ExpressionAttributeNames: Map<string, string>,
    Key: AttributeMap,
    ProjectionExpression: string,
    ReturnConsumedCapacity: string,
    TableName: string,
  };

  declare type GetItemResponse = {
    ConsumedCapacity: ConsumedCapacity,
    Item: AttributeMap,
  };

  declare type BatchGetItemRequest = {
    RequestItems: BatchGetRequestItems,
    ReturnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE',
  };

  declare type AttributeMap = {
    [keyName: string]: AttributeValue;
  };

  declare type AttributeValue = {
    B?: Buffer | string,
    BOOL?: boolean,
    BS?: Buffer[] | string[],
    L?: Object[],
    M?: Object[],
    N?: string,
    NS?: string[],
    NULL?: boolean,
    S?: string,
    SS?: string[],
  };

  declare type BatchGetItemResponse = {
    ConsumedCapacity: ConsumedCapacity[],
    Responses: ResponseItems,
    UnprocessedKeys: BatchGetRequestItems,
  };

  declare type ResponseItems = {
    [tableName: string]: AttributeMap[],
  };

  declare type BatchGetRequestItems = {
    [keyName: string]: BatchGetRequestItem;
  };

  declare type BatchGetRequestItem = {
    AttributesToGet?: string[],
    ConsistentRead?: boolean,
    ExpressionAttributeNames?: ExpressionAttributeNames,
    Keys: AttributeMap[],
    ProjectionExpression?: string,
  };

  declare type ExpressionAttributeNames = {
    [name: string]: string,
  };

  declare type BatchWriteItemRequest = {
    RequestItems: BatchWriteRequestItems,
    ReturnConsumedCapacity?: string,
    ReturnItemCollectionMetrics?: string,
  };

  declare type BatchWriteRequestItems = {
    [tableName: string]: BatchWriteRequestItem[],
  };

  declare type BatchWriteRequestItem = {
    DeleteRequest?: BatchDeleteRequest,
    PutRequest?: BatchPutRequest,
  };

  declare type BatchDeleteRequest = {
    Key: AttributeMap,
  }

  declare type BatchPutRequest = {
    Item: AttributeMap,
  }

  declare type BatchWriteItemResponse = {
    ConsumedCapacity: ConsumedCapacity[],
    ItemCollectionMetrics: ItemCollectionMetrics,
    UnprocessedItems: BatchWriteRequestItems,
  };

  declare type DeleteItemRequest = {
    ConditionalOperator?: string,
    ConditionExpression?: string,
    Expected?: any,
    ExpressionAttributeNames?: Map<string, string>,
    ExpressionAttributeValues?: AttributeMap,
    Key: AttributeMap,
    ReturnConsumedCapacity?: string,
    ReturnItemCollectionMetrics?: string,
    ReturnValues?: string,
    TableName?: string,
  };

  declare type DeleteItemResponse = {
    Attributes: AttributeMap,
    ConsumedCapacity: ConsumedCapacity,
    ItemCollectionMetrics: ItemCollectionMetrics,
  };

  declare type UpdateItemRequest = {
    AttributeUpdates?: any,
    ConditionalOperator?: string,
    ConditionExpression?: string,
    Expected?: any,
    ExpressionAttributeNames?: Map<string, string>,
    ExpressionAttributeValues?: AttributeMap,
    ReturnConsumedCapacity?: string,
    ReturnItemCollectionMetrics?: string,
    ReturnValues?: string,
    TableName: string,
    UpdateExpression?: string
  };

  declare type UpdateItemResponse = {
    Attributes: AttributeMap,
    ConsumedCapacity: ConsumedCapacity,
    ItemCollectionMetrics: ItemCollectionMetrics,
  };

  declare type DynamoDBAttributeDefinition = {
    AttributeName: string,
    AttributeType: string,
  };

  declare type DynamoDBKeySchema = DynamoDBKeySchemaItem[];

  declare type DynamoDBKeySchemaItem = {
    AttributeName: string,
    KeyType: string,
  };

  declare type DynamoDBTable = {
    TableName: string,
    AttributeDefinitions: DynamoDBAttributeDefinition[],
    KeySchema: DynamoDBKeySchema,
    GlobalSecondaryIndexes?: DynamoDBGlobalSecondaryIndex[],
    LocalSecondaryIndexes?: DynamoDBLocalSecondaryIndex[],
    ProvisionedThroughput: DynamoDBProvisionedThroughput,
    StreamSpecification?: DynamoDBStreamSpecification
  };

  declare type DynamoDBGlobalSecondaryIndex = {
    IndexName: string,
    KeySchema: DynamoDBKeySchema,
    Projection: DynamoDBProjection,
    ProvisionedThroughput: DynamoDBProvisionedThroughput
  };

  declare type DynamoDBLocalSecondaryIndex = {
    IndexName: string,
    KeySchema: DynamoDBKeySchema,
    Projection: DynamoDBProjection,
  };

  declare type DynamoDBProjection = {
     NonKeyAttributes?: string[],
     ProjectionType: string
  };

  declare type DynamoDBProvisionedThroughput = {
    ReadCapacityUnits: number,
    WriteCapacityUnits: number
  };

  declare type DynamoDBStreamSpecification = {
    StreamEnabled: boolean,
    StreamViewType: string
  };

  declare type DynamoDBSchema = {
    tables: DynamoDBTable[]
  };

  declare type DynamoDBConfig = {
    apiVersion: string,
    region: string,
    dynamoDbCrc32: boolean,
    httpOptions: HTTPOptions,
  };

  // DynamoDB
  declare type HTTPOptions = {
    timeout: number,
  };

  declare type AttributeDefinition = {
    AttributeName: string,
    AttributeType: string,
  };

  declare type KeyDefinition = {
    AttributeName: string,
    KeyType: string,
  };

  declare type Projection = {
    NonKeyAttributes: string[],
    ProjectionType: string,
  };

  declare type ProvisionedThroughput = {
     LastDecreaseDateTime: string,
     LastIncreaseDateTime: string,
     NumberOfDecreasesToday: number,
     ReadCapacityUnits: number,
     WriteCapacityUnits: number,
  };

  declare type Throughput = {
    ReadCapacityUnits: number,
    WriteCapacityUnits: number,
  };

  declare type GlobalSecondaryIndex = {
    Backfilling: boolean,
    IndexArn: string,
    IndexName: string,
    IndexSizeBytes: number,
    IndexStatus: string,
    ItemCount: number,
    KeySchema: KeyDefinition[],
    Projection: Projection,
    ProvisionedThroughput: ProvisionedThroughput,
  };

  declare type LocalSecondaryIndex = {
     IndexArn: string,
     IndexName: string,
     IndexSizeBytes: number,
     ItemCount: number,
     KeySchema: KeyDefinition[],
     Projection: Projection,
  };

  declare type StreamSpecification = {
     StreamEnabled: boolean,
     StreamViewType: string,
  };

  declare type TableDescription = {
    AttributeDefinitions: AttributeDefinition[],
    CreationDateTime: number,
    GlobalSecondaryIndexes: GlobalSecondaryIndex[],
    ItemCount: number,
    KeySchema: KeyDefinition[],
    LatestStreamArn: string,
    LatestStreamLabel: string,
    LocalSecondaryIndexes: LocalSecondaryIndex[],
    ProvisionedThroughput: ProvisionedThroughput,
    StreamSpecification: StreamSpecification,
    TableArn: string,
    TableName: string,
    TableSizeBytes: number,
    TableStatus: string
  };

  declare type DescribeTableRequest = {
     TableName: string,
  };

  declare type DescribeTableResponse = {
    Table: TableDescription,
  };

  declare type GlobalSecondaryIndexUpdateCreate = {
    IndexName: string,
    KeySchema: KeyDefinition[],
    Projection: Projection,
    ProvisionedThroughput: Throughput,
  };

  declare type GlobalSecondaryIndexUpdateDelete = {
    IndexName: string,
  };

  declare type GlobalSecondaryIndexUpdateUpdate = {
    IndexName: string,
    ProvisionedThroughput: Throughput,
  };

  declare type GlobalSecondaryIndexUpdate = {
     Create?: GlobalSecondaryIndexUpdateCreate,
     Delete?: GlobalSecondaryIndexUpdateDelete,
     Update?: GlobalSecondaryIndexUpdateUpdate,
  };

  declare type UpdateTableRequest = {
     AttributeDefinitions?: AttributeDefinition[],
     GlobalSecondaryIndexUpdates? : GlobalSecondaryIndexUpdate[],
     ProvisionedThroughput?: Throughput,
     StreamSpecification?: StreamSpecification,
     TableName: string
  };

  declare type UpdateTableResponse = {
    TableDescription: TableDescription,
  };

  // CloudWatch
  declare type CloudWatchOptions = {
    apiVersion: string,
    region: string,
    httpOptions: HTTPOptions,
  };

  declare type GetMetricStatisticsResponse = {
    ResponseMetadata: ResponseMetadata,
    Label: string,
    Datapoints: Datapoint[],
  };

  declare type Dimension = {
    Name: string,
    Value: string,
  };

  declare type GetMetricStatisticsRequest = {
    Namespace: string,
    MetricName: string,
    Dimensions: Dimension[],
    StartTime: Date,
    EndTime: Date,
    Period: number,
    Statistics: string[],
    Unit: string,
  };

  declare type ResponseMetadata = {
    RequestId: string,
  };

  declare type Datapoint = {
    Timestamp: string,
    Average: number,
    Sum: number,
    Unit: string,
  };
}
