/* @flow */
import { invariant } from '../Global';
import type { DynamoDBTable } from 'aws-sdk-promise';

export default class ExpressionHelper {

  static getAttributeType(tableSchema: DynamoDBTable, attributeName: string) {
    invariant(tableSchema, 'Argument \'tableSchema\' is null');
    invariant(attributeName, 'Argument \'attributeName\' is null');

    let attributeDefinition = tableSchema
      .AttributeDefinitions
      .find(a => a.AttributeName === attributeName);

    invariant(attributeDefinition, 'AttributeDefinition was not found');
    return attributeDefinition.AttributeType;
  }
}
