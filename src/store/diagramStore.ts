// Global state management using Zustand
import { create } from 'zustand';
import { DatabaseSchema, Table, Relationship, TablePosition } from '../types/schema';
import { parseDBML } from '../parser/dbmlParser';

interface DiagramStore {
  schema: DatabaseSchema;
  dbmlCode: string;
  tablePositions: Map<string, TablePosition>;
  selectedTable: string | null;
  
  // Actions
  setDBMLCode: (code: string) => void;
  parseAndSetSchema: (code: string) => void;
  setTablePosition: (tableId: string, x: number, y: number) => void;
  setSelectedTable: (tableId: string | null) => void;
  addTable: (table: Table) => void;
  addRelationship: (relationship: Relationship) => void;
}

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  schema: {
    tables: [],
    relationships: [],
    enums: []
  },
  dbmlCode: '',
  tablePositions: new Map(),
  selectedTable: null,

  setDBMLCode: (code: string) => {
    set({ dbmlCode: code });
  },

  parseAndSetSchema: (code: string) => {
    try {
      const schema = parseDBML(code);
      console.log('✅ Parsed Schema:', schema);
      console.log('📊 Tables:', schema.tables.map(t => `${t.name} (${t.columns.length} columns)`));
      set({ schema, dbmlCode: code });
    } catch (error) {
      console.error('❌ Failed to parse DBML:', error);
    }
  },

  setTablePosition: (tableId: string, x: number, y: number) => {
    const positions = new Map(get().tablePositions);
    positions.set(tableId, { tableId, position: { x, y } });
    set({ tablePositions: positions });
  },

  setSelectedTable: (tableId: string | null) => {
    set({ selectedTable: tableId });
  },

  addTable: (table: Table) => {
    const schema = get().schema;
    set({
      schema: {
        ...schema,
        tables: [...schema.tables, table]
      }
    });
  },

  addRelationship: (relationship: Relationship) => {
    const schema = get().schema;
    set({
      schema: {
        ...schema,
        relationships: [...schema.relationships, relationship]
      }
    });
  }
}));
