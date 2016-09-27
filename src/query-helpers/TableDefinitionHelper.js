/* @flow */
import invariant from 'invariant';
import type { TableDefinition } from 'aws-sdk-promise';

export default class TableDefinitionHelper {

  static getAttributeType(tableSchema: TableDefinition, attributeName: string) {
    invariant(tableSchema, 'Argument \'tableSchema\' is null');
    invariant(attributeName, 'Argument \'attributeName\' is null');

    let attributeDefinition = tableSchema
      .AttributeDefinitions
      .find(a => a.AttributeName === attributeName);

    invariant(attributeDefinition, 'AttributeDefinition was not found');
    return attributeDefinition.AttributeType;
  }
}
