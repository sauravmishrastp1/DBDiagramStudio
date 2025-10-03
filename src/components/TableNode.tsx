// Custom node component for rendering database tables
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Table } from '../types/schema';
import { Database } from 'lucide-react';

interface TableNodeProps {
  data: {
    table: Table;
    onSelect?: (tableId: string) => void;
  };
  selected?: boolean;
}

export const TableNode = memo(({ data, selected }: TableNodeProps) => {
  const { table } = data;
  
  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 transition-all ${
        selected ? 'border-primary-500 shadow-xl' : 'border-gray-200'
      }`}
      style={{ 
        minWidth: '320px',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Table Header */}
      <div 
        className={`px-4 py-3 rounded-t-lg font-semibold text-white flex items-center gap-2 ${
          table.color || 'bg-gradient-to-r from-primary-600 to-primary-700'
        }`}
        style={{ flexShrink: 0 }}
      >
        <Database size={18} />
        <div className="flex-1 min-w-0">
          <div className="text-lg truncate">{table.schema ? `${table.schema}.${table.name}` : table.name}</div>
          <div className="text-xs text-primary-100 font-normal">
            {table.columns.length} column{table.columns.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Columns - No scroll, show entire table */}
      <div 
        className="divide-y divide-gray-100"
        style={{ flex: '1 1 auto' }}
      >
        {table.columns.map((column, idx) => (
          <div
            key={idx}
            className={`px-4 py-2.5 hover:bg-gray-50 transition-colors ${
              column.primaryKey ? 'bg-amber-50' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {column.primaryKey && (
                  <span className="text-amber-600 font-bold text-sm flex-shrink-0" title="Primary Key">🔑</span>
                )}
                <span className={`font-medium text-sm ${column.primaryKey ? 'text-amber-900' : 'text-gray-800'}`}>
                  {column.name}
                </span>
                {/* Foreign Key indicator */}
                {column.name.includes('_id') && !column.primaryKey && (
                  <span className="text-blue-600 text-xs" title="Foreign Key">🔗</span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                {column.type.length > 18 ? column.type.substring(0, 18) + '...' : column.type}
              </span>
            </div>
            
            {/* Per-column connection handles (left = target, right = source) */}
            <Handle
              type="target"
              position={Position.Left}
              id={`${table.id}.${column.name}`}
              className="!bg-primary-500"
              style={{ 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '8px',
                height: '8px',
                border: '2px solid white',
                boxShadow: '0 0 0 1px #3b82f6'
              }}
            />
            <Handle
              type="source"
              position={Position.Right}
              id={`${table.id}.${column.name}`}
              className="!bg-primary-500"
              style={{ 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '8px',
                height: '8px',
                border: '2px solid white',
                boxShadow: '0 0 0 1px #3b82f6'
              }}
            />

            {/* Column attributes */}
            {(column.notNull || column.unique || column.autoIncrement || (column.name.includes('_id') && !column.primaryKey)) && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {column.notNull && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                    NOT NULL
                  </span>
                )}
                {column.unique && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    UNIQUE
                  </span>
                )}
                {column.autoIncrement && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    AUTO
                  </span>
                )}
                {column.name.includes('_id') && !column.primaryKey && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                    FK
                  </span>
                )}
              </div>
            )}

            {/* Optional note under column */}
            {column.note && (
              <div className="mt-1 text-xs text-gray-600 italic">
                {column.note}
              </div>
            )}
          </div>
        ))}
      </div>

      {table.note && (
        <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 italic border-t" style={{ flexShrink: 0 }}>
          {table.note}
        </div>
      )}

      {/* Removed global connection handles; we use per-column handles */}
    </div>
  );
});

TableNode.displayName = 'TableNode';
