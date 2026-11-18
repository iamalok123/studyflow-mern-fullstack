import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  getNodesBounds,
  getViewportForBounds
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  BrainCircuit,
  Network,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Download,
  FileImage,
  FileCode,
  FileJson,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Loader2
} from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import toast from 'react-hot-toast';
import { buildReactFlowGraph } from './mindmapLayout';

// --- Custom Nodes ---

const CenterNode = ({ data }: { data: any }) => {
  return (
    <div className='relative flex flex-col items-center mx-auto w-64 rounded-3xl bg-[#63D0CE] px-6 py-5 text-center text-white shadow-[0_20px_56px_rgba(20,184,166,0.22)]'>
      <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      
      <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20'>
        <BrainCircuit className='h-7 w-7' strokeWidth={2.4} />
      </div>
      <h3 className='text-3xl font-black leading-tight'>{data.label}</h3>
      
      {data.hasChildren && (
        <button 
          onClick={() => data.onToggleCollapse('root')}
          className="absolute -bottom-4 bg-white text-slate-800 rounded-full p-1 shadow-md border border-slate-200 hover:bg-slate-50 cursor-pointer"
        >
          {data.isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </div>
  );
};

const BranchNode = ({ data }: { data: any }) => {
  const { color, direction, depth, label, hasChildren, isCollapsed, id } = data;
  
  // Depth-based sizing
  const cardWidth = depth === 1 ? 'w-72' : depth === 2 ? 'w-60' : 'w-48';
  const textClass = depth === 1 ? 'text-xl font-black' : depth === 2 ? 'text-sm font-bold' : 'text-xs font-semibold text-slate-600';
  
  const sourcePosition = direction === 'left' ? Position.Left : Position.Right;
  const targetPosition = direction === 'left' ? Position.Right : Position.Left;

  return (
    <div className={`relative ${cardWidth} text-left`}>
      <Handle type="target" position={targetPosition} id={direction === 'left' ? 'right' : 'left'} style={{ opacity: 0 }} />
      <Handle type="source" position={sourcePosition} id={direction === 'left' ? 'left' : 'right'} style={{ opacity: 0 }} />

      <div className={`relative rounded-2xl border-2 ${color.border} bg-white ${depth === 1 ? 'p-4' : 'p-3'} shadow-sm`}>
        {depth === 1 && (
          <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color.bg} ${color.text}`}>
            <Network className='h-5 w-5' strokeWidth={2.4} />
          </div>
        )}
        
        <h4 className={`${textClass} text-slate-950`}>{label}</h4>
        
        {hasChildren && (
          <button 
            onClick={() => data.onToggleCollapse(id)}
            className={`absolute top-1/2 -translate-y-1/2 ${direction === 'left' ? '-left-3' : '-right-3'} bg-white ${color.text} rounded-full p-0.5 shadow-md border ${color.border} hover:bg-slate-50 z-10 cursor-pointer`}
          >
            {isCollapsed ? 
              (direction === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />) 
              : <ChevronDown size={16} />
            }
          </button>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  mindmapCenter: CenterNode,
  mindmapBranch: BranchNode,
};

const downloadFile = (dataUrlOrHref: string, filename: string) => {
  const a = document.createElement('a');
  a.setAttribute('download', filename);
  a.setAttribute('href', dataUrlOrHref);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// --- Main Canvas Component ---

const Flow: React.FC<{ mindmap: any }> = ({ mindmap }) => {
  const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set<string>());
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut, getNodes } = useReactFlow();

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const { nodes, edges } = useMemo(() => {
    const { nodes: rawNodes, edges: rawEdges } = buildReactFlowGraph(mindmap, collapsedNodeIds);
    
    // Inject the toggle function into all node data
    const nodesWithCallbacks = rawNodes.map((node: any) => ({
      ...node,
      data: {
        ...node.data,
        onToggleCollapse: toggleCollapse
      }
    }));
    
    return { nodes: nodesWithCallbacks, edges: rawEdges };
  }, [mindmap, collapsedNodeIds, toggleCollapse]);

  // Re-fit view when nodes change (e.g. on expand/collapse or initial load)
  useEffect(() => {
    const timeout = setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 50);
    return () => clearTimeout(timeout);
  }, [nodes.length, fitView]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExportMenuOpen]);

  // Keyboard Shortcuts for canvas (+, -, 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn({ duration: 300 });
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut({ duration: 300 });
      } else if (e.key === '0') {
        e.preventDefault();
        fitView({ padding: 0.2, duration: 500 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fitView, zoomIn, zoomOut]);

  // Export as PNG
  const handleExportPng = async () => {
    try {
      setIsExporting(true);
      const currentNodes = getNodes();
      if (!currentNodes || currentNodes.length === 0) {
        toast.error('No mindmap nodes found to export');
        return;
      }

      const flowViewport = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!flowViewport) {
        toast.error('Could not find mindmap viewport');
        return;
      }

      const bounds = getNodesBounds(currentNodes);
      const width = Math.max(1280, Math.round(bounds.width + 160));
      const height = Math.max(860, Math.round(bounds.height + 160));
      const viewport = getViewportForBounds(bounds, width, height, 0.15, 2, 0.1);

      const dataUrl = await toPng(flowViewport, {
        backgroundColor: '#F7FAF9',
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      const safeTitle = (mindmap?.title || 'mindmap').replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadFile(dataUrl, `${safeTitle}_mindmap.png`);
      toast.success('Mindmap exported as PNG image');
    } catch (err) {
      console.error('PNG export failed:', err);
      toast.error('Failed to export PNG image');
    } finally {
      setIsExporting(false);
      setIsExportMenuOpen(false);
    }
  };

  // Export as SVG
  const handleExportSvg = async () => {
    try {
      setIsExporting(true);
      const currentNodes = getNodes();
      if (!currentNodes || currentNodes.length === 0) {
        toast.error('No mindmap nodes found to export');
        return;
      }

      const flowViewport = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!flowViewport) {
        toast.error('Could not find mindmap viewport');
        return;
      }

      const bounds = getNodesBounds(currentNodes);
      const width = Math.max(1280, Math.round(bounds.width + 160));
      const height = Math.max(860, Math.round(bounds.height + 160));
      const viewport = getViewportForBounds(bounds, width, height, 0.15, 2, 0.1);

      const dataUrl = await toSvg(flowViewport, {
        backgroundColor: '#F7FAF9',
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      const safeTitle = (mindmap?.title || 'mindmap').replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadFile(dataUrl, `${safeTitle}_mindmap.svg`);
      toast.success('Mindmap exported as SVG vector');
    } catch (err) {
      console.error('SVG export failed:', err);
      toast.error('Failed to export SVG vector');
    } finally {
      setIsExporting(false);
      setIsExportMenuOpen(false);
    }
  };

  // Export as JSON
  const handleExportJson = () => {
    try {
      const jsonStr = JSON.stringify(mindmap, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const safeTitle = (mindmap?.title || 'mindmap').replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadFile(url, `${safeTitle}_mindmap.json`);
      URL.revokeObjectURL(url);
      toast.success('Mindmap concept data exported as JSON');
    } catch (err) {
      console.error('JSON export failed:', err);
      toast.error('Failed to export JSON');
    } finally {
      setIsExportMenuOpen(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Floating Canvas Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Export Dropdown */}
        <div className="relative" ref={exportDropdownRef}>
          <button
            type="button"
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 hover:text-emerald-700 hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Export Mindmap"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExporting}
                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileImage className="w-4 h-4 text-emerald-600" />
                <span>Export as PNG (Image)</span>
              </button>
              <button
                type="button"
                onClick={handleExportSvg}
                disabled={isExporting}
                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-sky-600" />
                <span>Export as SVG (Vector)</span>
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                disabled={isExporting}
                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-amber-600" />
                <span>Export as JSON (Data)</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Zoom / Fit Controls */}
        <div className="flex items-center bg-white border border-slate-200/90 rounded-xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => fitView({ padding: 0.2, duration: 400 })}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Center and fit to view (Key: 0)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button
            type="button"
            onClick={() => zoomIn({ duration: 250 })}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Zoom In (Key: +)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button
            type="button"
            onClick={() => zoomOut({ duration: 250 })}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Zoom Out (Key: -)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Keyboard Hint Pill (Bottom-left of canvas) */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-lg shadow-2xs text-[11px] text-slate-500 font-medium">
        <span>Shortcuts:</span>
        <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">+</kbd>
        <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">-</kbd>
        <span>Zoom</span>
        <span className="text-slate-300">•</span>
        <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">0</kbd>
        <span>Fit</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        className="bg-[#F7FAF9]"
      >
        <Background color="#ccc" gap={24} size={2} />
        <Controls className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden" />
        <MiniMap 
          nodeColor={(node: any) => {
            if (node.type === 'mindmapCenter') return '#63D0CE';
            return node.data?.color?.line || '#ccc';
          }}
          maskColor="rgba(247, 250, 249, 0.7)"
          className="rounded-xl border border-slate-200 shadow-sm hidden sm:block"
        />
      </ReactFlow>
    </div>
  );
};

interface MindmapCanvasProps {
  mindmap?: any;
  mindmapData?: any;
}

const MindmapCanvas: React.FC<MindmapCanvasProps> = ({ mindmap, mindmapData }) => {
  const targetMindmap = mindmap || mindmapData;
  return (
    <div className="relative w-full h-[70vh] min-h-125 max-h-200 rounded-2xl border border-slate-200 overflow-hidden shadow-inner shadow-slate-200/50">
      <ReactFlowProvider>
        <Flow mindmap={targetMindmap} />
      </ReactFlowProvider>
    </div>
  );
};

export default MindmapCanvas;
