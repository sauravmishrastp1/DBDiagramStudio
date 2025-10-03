// Code editor component for DBML input
import { useState, useEffect } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { Play, Code2, X, FileCode } from 'lucide-react';

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CodeEditor({ isOpen, onClose }: CodeEditorProps) {
  const { dbmlCode, parseAndSetSchema } = useDiagramStore();
  const [localCode, setLocalCode] = useState(dbmlCode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalCode(dbmlCode);
  }, [dbmlCode]);

  const handleParse = () => {
    try {
      parseAndSetSchema(localCode);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse DBML');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <FileCode size={24} />
            <h2 className="text-xl font-bold">DBML Schema Editor</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <textarea
            value={localCode}
            onChange={(e) => setLocalCode(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
            placeholder="Enter your DBML schema here..."
            spellCheck={false}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p className="font-medium">Parse Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-600">
            Use DBML syntax to define your database schema
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleParse}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors font-medium shadow-md"
            >
              <Play size={18} />
              Generate Diagram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
