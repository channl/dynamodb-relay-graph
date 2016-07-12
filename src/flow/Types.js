/* @flow */
import { MeasuredCollection } from 'measured';

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
 id: Buffer
};

export type EdgeQueryExpression = {
  type: string,
  inID?: Object,
  outID?: Object,
};

export type Node = {
  type: string,
  id: Buffer
};

export type TypeAndKey = {
  type: string,
  key: Object,
};

export type RequestMetadata = {
  [tableName: string]: TableMetadata,
};

export type TableMetadata = {
  typeAndKeys: TypeAndKey[],
};

export type Model = {
  type: string,
  [propertyName: string]: string | Buffer | number | boolean,
};
