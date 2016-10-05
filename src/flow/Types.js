/* @flow */
import type { AttributeMap } from 'aws-sdk-promise';

export type ConnectionArgs = {
  first?: number,
  last?: number,
  before?: string,
  after?: string,
  order?: string,
  orderDesc?: boolean,
};

export type RequestMetadata = {
  [tableName: string]: TableMetadata,
};

export type TableMetadata = {
  typeAndKeys: TypeAndKey[],
};

export type QueryExpression = {
  [name: string]: ExpressionValue,
}

export type TypeAndKey = {
  type: string,
  key: AttributeMap,
};


export type Value = Buffer | string | number | boolean | Array<Buffer|string|number|boolean>;

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

export type Model = Node | Edge;

export type Node = {
  id: string,
  [propertyName: string]: ?Value,
};

export type Edge = {
  id: string,
  outID: string,
  inID: string,
};

export type ExprModel = Object;

export type DataModel = Object;

export type TypedDataModel = {
  type: string,
  dataModel: DataModel,
};

export type TypedMaybeDataModel = {
  type: string,
  dataModel: ?DataModel,
};
