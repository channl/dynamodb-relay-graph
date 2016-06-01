/* @flow */
export type ConnectionArgs = {
  first?: number,
  last?: number,
  before?: string,
  after?: string,
  order?: string,
};

export type Options = {
  log: boolean
};

export type NodeQueryExpression = {
  type: string,
  id: Buffer
} | string;

export type EdgeQueryExpression = {
  type: string
};

export type Node = {
  type: string,
  id: Buffer
};

export type Edge = {
  cursor: string,
  node: Node
};

export type PageInfo = {
  startCursor: string,
  endCursor: string,
  hasPreviousPage: boolean,
  hasNextPage: boolean
};

export type Connection = {
  edges: Edge[],
  pageInfo: PageInfo
};
