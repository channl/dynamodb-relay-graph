/* @flow */
import QueryHelper from '../../src/query-helpers/QueryHelper';
import { toGlobalId } from 'graphql-relay';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import type { QueryExpression } from '../../src/flow/Types';

describe('QueryHelperTests', () => {

  it('getExclusiveStartKeyFirst', () => {
    let connectionArgs = { first: 2 };
    let result = QueryHelper.getExclusiveStartKey(connectionArgs);
    let expected;
    expect(result).to.deep.equal(expected);
  });

  it('getExclusiveStartThrowsOnInValidArgs', () => {
    let connectionArgs = { };
    let func = () => QueryHelper.getExclusiveStartKey(connectionArgs);
    expect(func).to.throw('First or Last must be specified');
  });

  it('getExclusiveStartKeyFirstAfter', () => {
    let connectionArgs = {
      first: 2,
      after: 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fX0='
    };
    let result = QueryHelper.getExclusiveStartKey(connectionArgs);
    let expected = {
      id: { B:
        new Buffer('ABC', 'base64'),
      },
    };
    expect(result).to.deep.equal(expected);
  });

  it('getExclusiveStartKeyLast', () => {
    let connectionArgs = { last: 2 };
    let result = QueryHelper.getExclusiveStartKey(connectionArgs);
    let expected;
    expect(result).to.deep.equal(expected);
  });

  it('getExclusiveStartKeyLastBefore', () => {
    let connectionArgs = {
      last: 2,
      before: 'eyJpZCI6eyJCIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjpbMCwxNl19fX0='
    };
    let result = QueryHelper.getExclusiveStartKey(connectionArgs);
    let expected = {
      id: { B:
        new Buffer('ABC', 'base64'),
      },
    };
    expect(result).to.deep.equal(expected);
  });

  it('isForwardScanFirst', () => {
    let connectionArgs = { first: 2 };
    let result = QueryHelper.isForwardScan(connectionArgs);
    let expected = true;
    expect(result).to.deep.equal(expected);
  });

  it('isForwardScanLast', () => {
    let connectionArgs = { last: 2 };
    let result = QueryHelper.isForwardScan(connectionArgs);
    let expected = false;
    expect(result).to.deep.equal(expected);
  });

  it('getExclusiveStartThrowsOnInValidArgs', () => {
    let connectionArgs = { };
    let func = () => QueryHelper.isForwardScan(connectionArgs);
    expect(func).to.throw('First or Last must be specified');
  });

  it('getScanIndexForwardFirst', () => {
    let connectionArgs = { first: 2 };
    let result = QueryHelper.getScanIndexForward(connectionArgs);
    let expected = true;
    expect(result).to.deep.equal(expected);
  });

  it('getScanIndexForwardFirstOrderDesc', () => {
    let connectionArgs = { first: 2, orderDesc: true };
    let result = QueryHelper.getScanIndexForward(connectionArgs);
    let expected = false;
    expect(result).to.deep.equal(expected);
  });

  it('getScanIndexForwardLast', () => {
    let connectionArgs = { last: 2 };
    let result = QueryHelper.getScanIndexForward(connectionArgs);
    let expected = false;
    expect(result).to.deep.equal(expected);
  });

  it('getScanIndexForwardLastOrderDesc', () => {
    let connectionArgs = { last: 2, orderDesc: true };
    let result = QueryHelper.getScanIndexForward(connectionArgs);
    let expected = true;
    expect(result).to.deep.deep.equal(expected);
  });

  it('getScanIndexForwardThrowsOnInValidArgs', () => {
    let connectionArgs = { };
    let func = () => QueryHelper.getScanIndexForward(connectionArgs);
    expect(func).to.throw('First or Last must be specified');
  });

  it('getLimitFirst', () => {
    let connectionArgs = { first: 2 };
    let result = QueryHelper.getLimit(connectionArgs);
    let expected = 2;
    expect(result).to.deep.equal(expected);
  });

  it('getLimitLast', () => {
    let connectionArgs = { last: 2 };
    let result = QueryHelper.getLimit(connectionArgs);
    let expected = 2;
    expect(result).to.deep.deep.equal(expected);
  });

  it('getLimitThrowsOnInValidArgs', () => {
    let connectionArgs = { };
    let func = () => QueryHelper.getLimit(connectionArgs);
    expect(func).to.throw('First or Last must be specified');
  });

  it('getExpressionAttributeNames', () => {
    let expression: QueryExpression = { value: 'Value' };
    let connectionArgs = { first: 2 };
    let include = [ 'Include' ];
    let result = QueryHelper.getExpressionAttributeNames(expression, connectionArgs, include);
    let expected = {
      '#resInclude': 'Include',
      '#resvalue': 'value'
    };

    expect(result).to.deep.equal(expected);
  });

  it('getIndexSchema', () => {
    let expression: QueryExpression = { id: '123' };
    let connectionArgs = { first: 2 };
    let tableSchema = {
      TableName: 'Test',
      AttributeDefinitions: [ {
        AttributeName: 'id', AttributeType: 'S',
      } ],
      KeySchema: [ {
        AttributeName: 'id', KeyType: 'HASH',
      } ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      }
    };
    let result = QueryHelper.getIndexSchema(expression, connectionArgs, tableSchema);
    let expected;
    expect(result).to.equal(expected);
  });

  it('getIndexSchemaUsingLocalIndex', () => {
    let expression = { id: toGlobalId('Test', '0'), name: 'ABC' };
    let connectionArgs = { first: 2 };
    let tableSchema = {
      TableName: 'Tests',
      AttributeDefinitions: [ {
        AttributeName: 'id', AttributeType: 'S',
      }, {
        AttributeName: 'name', AttributeType: 'S',
      } ],
      KeySchema: [ {
        AttributeName: 'id', KeyType: 'HASH',
      } ],
      LocalSecondaryIndexes: [ {
        IndexName: 'name',
        Projection: {
          ProjectionType: 'ALL',
        },
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH'
        }, {
          AttributeName: 'name', KeyType: 'RANGE',
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      }
    };
    let result = QueryHelper.getIndexSchema(expression, connectionArgs, tableSchema);
    let expected = {
      IndexName: 'name',
      KeySchema: [ {
        AttributeName: 'id',
        KeyType: 'HASH',
      }, {
        AttributeName: 'name',
        KeyType: 'RANGE',
      } ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('getIndexSchemaUsingIndex', () => {
    let expression = { id: toGlobalId('Test', '0'), name: 'ABC' };
    let connectionArgs = { first: 2 };
    let tableSchema = {
      TableName: 'Tests',
      AttributeDefinitions: [ {
        AttributeName: 'id', AttributeType: 'S',
      }, {
        AttributeName: 'name', AttributeType: 'S',
      } ],
      KeySchema: [ {
        AttributeName: 'id', KeyType: 'HASH',
      } ],
      GlobalSecondaryIndexes: [ {
        IndexName: 'name',
        Projection: {
          ProjectionType: 'ALL',
        },
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH'
        }, {
          AttributeName: 'name', KeyType: 'RANGE',
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      }
    };
    let result = QueryHelper.getIndexSchema(expression, connectionArgs, tableSchema);
    let expected = {
      IndexName: 'name',
      KeySchema: [ {
        AttributeName: 'id',
        KeyType: 'HASH',
      }, {
        AttributeName: 'name',
        KeyType: 'RANGE',
      } ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('getIndexSchemaUsingIndexAndOrder', () => {
    let expression = { id: toGlobalId('Test', '0'), name: 'ABC' };
    let connectionArgs = { first: 2, order: 'name' };
    let tableSchema = {
      TableName: 'Test',
      AttributeDefinitions: [ {
        AttributeName: 'id', AttributeType: 'S',
      }, {
        AttributeName: 'name', AttributeType: 'S',
      } ],
      KeySchema: [ {
        AttributeName: 'id', KeyType: 'HASH',
      } ],
      GlobalSecondaryIndexes: [ {
        IndexName: 'name',
        Projection: {
          ProjectionType: 'ALL',
        },
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH'
        }, {
          AttributeName: 'name', KeyType: 'RANGE',
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      }
    };
    let result = QueryHelper.getIndexSchema(expression, connectionArgs, tableSchema);
    let expected = {
      IndexName: 'name',
      KeySchema: [ {
        AttributeName: 'id',
        KeyType: 'HASH',
      }, {
        AttributeName: 'name',
        KeyType: 'RANGE',
      } ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('getIndexSchemaThrowsWhenNotAvailable', () => {
    let expression = { id: toGlobalId('Test', '0'), name: 'ABC' };
    let connectionArgs = { first: 2, order: 'notavailable' };
    let tableSchema = {
      TableName: 'Tests',
      AttributeDefinitions: [ {
        AttributeName: 'id', AttributeType: 'S',
      }, {
        AttributeName: 'name', AttributeType: 'S',
      } ],
      KeySchema: [ {
        AttributeName: 'id', KeyType: 'HASH',
      } ],
      GlobalSecondaryIndexes: [ {
        IndexName: 'name',
        Projection: {
          ProjectionType: 'ALL',
        },
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH'
        }, {
          AttributeName: 'name', KeyType: 'RANGE',
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      }
    };
    let func = () => QueryHelper.getIndexSchema(expression, connectionArgs, tableSchema);
    expect(func).to.throw('Corresponding LocalSecondaryIndex Or GlobalSecondaryIndex not found');
  });

  it('isKeySchemaSatisfiedUsingNull', () => {
    let proposed = [ {
      AttributeName: 'bucket',
      KeyType: 'HASH',
    }, {
      AttributeName: 'name',
      KeyType: 'RANGE',
    } ];
    let required = [];
    let result = QueryHelper.isKeySchemaSatisfied(proposed, required);
    let expected = true;
    expect(result).to.deep.equal(expected);
  });

  it('isKeySchemaSatisfiedUsingHash', () => {
    let proposed = [ {
      AttributeName: 'bucket',
      KeyType: 'HASH',
    }, {
      AttributeName: 'name',
      KeyType: 'RANGE',
    } ];
    let required = [ {
      AttributeName: 'bucket',
      KeyType: 'HASH',
    } ];
    let result = QueryHelper.isKeySchemaSatisfied(proposed, required);
    let expected = true;
    expect(result).to.deep.equal(expected);
  });

  it('isKeySchemaSatisfiedUsingStar', () => {
    let proposed = [ {
      AttributeName: 'bucket',
      KeyType: 'HASH',
    }, {
      AttributeName: 'name',
      KeyType: 'RANGE',
    } ];
    let required = [ {
      AttributeName: 'bucket',
      KeyType: '*',
    } ];
    let result = QueryHelper.isKeySchemaSatisfied(proposed, required);
    let expected = true;
    expect(result).to.deep.equal(expected);
  });

  it('isKeySchemaSatisfiedUsingHashAndRange', () => {
    let proposed = [ {
      AttributeName: 'bucket',
      KeyType: 'HASH',
    }, {
      AttributeName: 'name',
      KeyType: 'RANGE',
    } ];
    let required = [ {
      AttributeName: 'bucket',
      KeyType: 'HASH',
    }, {
      AttributeName: 'name',
      KeyType: 'RANGE',
    } ];
    let result = QueryHelper.isKeySchemaSatisfied(proposed, required);
    let expected = true;
    expect(result).to.deep.equal(expected);
  });

  it('isKeySchemaSatisfiedUsingHashAndStar', () => {
    let proposed = [ {
      AttributeName: 'bucket',
      KeyType: 'HASH',
    }, {
      AttributeName: 'name',
      KeyType: 'RANGE',
    } ];
    let required = [ {
      AttributeName: 'bucket',
      KeyType: 'HASH',
    }, {
      AttributeName: 'name',
      KeyType: '*',
    } ];
    let result = QueryHelper.isKeySchemaSatisfied(proposed, required);
    let expected = true;
    expect(result).to.deep.equal(expected);
  });

  it('isKeySchemaNotSeatisfiedUsingMismatchedTypes', () => {
    let proposed = [ {
      AttributeName: 'bucket',
      KeyType: 'HASH',
    }, {
      AttributeName: 'name',
      KeyType: 'RANGE',
    } ];
    let required = [ {
      AttributeName: 'name',
      KeyType: 'HASH',
    } ];
    let result = QueryHelper.isKeySchemaSatisfied(proposed, required);
    let expected = false;
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionKeyTypeUsingAfter', () => {
    let expression = { after: 'ABC' };
    let result = QueryHelper.getExpressionKeyType(expression);
    let expected = 'RANGE';
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionKeyTypeUsingBefore', () => {
    let expression = { before: 'ABC' };
    let result = QueryHelper.getExpressionKeyType(expression);
    let expected = 'RANGE';
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionKeyTypeUsingBeginsWith', () => {
    // eslint-disable-next-line camelcase
    let expression = { begins_with: 'ABC' };
    let result = QueryHelper.getExpressionKeyType(expression);
    let expected = 'RANGE';
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionKeyTypeUsingString', () => {
    let expression = 'GLOBALID';
    let result = QueryHelper.getExpressionKeyType(expression);
    let expected = '*';
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionKeyTypeUsingNumber', () => {
    let expression = 2;
    let result = QueryHelper.getExpressionKeyType(expression);
    let expected = '*';
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionKeyTypeUsingBuffer', () => {
    let expression = new Buffer('ABC', 'base64');
    let result = QueryHelper.getExpressionKeyType(expression);
    let expected = '*';
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionKeyTypeUsingFunc', () => {
    let expression = {};
    // $FlowIgnore
    let func = () => QueryHelper.getExpressionKeyType(expression);
    expect(func).to.throw('ExpressionKeyType cannot be determined');
  });

  it('getProjectionExpression', () => {
    let expression = { name: 'ABC', other: 'DEF' };
    let connectionArgs = { first: 2 };
    let include = [];
    let result = QueryHelper.getProjectionExpression(expression, connectionArgs, include);
    let expected = '#resname, #resother';
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionAttributeName', () => {
    let name = 'name';
    let result = QueryHelper.getExpressionAttributeName(name);
    let expected = '#resname';
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionAttributeValues', () => {
    let expression = { id: 'ABC' };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'S',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_equals_id': { S: 'ABC' }
    };
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionAttributeValuesWithTypeOnlyReturnsUndefined', () => {
    let expression = { };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'S',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected;
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionAttributeValuesOfString', () => {
    let expression = { id: 'ABC' };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'S',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_equals_id': {
        S: 'ABC'
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionAttributeValuesOfAfterString', () => {
    let expression = { id: { after: 'ABC' } };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'S',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_after_id': {
        S: 'ABC'
      }
    };
    expect(result).to.deep.equal(expected);
  });

/*
  it('getExpressionAttributeValuesOfAfterNullString', () => {
    let expression = { id: { after: null } };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'S',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_after_id': {
        S: ' '
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionAttributeValuesOfAfterNullNumber', () => {
    let expression = { id: { after: null } };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'N',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_after_id': {
        N: '0'
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionAttributeValuesOfAfterNullBuffer', () => {
    let expression = { id: { after: null } };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'B',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_after_id': {
        B: new Buffer('AAAAAAAAAAAAAAAAAAAAAA==', 'base64')
      }
    };
    expect(result).to.deep.equal(expected);
  });
*/
  it('getExpressionAttributeValuesOfBeforeString', () => {
    let expression = { id: { before: 'ABC' } };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'S',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_before_id': {
        S: 'ABC'
      }
    };
    expect(result).to.deep.equal(expected);
  });
/*
  it('getExpressionAttributeValuesOfBeforeNullString', () => {
    let expression = { id: { before: null } };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'S',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_before_id': {
        S: 'ZZZZZZZZZZ'
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionAttributeValuesOfBeforeNullNumber', () => {
    let expression = { id: { before: null } };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'N',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_before_id': {
        N: Number.MAX_SAFE_INTEGER.toString()
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionAttributeValuesOfBeforeNullBuffer', () => {
    let expression = { id: { before: null } };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'B',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_before_id': {
        B: new Buffer('/////////////////////w==', 'base64')
      }
    };
    expect(result).to.deep.equal(expected);
  });
*/
  it('getExpressionAttributeValuesOfBeginsWith', () => {
    // eslint-disable-next-line camelcase
    let expression = { id: { begins_with: 'ABC' } };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'S',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let result = QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    let expected = {
      ':v_begins_with_id': {
        S: 'ABC'
      }
    };
    expect(result).to.deep.equal(expected);
  });

  it('getExpressionAttributeThrowsOnInValid', () => {
    // $FlowIgnore
    let expression = { id: { unknown: 'value' } };
    let schema = {
      tables: [ {
        TableName: 'Tests',
        AttributeDefinitions: [ {
          AttributeName: 'id', AttributeType: 'S',
        }, {
          AttributeName: 'name', AttributeType: 'S',
        } ],
        KeySchema: [ {
          AttributeName: 'id', KeyType: 'HASH',
        } ],
        GlobalSecondaryIndexes: [ {
          IndexName: 'name',
          Projection: {
            ProjectionType: 'ALL',
          },
          KeySchema: [ {
            AttributeName: 'id', KeyType: 'HASH'
          }, {
            AttributeName: 'name', KeyType: 'RANGE',
          } ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        } ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        }
      } ]
    };
    let func = () => QueryHelper.getExpressionAttributeValues('Test', expression, schema);
    expect(func).to.throw('ExpressionValue type was invalid');
  });

  it('getKeyConditionExpression', () => {
    let expression = { };
    let result = QueryHelper.getKeyConditionExpression(expression);
    let expected;
    expect(result).to.deep.equal(expected);
  });

  it('getKeyConditionExpressionWithString', () => {
    let expression = { id: 'string' };
    let result = QueryHelper.getKeyConditionExpression(expression);
    let expected = '#resid = :v_equals_id';
    expect(result).to.deep.equal(expected);
  });

  it('getKeyConditionExpressionWithStrings', () => {
    let expression = { id: 'string', idd: 'string2' };
    let result = QueryHelper.getKeyConditionExpression(expression);
    let expected = '#resid = :v_equals_id AND #residd = :v_equals_idd';
    expect(result).to.deep.equal(expected);
  });

  it('getKeyConditionExpressionWithNumber', () => {
    let expression = { id: 2 };
    let result = QueryHelper.getKeyConditionExpression(expression);
    let expected = '#resid = :v_equals_id';
    expect(result).to.deep.equal(expected);
  });

  it('getKeyConditionExpressionWithBuffer', () => {
    let expression = { id: new Buffer('ABC', 'base64') };
    let result = QueryHelper.getKeyConditionExpression(expression);
    let expected = '#resid = :v_equals_id';
    expect(result).to.deep.equal(expected);
  });

  it('getKeyConditionExpressionAfter', () => {
    let expression = { id: { after: 2 } };
    let result = QueryHelper.getKeyConditionExpression(expression);
    let expected = '#resid > :v_after_id';
    expect(result).to.deep.equal(expected);
  });

  it('getKeyConditionExpressionBefore', () => {
    let expression = { id: { before: 2 } };
    let result = QueryHelper.getKeyConditionExpression(expression);
    let expected = '#resid < :v_before_id';
    expect(result).to.deep.equal(expected);
  });

  it('getKeyConditionExpressionBeginsWith', () => {
    // eslint-disable-next-line camelcase
    let expression = { id: { begins_with: 'prefix' } };
    let result = QueryHelper.getKeyConditionExpression(expression);
    let expected = 'begins_with(#resid, :v_begins_with_id)';
    expect(result).to.deep.equal(expected);
  });

  it('getKeyConditionExpressionBeforeAndAfter', () => {
    let expression = { id: { before: 10, after: 2 } };
    let func = () => QueryHelper.getKeyConditionExpression(expression);
    expect(func).to.throw('NotSupportedError (after and before used together)');
  });

  it('getKeyConditionExpressionThrowsOnInValid', () => {
    // $FlowIgnore
    let expression = { id: { unknown: 10 } };
    let func = () => QueryHelper.getKeyConditionExpression(expression);
    expect(func).to.throw('ExpressionValue type was invalid');
  });
});
