// Import modal for SQL and DBML
import { useState } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { sqlToDBML } from '../parser/sqlParser';
import { X, FileCode, Database, Upload } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [importType, setImportType] = useState<'sql' | 'dbml'>('sql');
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { parseAndSetSchema } = useDiagramStore();

  const handleImport = () => {
    try {
      setError(null);
      
      if (importType === 'sql') {
        // Convert SQL to DBML first
        const dbmlCode = sqlToDBML(inputText);
        parseAndSetSchema(dbmlCode);
      } else {
        // Direct DBML parsing
        parseAndSetSchema(inputText);
      }
      
      onClose();
      setInputText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import schema');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Read all files, concatenate contents in filename order
    const fileArray = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
    const readers = fileArray.map(file => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = reject;
      reader.readAsText(file);
    }));

    Promise.all(readers)
      .then(contents => {
        const combined = contents.join('\n\n');
        setInputText(combined);
      })
      .catch(() => setError('Failed to read files.'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <Upload size={24} />
            <h2 className="text-xl font-bold">Import Database Schema</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Type Selector */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setImportType('sql')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                importType === 'sql'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Database size={18} />
              SQL (CREATE TABLE)
            </button>
            <button
              onClick={() => setImportType('dbml')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                importType === 'dbml'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileCode size={18} />
              DBML
            </button>

            <div className="ml-auto flex gap-2">
              {/* Multiple files */}
              <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload size={18} />
                <span className="font-medium">Upload File(s)</span>
                <input
                  type="file"
                  accept=".sql,.dbml,.txt"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {/* Folder upload (Chromium-based browsers) */}
              <label className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" title="Upload a folder containing .sql files">
                <Upload size={18} />
                <span className="font-medium">Upload Folder</span>
                <input
                  type="file"
                  accept=".sql,.dbml,.txt"
                  // @ts-expect-error - non-standard but supported in Chromium
                  webkitdirectory="true"
                  directory="true"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
            placeholder={
              importType === 'sql'
                ? `Paste your SQL (supports multiple CREATE/ALTER statements).\nYou can also upload multiple .sql files or a whole folder.\n\nExample:\nCREATE TABLE users (...);\nALTER TABLE posts ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);`
                : `Paste your DBML code here...`
            }
            spellCheck={false}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p className="font-medium">Import Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-600">
            {importType === 'sql' 
              ? 'Supports MySQL, PostgreSQL, SQLite CREATE/ALTER statements. Upload multiple files or a folder.'
              : 'Use DBML syntax to define your schema'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors font-medium shadow-md"
            >
              <Upload size={18} />
              Import & Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
