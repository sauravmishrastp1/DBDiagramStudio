import { useEffect, useRef, useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { Play, FileCode, RefreshCcw, FolderDown } from 'lucide-react';
import { DatabaseSchema, Table } from '../types/schema';

interface SideEditorProps {
  width?: number; // px
}

export function SideEditor({ width = 420 }: SideEditorProps) {
  const { dbmlCode, parseAndSetSchema, schema } = useDiagramStore();
  const [localCode, setLocalCode] = useState(dbmlCode);
  const [live, setLive] = useState(true);
  const timerRef = useRef<number | null>(null);
  const [fontSize, setFontSize] = useState(14); // px

  // keep local in sync when external sample is loaded
  useEffect(() => {
    setLocalCode(dbmlCode);
  }, [dbmlCode]);

  const onChange = (value: string) => {
    setLocalCode(value);
    if (!live) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      parseAndSetSchema(value);
    }, 400);
  };

  const runOnce = () => parseAndSetSchema(localCode);

  // Convert a single table back to a minimal DBML string
  const renderTableDBML = (table: Table): string => {
    const header = `Table ${table.schema ? `${table.schema}.` : ''}${table.name} {`;
    const cols = table.columns.map((c) => {
      const attrs: string[] = [];
      if (c.primaryKey) attrs.push('pk');
      if (c.notNull) attrs.push('not null');
      if (c.unique) attrs.push('unique');
      if (c.autoIncrement) attrs.push('increment');
      if (c.default !== undefined && c.default !== null && c.default !== '') attrs.push(`default: ${c.default}`);
      if (c.note) attrs.push(`note: "${String(c.note).replace(/"/g, '\\"')}"`);
      const attrText = attrs.length ? ` [${attrs.join(', ')}]` : '';
      return `  ${c.name} ${c.type}${attrText}`;
    });
    const tableNote = table.note ? [`  Note: "${String(table.note).replace(/"/g, '\\"')}"`] : [];
    return [header, ...cols, ...tableNote, `}`].join('\n');
  };

  const saveToFolder = async () => {
    try {
      const w = window as any;
      if (!w.showDirectoryPicker) {
        alert('Your browser does not support folder saving. Use Chrome/Edge desktop.');
        return;
      }
      // Ensure latest parse before saving
      parseAndSetSchema(localCode);
      // Let state update microtask complete
      await new Promise((r) => setTimeout(r, 50));

      const dirHandle = await w.showDirectoryPicker();

      // Save full DBML
      const fullFile = await dirHandle.getFileHandle('schema.dbml', { create: true });
      const writableFull = await fullFile.createWritable();
      await writableFull.write(localCode || '');
      await writableFull.close();

      // Save per-table DBML
      const currentSchema: DatabaseSchema | undefined = schema;
      if (currentSchema && currentSchema.tables && currentSchema.tables.length) {
        for (const t of currentSchema.tables) {
          const safeName = `${t.name}.dbml`.replace(/[^a-zA-Z0-9._-]/g, '_');
          const fh = await dirHandle.getFileHandle(safeName, { create: true });
          const w = await fh.createWritable();
          await w.write(renderTableDBML(t));
          await w.close();
        }
      }
      alert('Saved DBML to folder (schema.dbml and per-table files).');
    } catch (err) {
      console.error('Save to folder failed:', err);
      alert('Failed to save. Please check permissions and try again.');
    }
  };

  return (
    <aside
      className="h-full border-r border-gray-200 bg-white flex flex-col"
      style={{ width }}
    >
      <div className="px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode size={18} />
          <span className="font-semibold">DBML Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={live}
              onChange={(e) => setLive(e.target.checked)}
            />
            Live
          </label>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFontSize((s) => Math.max(10, s - 1))}
              className="px-1.5 py-0.5 rounded bg-white/15 hover:bg-white/25"
              title="Smaller text"
            >
              A-
            </button>
            <span className="opacity-90 w-8 text-center">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(24, s + 1))}
              className="px-1.5 py-0.5 rounded bg-white/15 hover:bg-white/25"
              title="Larger text"
            >
              A+
            </button>
          </div>
          <button
            onClick={runOnce}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/15 hover:bg-white/25 text-white text-xs"
            title="Generate Diagram"
          >
            <Play size={14} />
            Run
          </button>
          <button
            onClick={saveToFolder}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/15 hover:bg-white/25 text-white text-xs"
            title="Save DBML to Folder"
          >
            <FolderDown size={14} />
            Save
          </button>
        </div>
      </div>

      <textarea
        value={localCode}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full p-3 font-mono outline-none resize-none"
        style={{ fontSize: `${fontSize}px`, lineHeight: '1.4' }}
        placeholder="Type DBML here..."
      />
    </aside>
  );
}


