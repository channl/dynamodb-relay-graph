/* @flow */
import { MeasuredCollection } from 'measured';
import type { AttributeMap } from 'aws-sdk-promise';

export type ConnectionArgs = {
  first?: number,
  last?: number,
  before?: string,
  after?: string,
  order?: string,
  orderDesc?: boolean,
};

export type Options = {
  log?: boolean,
  stats?: MeasuredCollection
};

export type QueryExpression = NodeQueryExpression | EdgeQueryExpression;

export type NodeQueryExpression = any
| TypeOnlyNodeQueryExpression
| TypeAndIdNodeQueryExpression;

export type TypeOnlyNodeQueryExpression = {
  type: string
};

export type TypeAndIdNodeQueryExpression = {
 type: string,
 id: Value,
};

export type EdgeQueryExpression = InEdgeQueryExpression | OutEdgeQueryExpression;

export type InEdgeQueryExpression = {
  type: string,
  inID: Value,
};

export type OutEdgeQueryExpression = {
  type: string,
  outID: Value,
};

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

export type Value = string | Buffer | number | boolean;

export type Model = {
  type: string,
  [propertyName: string]: Value,
};
