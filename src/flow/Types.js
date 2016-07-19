/* @flow */
import { MeasuredCollection } from 'measured';
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

export type Options = {
  log?: boolean,
  stats?: MeasuredCollection
};
/*
export type QueryExpression = NodeQueryExpression | EdgeQueryExpression;

export type NodeQueryExpression = TypeOnlyNodeQueryExpression |
  TypeAndIdNodeQueryExpression | TypeAndAnyNodeQueryExpression;

export type TypeOnlyNodeQueryExpression = {
  type: string
};

export type TypeAndIdNodeQueryExpression = {
 type: string,
 id: ExpressionValue,
};

export type TypeAndAnyNodeQueryExpression = {
 type: string,
 [name: string]: ExpressionValue,
};

export type EdgeQueryExpression = InEdgeQueryExpression | OutEdgeQueryExpression;

export type InEdgeQueryExpression = {
  type: string,
  inID: ExpressionValue,
};

export type OutEdgeQueryExpression = {
  type: string,
  outID: ExpressionValue,
};
*/

export type QueryExpression = {
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

export type ExpressionValue = Value | ExpressionValueBefore |
  ExpressionValueAfter | ExpressionValueBeginsWith;

export type Value = string | Buffer | number | boolean | null;

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
