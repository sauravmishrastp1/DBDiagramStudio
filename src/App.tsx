// Main application component
import { useState, useEffect } from 'react';
import { DiagramCanvas } from './components/DiagramCanvas';
import { CodeEditor } from './components/CodeEditor';
import { SideEditor } from './components/SideEditor';
import { ImportModal } from './components/ImportModal';
import { useDiagramStore } from './store/diagramStore';
import { defaultSchema, ecommerceSample, blogSample, socialMediaSample } from './data/sampleSchemas';
import { Code2, Download, Share2, Settings, FileText, Database, Layers, Upload } from 'lucide-react';

function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const { parseAndSetSchema, dbmlCode } = useDiagramStore();

  useEffect(() => {
    // Load default schema on mount
    parseAndSetSchema(defaultSchema);
  }, []);

  const loadSample = (sample: string) => {
    parseAndSetSchema(sample);
    setShowSamples(false);
  };

  const exportDBML = () => {
    const blob = new Blob([dbmlCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schema.dbml';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white shadow-lg z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Database size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">DB Diagram Studio</h1>
                <p className="text-sm text-primary-100">Professional Database Schema Visualizer</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all font-medium shadow-md"
              >
                <Upload size={18} />
                Import SQL/DBML
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSamples(!showSamples)}
                  className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all font-medium"
                >
                  <Layers size={18} />
                  Samples
                </button>
                
                {showSamples && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl border-2 border-gray-200 overflow-hidden">
                    <div className="p-2 bg-gray-50 border-b font-semibold text-sm">
                      Load Sample Schema
                    </div>
                    <button
                      onClick={() => loadSample(ecommerceSample)}
                      className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors"
                    >
                      <div className="font-medium">E-Commerce</div>
                      <div className="text-xs text-gray-600">Users, Products, Orders</div>
                    </button>
                    <button
                      onClick={() => loadSample(blogSample)}
                      className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-t"
                    >
                      <div className="font-medium">Blog Platform</div>
                      <div className="text-xs text-gray-600">Posts, Comments, Tags</div>
                    </button>
                    <button
                      onClick={() => loadSample(socialMediaSample)}
                      className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-t"
                    >
                      <div className="font-medium">Social Media</div>
                      <div className="text-xs text-gray-600">Users, Posts, Follows</div>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsEditorOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all font-medium"
              >
                <Code2 size={18} />
                Edit Schema
              </button>

              <button
                onClick={exportDBML}
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all font-medium"
              >
                <FileText size={18} />
                Export DBML
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout: Side editor (left) + Canvas (right) */}
      <main className="flex-1 relative flex">
        <SideEditor width={420} />
        <div className="flex-1">
          <DiagramCanvas />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Zoom & Pan enabled</span>
            <span className="text-gray-400">|</span>
            <span>Drag tables to reposition</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by React Flow & Dagre</span>
          </div>
        </div>
      </footer>

      {/* Code Editor Modal */}
      <CodeEditor isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
      
      {/* Import Modal */}
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  );
}

export default App;
