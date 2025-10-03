// Main diagram canvas component using ReactFlow
import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Connection,
  MarkerType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TableNode } from './TableNode';
import { useDiagramStore } from '../store/diagramStore';
import { getLayoutedElements } from '../utils/layoutEngine';
import { RelationshipType } from '../types/schema';
import { Download, Layout, FileDown } from 'lucide-react';
import { toPng } from 'html-to-image';

const nodeTypes = {
  tableNode: TableNode,
};

export function DiagramCanvas() {
  const { schema } = useDiagramStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert schema to ReactFlow nodes and edges
  useEffect(() => {
    const flowNodes: Node[] = schema.tables.map((table) => ({
      id: table.id,
      type: 'tableNode',
      data: { table },
      position: { x: 0, y: 0 },
    }));

    // 1) Deduplicate exact/reversed duplicates by column pair
    const seen = new Set<string>();
    const uniqueRels = [] as typeof schema.relationships;
    for (const rel of schema.relationships) {
      const a = `${rel.fromTable}.${rel.fromColumn}`;
      const b = `${rel.toTable}.${rel.toColumn}`;
      const key = `${a}->${b}`;
      const rkey = `${b}->${a}`;
      if (seen.has(key) || seen.has(rkey)) continue;
      seen.add(key);
      uniqueRels.push(rel);
    }

    // 2) Build one edge PER relationship, anchored to exact columns (FK -> PK)
    const flowEdges: Edge[] = uniqueRels.map((rel) => {
      const rep = rel;

      let markerEnd = MarkerType.ArrowClosed;
      let markerStart = undefined as MarkerType | undefined;
      let labelPrefix = '';
      let edgeColor = '#0ea5e9';
      let strokeWidth = 2;

      switch (rep.type) {
        case RelationshipType.ONE_TO_ONE:
          labelPrefix = '1:1';
          edgeColor = '#10b981';
          break;
        case RelationshipType.ONE_TO_MANY:
          labelPrefix = '1:N';
          edgeColor = '#3b82f6';
          break;
        case RelationshipType.MANY_TO_ONE:
          labelPrefix = 'N:1';
          edgeColor = '#8b5cf6';
          break;
        case RelationshipType.MANY_TO_MANY:
          labelPrefix = 'N:N';
          edgeColor = '#f59e0b';
          markerStart = MarkerType.ArrowClosed;
          strokeWidth = 3;
          break;
      }

      const label = `${labelPrefix} (${rel.fromColumn}→${rel.toColumn})`;

      const id = `${rel.fromTable}.${rel.fromColumn}->${rel.toTable}.${rel.toColumn}`;

      return {
        id,
        source: rel.fromTable,
        target: rel.toTable,
        // point edges to per-column handles (exact column anchors)
        sourceHandle: `${rel.fromTable}.${rel.fromColumn}`,
        targetHandle: `${rel.toTable}.${rel.toColumn}`,
        label,
        markerEnd: { type: markerEnd, color: edgeColor, width: 8, height: 8 },
        markerStart: markerStart ? { type: markerStart, color: edgeColor, width: 8, height: 8 } : undefined,
        style: {
          stroke: edgeColor,
          strokeWidth,
          strokeDasharray: rep.type === RelationshipType.MANY_TO_MANY ? '5,5' : undefined,
        },
        labelStyle: {
          fill: edgeColor,
          fontWeight: 600,
          fontSize: 11,
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.95,
          stroke: edgeColor,
          strokeWidth: 1,
          rx: 4,
          ry: 4,
        },
        animated: true,
        type: 'smoothstep',
        pathOptions: { borderRadius: 8 },
      } as Edge;
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges,
      { direction: 'TB' }
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [schema, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connection:', params);
    },
    []
  );

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      { direction: 'TB' }
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);

  const onExportPNG = useCallback(() => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    const filter = (node: HTMLElement) => {
      const cls = (node.className || '').toString();
      if (cls.includes('react-flow__minimap')) return false;
      if (cls.includes('react-flow__controls')) return false;
      if (cls.includes('react-flow__panel')) return false;
      return true;
    };

    toPng(element, {
      backgroundColor: '#ffffff',
      width: element.scrollWidth || element.clientWidth,
      height: element.scrollHeight || element.clientHeight,
      pixelRatio: Math.max(2, Math.ceil(window.devicePixelRatio || 1) * 2),
      filter: filter as any,
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'database-diagram.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to export PNG:', err);
      });
  }, []);

  const onExportPDF = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    const scale = Math.max(2, Math.ceil(window.devicePixelRatio || 1) * 2);
    const filter = (node: HTMLElement) => {
      const cls = (node.className || '').toString();
      if (cls.includes('react-flow__minimap')) return false;
      if (cls.includes('react-flow__controls')) return false;
      if (cls.includes('react-flow__panel')) return false;
      return true;
    };
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      width: element.scrollWidth || element.clientWidth,
      height: element.scrollHeight || element.clientHeight,
      pixelRatio: scale,
      filter: filter as any,
    });

    // Open a print-friendly window and let user "Save as PDF"
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Database Diagram</title>
      <style>
        @page { size: A4 landscape; margin: 12mm; }
        html, body { height: 100%; }
        body { display: flex; align-items: center; justify-content: center; }
        /* Hide UI chrome in print window */
        .ui, .react-flow__controls, .react-flow__minimap, .react-flow__panel { display: none !important; }
        img { max-width: 100%; max-height: 100%; }
      </style>
    </head><body><img src="${dataUrl}" /></body></html>`);
    w.document.close();
    w.focus();
    // Give the browser a tick to render before printing
    setTimeout(() => { w.print(); }, 300);
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#0ea5e9', strokeWidth: 2 },
        }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls showInteractive={false} />
        <MiniMap 
          nodeColor={(node) => '#0ea5e9'}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="!bg-white !border-2 !border-gray-200"
        />
        
        <Panel position="top-right" className="space-y-2">
          <button
            onClick={onLayout}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-primary-500 text-primary-700 font-medium"
            title="Auto Layout"
          >
            <Layout size={18} />
            Auto Layout
          </button>
          
          <button
            onClick={onExportPNG}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-green-500 text-green-700 font-medium"
            title="Export as PNG"
          >
            <Download size={18} />
            Export PNG
          </button>
          
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-indigo-500 text-indigo-700 font-medium"
            title="Export as PDF (single page)"
          >
            <FileDown size={18} />
            Export PDF
          </button>
        </Panel>

        {/* Relationship Legend */}
        <Panel position="bottom-right" className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-4 max-w-xs">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            🔗 Relationship Types
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span className="text-gray-700">1:1 (One-to-One)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span className="text-gray-700">1:N (One-to-Many)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-purple-500"></div>
              <span className="text-gray-700">N:1 (Many-to-One)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-500" style={{borderTop: '2px dashed #f59e0b'}}></div>
              <span className="text-gray-700">N:N (Many-to-Many)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <span>🔑</span>
                <span>Primary Key</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔗</span>
                <span>Foreign Key</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
