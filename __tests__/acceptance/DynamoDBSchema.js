const ProvisionedThroughput = { ReadCapacityUnits: 1, WriteCapacityUnits: 1 };

export default {
  tables: [
    // TABLES THAT POTENTIALLY COULD BE SHARED
    {
      TableName: 'Blogs',
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      ProvisionedThroughput,
    },
    {
      TableName: 'Settings',
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      ProvisionedThroughput,
    },
    {
      TableName: 'PostedItems',
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      ProvisionedThroughput,
    },
    {
      TableName: 'Messages',
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'B' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      ProvisionedThroughput,
    },
    {
      TableName: 'Contacts',
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'B' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      ProvisionedThroughput,
    },
    {
      TableName: 'ChannelTagEdges',
      AttributeDefinitions: [
        { AttributeName: 'inID', AttributeType: 'B' },
        { AttributeName: 'outID', AttributeType: 'B' },
      ],
      KeySchema: [
        { AttributeName: 'inID', KeyType: 'HASH' },
        { AttributeName: 'outID', KeyType: 'RANGE' },
      ],
      ProvisionedThroughput,
      GlobalSecondaryIndexes: [ {
        IndexName: 'Reverse',
        KeySchema: [
          { AttributeName: 'outID', KeyType: 'HASH' },
          { AttributeName: 'inID', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput,
      } ],
    },
    {
      TableName: 'MessageTagEdges',
      AttributeDefinitions: [
        { AttributeName: 'inID', AttributeType: 'B' },
        { AttributeName: 'outID', AttributeType: 'B' },
      ],
      KeySchema: [
        { AttributeName: 'inID', KeyType: 'HASH' },
        { AttributeName: 'outID', KeyType: 'RANGE' },
      ],
      ProvisionedThroughput,
      GlobalSecondaryIndexes: [ {
        IndexName: 'Reverse',
        KeySchema: [
          { AttributeName: 'outID', KeyType: 'HASH' },
          { AttributeName: 'inID', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput,
      } ],
    },
    {
      TableName: 'UserReadMessageEdges',
      AttributeDefinitions: [
        { AttributeName: 'inID', AttributeType: 'B' },
        { AttributeName: 'outID', AttributeType: 'B' },
      ],
      KeySchema: [
        { AttributeName: 'inID', KeyType: 'HASH' },
        { AttributeName: 'outID', KeyType: 'RANGE' },
      ],
      ProvisionedThroughput,
      GlobalSecondaryIndexes: [ {
        IndexName: 'Reverse',
        KeySchema: [
          { AttributeName: 'outID', KeyType: 'HASH' },
          { AttributeName: 'inID', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput,
      } ],
    },

    // TABLES WITH SPECIAL INDEXES
    {
      TableName: 'Links',
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'B' },
        { AttributeName: 'url', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      ProvisionedThroughput,
      GlobalSecondaryIndexes: [ {
        IndexName: 'Url',
        KeySchema: [
          { AttributeName: 'url', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput,
      } ],
    },
    {
      TableName: 'Channels',
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'B' },
        { AttributeName: 'tagIDs', AttributeType: 'B' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      ProvisionedThroughput,
      GlobalSecondaryIndexes: [ {
        IndexName: 'ChannelsByTagIDs',
        KeySchema: [ { AttributeName: 'tagIDs', KeyType: 'HASH' } ],
        Projection: { ProjectionType: 'KEYS_ONLY' },
        ProvisionedThroughput,
      } ],
    },
    {
      TableName: 'Users',
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'B' },
        { AttributeName: 'phoneNumber', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      ProvisionedThroughput,
      GlobalSecondaryIndexes: [ {
        IndexName: 'PhoneNumber',
        KeySchema: [ { AttributeName: 'phoneNumber', KeyType: 'HASH' } ],
        Projection: { ProjectionType: 'KEYS_ONLY' },
        ProvisionedThroughput,
      } ],
    },
    {
      TableName: 'Tags',
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'B' },
        { AttributeName: 'name', AttributeType: 'S' },
        { AttributeName: 'synsetOffset', AttributeType: 'N' },
        { AttributeName: 'bucket', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      ProvisionedThroughput,
      GlobalSecondaryIndexes: [
        {
          IndexName: 'SynsetOffset',
          KeySchema: [ { AttributeName: 'synsetOffset', KeyType: 'HASH' } ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
          ProvisionedThroughput,
        },
        {
          IndexName: 'Name',
          KeySchema: [
            { AttributeName: 'name', KeyType: 'HASH' },
            { AttributeName: 'id', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
          ProvisionedThroughput,
        },
        {
          IndexName: 'NameSorted',
          KeySchema: [
            { AttributeName: 'bucket', KeyType: 'HASH' },
            { AttributeName: 'name', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput,
        },
        {
          IndexName: 'SynsetOffsetOrder',
          KeySchema: [
            { AttributeName: 'bucket', KeyType: 'HASH' },
            { AttributeName: 'synsetOffset', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'KEYS_ONLY' },
          ProvisionedThroughput,
        }
      ],
    },
    {
      TableName: 'TagMessageVisitedEdges',
      AttributeDefinitions: [
        { AttributeName: 'outID', AttributeType: 'B' },
        { AttributeName: 'inID', AttributeType: 'B' },
        { AttributeName: 'messageCreateDateOrder', AttributeType: 'N' },
      ],
      // This primary key is outID+inID so that we can do a fast individual
      // edge get and connection traversal in most used direction
      KeySchema: [
        { AttributeName: 'outID', KeyType: 'HASH' },
        { AttributeName: 'inID', KeyType: 'RANGE' },
      ],
      ProvisionedThroughput,
      LocalSecondaryIndexes: [
        // This index is for connection traversal in most used direction
        // with an order applied
        {
          IndexName: 'MessageCreateDateOrder',
          KeySchema: [
            { AttributeName: 'outID', KeyType: 'HASH' },
            { AttributeName: 'messageCreateDateOrder', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        }
      ],
      GlobalSecondaryIndexes: [
        // This index is for connection traversal in opposite direction
        {
          IndexName: 'Reverse',
          KeySchema: [
            { AttributeName: 'inID', KeyType: 'HASH' },
            { AttributeName: 'outID', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput,
        }
      ],
    },
    {
      TableName: 'ParentTagChildTagEdges',
      AttributeDefinitions: [
        { AttributeName: 'inID', AttributeType: 'B' },
        { AttributeName: 'outID', AttributeType: 'B' },
        { AttributeName: 'parentTagNameOrder', AttributeType: 'S' },
        { AttributeName: 'childTagNameOrder', AttributeType: 'S' },
      ],
      KeySchema: [
        // This primary key is outID+inID so that we can do a fast individual
        // edge get and connection traversal in most used direction
        { AttributeName: 'inID', KeyType: 'HASH' },
        { AttributeName: 'outID', KeyType: 'RANGE' },
      ],
      ProvisionedThroughput,
      LocalSecondaryIndexes: [
        // This index is for connection traversal in most used direction
        // with an order applied
        {
          IndexName: 'ParentTagNameOrder',
          KeySchema: [
            { AttributeName: 'inID', KeyType: 'HASH' },
            { AttributeName: 'parentTagNameOrder', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        }
      ],
      GlobalSecondaryIndexes: [
        // This index is for connection traversal in opposite direction
        // with an order applied
        {
          IndexName: 'ChildTagNameOrderReverse',
          KeySchema: [
            { AttributeName: 'outID', KeyType: 'HASH' },
            { AttributeName: 'childTagNameOrder', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput,
        }
      ],
    },
    {
      TableName: 'UserChannelEdges',
      AttributeDefinitions: [
        { AttributeName: 'outID', AttributeType: 'B' },
        { AttributeName: 'inID', AttributeType: 'B' },
        { AttributeName: 'messageCreateDateOrder', AttributeType: 'N' },
      ],
      KeySchema: [
        { AttributeName: 'outID', KeyType: 'HASH' },
        { AttributeName: 'inID', KeyType: 'RANGE' },
      ],
      ProvisionedThroughput,
      LocalSecondaryIndexes: [
        // This index is for connection traversal in most used direction
        // with an order applied
        {
          IndexName: 'MessageCreateDateOrder',
          KeySchema: [
            { AttributeName: 'outID', KeyType: 'HASH' },
            { AttributeName: 'messageCreateDateOrder', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        }
      ],
      GlobalSecondaryIndexes: [ {
        IndexName: 'Reverse',
        KeySchema: [
          { AttributeName: 'inID', KeyType: 'HASH' },
          { AttributeName: 'outID', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput,
      } ],
    },
    {
      TableName: 'UserContactEdges',
      AttributeDefinitions: [
        { AttributeName: 'outID', AttributeType: 'B' },
        { AttributeName: 'inID', AttributeType: 'B' },
        { AttributeName: 'userOrder', AttributeType: 'S' },
        { AttributeName: 'inPhoneNumber', AttributeType: 'S' },
      ],
      KeySchema: [
        // This primary key is outID+inID so that we can do a fast individual
        // edge get and connection traversal in most used direction
        { AttributeName: 'outID', KeyType: 'HASH' },
        { AttributeName: 'inID', KeyType: 'RANGE' },
      ],
      ProvisionedThroughput,
      LocalSecondaryIndexes: [
        // This index is for connection traversal in most used direction
        // with a special order applied
        {
          IndexName: 'UserOrder',
          KeySchema: [
            { AttributeName: 'outID', KeyType: 'HASH' },
            { AttributeName: 'userOrder', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        },
        // This index is for connection traversal in most used direction
        // with ablity to filter / query by contact phone number
        {
          IndexName: 'InPhoneNumber',
          KeySchema: [
            { AttributeName: 'outID', KeyType: 'HASH' },
            { AttributeName: 'inPhoneNumber', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        }
      ],
      GlobalSecondaryIndexes: [
        // This index is for connection traversal in opposite direction
        {
          IndexName: 'UserOrderReverse',
          KeySchema: [
            { AttributeName: 'inID', KeyType: 'HASH' },
            { AttributeName: 'userOrder', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput,
        }
      ],
    },
    {
      TableName: 'ChannelMessageVisitedEdges',
      AttributeDefinitions: [
        { AttributeName: 'outID', AttributeType: 'B' },
        { AttributeName: 'inID', AttributeType: 'B' },
        { AttributeName: 'messageCreateDateOrder', AttributeType: 'N' },
      ],
      // This primary key is outID+inID so that we can do a fast individual
      // edge get and connection traversal in most used direction
      KeySchema: [
        { AttributeName: 'outID', KeyType: 'HASH' },
        { AttributeName: 'inID', KeyType: 'RANGE' },
      ],
      ProvisionedThroughput,
      LocalSecondaryIndexes: [
        // This index is for connection traversal in most used direction
        // with an order applied
        {
          IndexName: 'MessageCreateDateOrder',
          KeySchema: [
            { AttributeName: 'outID', KeyType: 'HASH' },
            { AttributeName: 'messageCreateDateOrder', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
        }
      ],
      GlobalSecondaryIndexes: [
        // This index is for connection traversal in opposite direction
        {
          IndexName: 'Reverse',
          KeySchema: [
            { AttributeName: 'inID', KeyType: 'HASH' },
            { AttributeName: 'outID', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput,
        }
      ],
    },
  ]
};
