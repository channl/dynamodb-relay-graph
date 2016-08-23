/* @flow */
import type { AttributeMap } from 'aws-sdk-promise';

export type ConnectionArgs = FirstConnectionArgs | LastConnectionArgs;

export type FirstConnectionArgs = {
  first: number,
  after?: string,
  order?: string,
  orderDesc?: boolean,
};

export type LastConnectionArgs = {
  last: number,
  before?: string,
  order?: string,
  orderDesc?: boolean,
};

export type QueryExpression = {
  type: string,
  [name: string]: ExpressionValue,
}

export type TypeAndKey = {
  type: string,
  key: AttributeMap,
};

export type RequestMetadata = {
  [tableName: string]: TableMetadata,
};

export type TableMetadata = {
  typeAndKeys: TypeAndKey[],
};

export type Value = Buffer | string | number | boolean;

export type ExpressionValue = Value | ExpressionValueBefore |
  ExpressionValueAfter | ExpressionValueBeginsWith;

export type ExpressionValueBefore = {
  before: Value
};

export type ExpressionValueAfter = {
  after: Value
};

export type ExpressionValueBeginsWith = {
  begins_with: Value
};

export type Model = {
  type: string,
  [propertyName: string]: Value,
};

export type DRGEdge = {
  type: string,
  outID: Value,
  inID: Value,
  [propertyName: string]: Value,
};

/*
export type PartialEdgeConnection = {
  edges: PartialEdge[],
  pageInfo: PageInfo,
};

export type PartialEdge = {
  type: string,
  inID: Buffer,
  outID: Buffer,
  cursor: string,
};
*/
