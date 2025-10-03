// Core data structures for database schema

export interface Column {
  name: string;
  type: string;
  primaryKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  autoIncrement?: boolean;
  default?: string;
  note?: string;
}

export interface Index {
  columns: string[];
  unique?: boolean;
  name?: string;
}

export interface Table {
  id: string;
  name: string;
  schema?: string; // for multi-schema support
  columns: Column[];
  indexes?: Index[];
  note?: string;
  color?: string;
}

export enum RelationshipType {
  ONE_TO_ONE = '1-1',
  ONE_TO_MANY = '1-n',
  MANY_TO_ONE = 'n-1',
  MANY_TO_MANY = 'n-n'
}

export interface Relationship {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: RelationshipType;
  label?: string;
}

export interface Enum {
  name: string;
  values: string[];
}

export interface DatabaseSchema {
  tables: Table[];
  relationships: Relationship[];
  enums: Enum[];
  schemas?: string[]; // list of schema namespaces
}

export interface Position {
  x: number;
  y: number;
}

export interface TablePosition {
  tableId: string;
  position: Position;
}
