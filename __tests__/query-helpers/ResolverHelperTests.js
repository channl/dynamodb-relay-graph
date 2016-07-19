/* @flow */
import ResolverHelper from '../../src/query-helpers/ResolverHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

const tableDescription = {
  AttributeDefinitions: [
    {
      AttributeName: 'MyAttributeName1',
      AttributeType: 'S'
    },
    {
      AttributeName: 'MyAttributeName2',
      AttributeType: 'S'
    }
  ],
  CreationDateTime: 0,
  GlobalSecondaryIndexes: [],
  ItemCount: 0,
  KeySchema: [],
  LatestStreamArn: '',
  LatestStreamLabel: '',
  LocalSecondaryIndexes: [],
  ProvisionedThroughput: {
    LastDecreaseDateTime: '',
    LastIncreaseDateTime: '',
    NumberOfDecreasesToday: 0,
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  StreamSpecification: {
    StreamEnabled: false,
    StreamViewType: '',
  },
  TableArn: '',
  TableName: 'MyTable',
  TableSizeBytes: 0,
  TableStatus: ''
};

describe('ResolverHelperTests', () => {

  it('GetAttributeTypeReturnsCorrectAttribute', () => {
    let attributeType = ResolverHelper.getAttributeType(tableDescription, 'MyAttributeName2');
    expect(attributeType).to.equal('S');
  });

  it('GetAttributeTypeThrowsInvariant', () => {
    let func = () => ResolverHelper.getAttributeType(tableDescription, 'MyAttributeName3');
    expect(func).to.throw('AttributeDefinition was not found');
  });

});
