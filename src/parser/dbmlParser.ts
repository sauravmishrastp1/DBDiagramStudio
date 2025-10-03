// DBML Parser - Parses DBML syntax into AST
import { Table, Column, Relationship, RelationshipType, DatabaseSchema, Enum } from '../types/schema';

export class DBMLParser {
  private input: string;
  private pos: number;
  private tables: Table[];
  private relationships: Relationship[];
  private enums: Enum[];

  constructor(input: string) {
    this.input = input;
    this.pos = 0;
    this.tables = [];
    this.relationships = [];
    this.enums = [];
  }

  parse(): DatabaseSchema {
    this.tables = [];
    this.relationships = [];
    this.enums = [];
    this.pos = 0;

    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const keyword = this.peekKeyword();
      
      if (keyword === 'Table' || keyword === 'table') {
        this.parseTable();
      } else if (keyword === 'Ref' || keyword === 'ref') {
        this.parseRelationship();
      } else if (keyword === 'Enum' || keyword === 'enum') {
        this.parseEnum();
      } else if (this.input[this.pos] === '/' && this.input[this.pos + 1] === '/') {
        this.skipLine();
      } else {
        this.pos++;
      }
    }

    return {
      tables: this.tables,
      relationships: this.relationships,
      enums: this.enums
    };
  }

  private peekKeyword(): string {
    const start = this.pos;
    let end = start;
    while (end < this.input.length && /[a-zA-Z]/.test(this.input[end])) {
      end++;
    }
    return this.input.substring(start, end);
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private skipLine(): void {
    while (this.pos < this.input.length && this.input[this.pos] !== '\n') {
      this.pos++;
    }
    if (this.pos < this.input.length) this.pos++; // skip the newline
  }

  private parseTable(): void {
    // Skip 'Table' keyword
    while (this.pos < this.input.length && /[a-zA-Z]/.test(this.input[this.pos])) {
      this.pos++;
    }
    this.skipWhitespace();

    // Parse table name
    const tableName = this.parseIdentifier();
    const table: Table = {
      id: tableName,
      name: tableName,
      columns: []
    };

    // Check for schema notation
    if (tableName.includes('.')) {
      const parts = tableName.split('.');
      table.schema = parts[0];
      table.name = parts[1];
    }

    this.skipWhitespace();

    // Skip optional 'as' alias
    if (this.peekKeyword() === 'as') {
      this.pos += 2;
      this.skipWhitespace();
      this.parseIdentifier();
      this.skipWhitespace();
    }

    // Parse table body
    if (this.input[this.pos] === '{') {
      this.pos++;
      this.skipWhitespace();

      while (this.pos < this.input.length && this.input[this.pos] !== '}') {
        this.skipWhitespace();
        
        if (this.pos >= this.input.length || this.input[this.pos] === '}') break;
        
        // Skip comments
        if (this.input[this.pos] === '/' && this.input[this.pos + 1] === '/') {
          this.skipLine();
          continue;
        }
        
        // Check for Note
        if (this.peekKeyword() === 'Note') {
          this.pos += 4; // skip 'Note'
          this.skipWhitespace();
          if (this.input[this.pos] === ':') {
            this.pos++;
            this.skipWhitespace();
            table.note = this.parseValue();
          }
          this.skipWhitespace();
          continue;
        }
        
        // Parse column
        const column = this.parseColumn();
        if (column) {
          table.columns.push(column);
        }
        
        this.skipWhitespace();
      }
      
      if (this.input[this.pos] === '}') {
        this.pos++; // skip '}'
      }
    }

    this.tables.push(table);
  }

  private parseIdentifier(): string {
    this.skipWhitespace();
    let identifier = '';
    
    // Handle quoted identifiers
    if (this.input[this.pos] === '"' || this.input[this.pos] === '`' || this.input[this.pos] === "'") {
      const quote = this.input[this.pos];
      this.pos++;
      while (this.pos < this.input.length && this.input[this.pos] !== quote) {
        identifier += this.input[this.pos];
        this.pos++;
      }
      if (this.input[this.pos] === quote) this.pos++; // skip closing quote
    } else {
      // Handle unquoted identifiers
      while (this.pos < this.input.length && /[a-zA-Z0-9_.]/.test(this.input[this.pos])) {
        identifier += this.input[this.pos];
        this.pos++;
      }
    }
    
    return identifier;
  }

  private parseColumn(): Column | null {
    this.skipWhitespace();
    
    const columnName = this.parseIdentifier();
    if (!columnName) return null;

    this.skipWhitespace();
    
    const columnType = this.parseIdentifier();
    if (!columnType) return null;
    
    const column: Column = {
      name: columnName,
      type: columnType
    };

    this.skipWhitespace();

    // Parse column constraints in brackets
    if (this.input[this.pos] === '[') {
      this.pos++;
      
      while (this.pos < this.input.length && this.input[this.pos] !== ']') {
        this.skipWhitespace();
        if (this.input[this.pos] === ']') break;

        const beforeAttrPos = this.pos;
        const attrRaw = this.parseIdentifier();
        const attr = attrRaw.toLowerCase();

        if (!attr) {
          // Safety: avoid infinite loop on unexpected char
          this.pos++;
          continue;
        }

        if (attr === 'pk' || attr === 'primary' || attr === 'primarykey') {
          column.primaryKey = true;
        } else if (attr === 'increment' || attr === 'auto_increment') {
          column.autoIncrement = true;
        } else if (attr === 'unique') {
          column.unique = true;
        } else if (attr === 'not') {
          this.skipWhitespace();
          const next = this.parseIdentifier().toLowerCase();
          if (next === 'null') {
            column.notNull = true;
          }
        } else if (attr === 'default') {
          this.skipWhitespace();
          if (this.input[this.pos] === ':') this.pos++;
          this.skipWhitespace();
          column.default = this.parseValue();
        } else if (attr === 'note') {
          this.skipWhitespace();
          if (this.input[this.pos] === ':') this.pos++;
          this.skipWhitespace();
          column.note = this.parseValue();
        } else if (attr === 'ref') {
          // Skip inline references for now: ref: > table.column
          this.skipWhitespace();
          if (this.input[this.pos] === ':') this.pos++;
          while (this.pos < this.input.length && this.input[this.pos] !== ',' && this.input[this.pos] !== ']') {
            this.pos++;
          }
        } else {
          // Unknown attribute: skip until next comma or closing bracket
          while (this.pos < this.input.length && this.input[this.pos] !== ',' && this.input[this.pos] !== ']') {
            this.pos++;
          }
        }

        this.skipWhitespace();
        if (this.input[this.pos] === ',') this.pos++;
      }

      if (this.input[this.pos] === ']') this.pos++; // skip ']'
    }

    // Skip to end of line
    while (this.pos < this.input.length && 
           this.input[this.pos] !== '\n' && 
           this.input[this.pos] !== '}') {
      this.pos++;
    }
    
    if (this.input[this.pos] === '\n') this.pos++; // skip newline

    return column;
  }

  private parseValue(): string {
    this.skipWhitespace();
    let value = '';
    
    if (this.input[this.pos] === '"' || this.input[this.pos] === "'" || this.input[this.pos] === '`') {
      const quote = this.input[this.pos];
      this.pos++;
      while (this.pos < this.input.length && this.input[this.pos] !== quote) {
        value += this.input[this.pos];
        this.pos++;
      }
      if (this.input[this.pos] === quote) this.pos++; // skip closing quote
    } else {
      while (this.pos < this.input.length && 
             this.input[this.pos] !== ',' && 
             this.input[this.pos] !== ']' && 
             this.input[this.pos] !== '\n' &&
             this.input[this.pos] !== '}') {
        value += this.input[this.pos];
        this.pos++;
      }
    }
    
    return value.trim();
  }

  private parseRelationship(): void {
    // Skip 'Ref' keyword
    while (this.pos < this.input.length && /[a-zA-Z]/.test(this.input[this.pos])) {
      this.pos++;
    }
    this.skipWhitespace();

    // Skip optional name
    if (this.input[this.pos] !== ':') {
      this.parseIdentifier();
      this.skipWhitespace();
    }

    // Skip ':'
    if (this.input[this.pos] === ':') {
      this.pos++;
      this.skipWhitespace();
    }

    // Parse: table.column > table.column
    const from = this.parseTableColumn();
    this.skipWhitespace();

    let relationType = RelationshipType.ONE_TO_MANY;
    
    // Parse relationship operator
    if (this.input[this.pos] === '<') {
      this.pos++;
      relationType = RelationshipType.MANY_TO_ONE;
      if (this.input[this.pos] === '>') {
        this.pos++;
        relationType = RelationshipType.MANY_TO_MANY;
      }
    } else if (this.input[this.pos] === '>') {
      this.pos++;
      relationType = RelationshipType.ONE_TO_MANY;
    } else if (this.input[this.pos] === '-') {
      this.pos++;
      if (this.input[this.pos] === '-') {
        this.pos++;
        relationType = RelationshipType.ONE_TO_ONE;
      }
    }

    this.skipWhitespace();
    const to = this.parseTableColumn();

    if (from && to) {
      this.relationships.push({
        id: `${from.table}_${from.column}_${to.table}_${to.column}`,
        fromTable: from.table,
        fromColumn: from.column,
        toTable: to.table,
        toColumn: to.column,
        type: relationType
      });
    }
  }

  private parseTableColumn(): { table: string; column: string } | null {
    const identifier = this.parseIdentifier();
    if (identifier.includes('.')) {
      const parts = identifier.split('.');
      return { table: parts[0], column: parts[1] };
    }
    return null;
  }

  private parseEnum(): void {
    // Skip 'Enum' keyword
    while (this.pos < this.input.length && /[a-zA-Z]/.test(this.input[this.pos])) {
      this.pos++;
    }
    this.skipWhitespace();

    const enumName = this.parseIdentifier();
    const enumValues: string[] = [];

    this.skipWhitespace();
    if (this.input[this.pos] === '{') {
      this.pos++;
      this.skipWhitespace();

      while (this.pos < this.input.length && this.input[this.pos] !== '}') {
        this.skipWhitespace();
        
        if (this.input[this.pos] === '}') break;
        
        if (this.input[this.pos] === '/' && this.input[this.pos + 1] === '/') {
          this.skipLine();
        } else {
          const value = this.parseIdentifier();
          if (value) {
            enumValues.push(value);
          }
        }
        
        this.skipWhitespace();
      }
      
      if (this.input[this.pos] === '}') this.pos++;
    }

    this.enums.push({
      name: enumName,
      values: enumValues
    });
  }
}

export function parseDBML(input: string): DatabaseSchema {
  const parser = new DBMLParser(input);
  const result = parser.parse();
  console.log('🔍 Parser Debug:', {
    totalTables: result.tables.length,
    tables: result.tables.map(t => ({
      name: t.name,
      columnCount: t.columns.length,
      columns: t.columns.map(c => c.name)
    }))
  });
  return result;
}