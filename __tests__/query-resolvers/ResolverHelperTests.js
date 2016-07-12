/* @flow */
import ResolverHelper from '../../src/query-resolvers/ResolverHelper';
import { expect } from 'chai';
import { describe, it } from 'mocha';

const tableDescription = {
  AttributeDefinitions: [
    {
      AttributeName: 'MyAttributeName1',
      AttributeType: 'MyAttributeType1'
    },
    {
      AttributeName: 'MyAttributeName2',
      AttributeType: 'MyAttributeType2'
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
    expect(attributeType).to.equal('MyAttributeType2');
  });

  it('GetAttributeTypeThrowsInvariant', () => {
    let func = () => ResolverHelper.getAttributeType(tableDescription, 'MyAttributeName3');
    expect(func).to.throw('AttributeDefinition was not found');
  });

});
