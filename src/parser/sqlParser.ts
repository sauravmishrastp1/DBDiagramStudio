// SQL Parser - Converts SQL CREATE TABLE and ALTER TABLE statements to DBML
import { Table, Column, Relationship, RelationshipType, DatabaseSchema } from '../types/schema';

export class SQLParser {
  private input: string;
  private tables: Map<string, Table> = new Map();
  private relationships: Relationship[] = [];

  constructor(input: string) {
    this.input = input;
  }

  parse(): DatabaseSchema {
    this.tables = new Map();
    this.relationships = [];

    // Normalize whitespace for simpler parsing (but keep case)
    const sql = this.input
      .replace(/--.*$/gm, '') // remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
      .replace(/\r\n/g, '\n');

    this.parseCreateTables(sql);
    this.parseAlterTableForeignKeys(sql);

    return {
      tables: Array.from(this.tables.values()),
      relationships: this.relationships,
      enums: []
    };
  }

  private parseCreateTables(sql: string) {
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"]?[\w.]+[`"]?)\s*\(([\s\S]*?)\)\s*;/gi;
    let match: RegExpExecArray | null;
    while ((match = createTableRegex.exec(sql)) !== null) {
      const rawTableName = this.cleanIdentifier(match[1]);
      const body = match[2].trim();
      const table: Table = {
        id: rawTableName,
        name: rawTableName,
        columns: []
      };

      // schema.table support
      if (rawTableName.includes('.')) {
        const [schema, name] = rawTableName.split('.');
        table.schema = schema;
        table.name = name;
      }

      // Split body by commas, but NOT inside parentheses
      const parts = this.splitByCommasOutsideParens(body);
      for (const part of parts) {
        const line = part.trim();
        if (!line) continue;

        // Constraint line
        if (/^(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|INDEX|KEY)\b/i.test(line)) {
          this.parseTableConstraint(line, table);
          continue;
        }

        // Column definition
        const col = this.parseColumn(line);
        if (col) table.columns.push(col);
      }

      // Only keep table if it has at least one column
      if (table.columns.length > 0) {
        this.tables.set(table.id, table);
      }
    }
  }

  private parseAlterTableForeignKeys(sql: string) {
    // ALTER TABLE <table> ADD [CONSTRAINT name] FOREIGN KEY (col) REFERENCES refTable(refCol)
    const alterRegex = /ALTER\s+TABLE\s+([`"]?[\w.]+[`"]?)\s+ADD\s+(?:CONSTRAINT\s+[`"]?[\w-]+[`"]?\s+)?FOREIGN\s+KEY\s*\(\s*([`"]?\w+[`"]?)\s*\)\s*REFERENCES\s+([`"]?[\w.]+[`"]?)\s*\(\s*([`"]?\w+[`"]?)\s*\)\s*;/gi;
    let match: RegExpExecArray | null;
    while ((match = alterRegex.exec(sql)) !== null) {
      const tableName = this.cleanIdentifier(match[1]);
      const fromColumn = this.cleanIdentifier(match[2]);
      const refTable = this.cleanIdentifier(match[3]);
      const refColumn = this.cleanIdentifier(match[4]);

      this.relationships.push({
        id: `${tableName}_${fromColumn}_${refTable}_${refColumn}`,
        fromTable: tableName,
        fromColumn,
        toTable: refTable,
        toColumn: refColumn,
        type: RelationshipType.MANY_TO_ONE,
      });
    }
  }

  private parseTableConstraint(line: string, table: Table) {
    // PRIMARY KEY (col)
    const pkMatch = line.match(/PRIMARY\s+KEY\s*\(\s*([`"]?\w+[`"]?)\s*\)/i);
    if (pkMatch) {
      const colName = this.cleanIdentifier(pkMatch[1]);
      const col = table.columns.find(c => c.name === colName);
      if (col) col.primaryKey = true;
      return;
    }

    // FOREIGN KEY (col) REFERENCES table(col)
    const fkMatch = line.match(/FOREIGN\s+KEY\s*\(\s*([`"]?\w+[`"]?)\s*\)\s*REFERENCES\s+([`"]?[\w.]+[`"]?)\s*\(\s*([`"]?\w+[`"]?)\s*\)/i);
    if (fkMatch) {
      const fromColumn = this.cleanIdentifier(fkMatch[1]);
      const toTable = this.cleanIdentifier(fkMatch[2]);
      const toColumn = this.cleanIdentifier(fkMatch[3]);
      this.relationships.push({
        id: `${table.id}_${fromColumn}_${toTable}_${toColumn}`,
        fromTable: table.id,
        fromColumn,
        toTable,
        toColumn,
        type: RelationshipType.MANY_TO_ONE,
      });
      return;
    }

    // UNIQUE (col) - ignore for now at table level
  }

  private parseColumn(line: string): Column | null {
    // column_name data_type ...
    const m = line.match(/^\s*([`"]?\w+[`"]?)\s+([\w]+(?:\([^\)]*\))?)\s*(.*)$/i);
    if (!m) return null;

    const name = this.cleanIdentifier(m[1]);
    const type = m[2].toLowerCase();
    const tail = m[3] || '';

    const col: Column = { name, type };

    const upper = tail.toUpperCase();
    if (/PRIMARY\s+KEY/.test(upper)) col.primaryKey = true;
    if (/NOT\s+NULL/.test(upper)) col.notNull = true;
    if (/UNIQUE\b/.test(upper)) col.unique = true;
    if (/AUTO_INCREMENT|AUTOINCREMENT/.test(upper)) col.autoIncrement = true;

    const def = tail.match(/DEFAULT\s+([^,\s]+)/i);
    if (def) col.default = def[1].replace(/^[`'"]|[`'"]$/g, '');

    const note = tail.match(/COMMENT\s+['"]([^'"]+)['"]/i);
    if (note) col.note = note[1];

    return col;
  }

  private splitByCommasOutsideParens(s: string): string[] {
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '(') {
        depth++;
        current += ch;
      } else if (ch === ')') {
        depth = Math.max(0, depth - 1);
        current += ch;
      } else if (ch === ',' && depth === 0) {
        parts.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim().length > 0) parts.push(current);
    return parts;
  }

  private cleanIdentifier(name: string): string {
    return name.replace(/[`"]+/g, '').trim();
  }
}

export function parseSQL(input: string): DatabaseSchema {
  const parser = new SQLParser(input);
  return parser.parse();
}

// Convert SQL schema to DBML
export function sqlToDBML(sql: string): string {
  const schema = parseSQL(sql);
  let dbml = '';

  for (const table of schema.tables) {
    const tableName = table.schema ? `${table.schema}.${table.name}` : table.name;
    dbml += `Table ${tableName} {\n`;
    for (const column of table.columns) {
      dbml += `  ${column.name} ${column.type}`;
      const attrs: string[] = [];
      if (column.primaryKey) attrs.push('pk');
      if (column.notNull) attrs.push('not null');
      if (column.unique) attrs.push('unique');
      if (column.autoIncrement) attrs.push('increment');
      if (column.default) attrs.push(`default: '${column.default}'`);
      if (column.note) attrs.push(`note: '${column.note}'`);
      if (attrs.length) dbml += ` [${attrs.join(', ')}]`;
      dbml += `\n`;
    }
    dbml += `}\n\n`;
  }

  for (const rel of schema.relationships) {
    dbml += `Ref: ${rel.fromTable}.${rel.fromColumn} > ${rel.toTable}.${rel.toColumn}\n`;
  }

  return dbml;
}
