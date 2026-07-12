import React, { useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BrainCircuit, Network, ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react';
import { buildReactFlowGraph } from './mindmapLayout';

// --- Custom Nodes ---

const CenterNode = ({ data }) => {
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
          className="absolute -bottom-4 bg-white text-slate-800 rounded-full p-1 shadow-md border border-slate-200 hover:bg-slate-50"
        >
          {data.isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
    </div>
  );
};

const BranchNode = ({ data }) => {
  const { color, direction, depth, label, hasChildren, isCollapsed, id } = data;
  
  // Depth-based sizing
  const isLeaf = depth >= 3 || !hasChildren;
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
            className={`absolute top-1/2 -translate-y-1/2 ${direction === 'left' ? '-left-3' : '-right-3'} bg-white ${color.text} rounded-full p-0.5 shadow-md border ${color.border} hover:bg-slate-50 z-10`}
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

// --- Main Canvas Component ---

const Flow = ({ mindmap }) => {
  const [collapsedNodeIds, setCollapsedNodeIds] = React.useState(new Set());
  const { fitView } = useReactFlow();

  const toggleCollapse = useCallback((nodeId) => {
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
    const nodesWithCallbacks = rawNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onToggleCollapse: toggleCollapse
      }
    }));
    
    return { nodes: nodesWithCallbacks, edges: rawEdges };
  }, [mindmap, collapsedNodeIds, toggleCollapse]);

  // Re-fit view when nodes change (e.g. on expand/collapse or initial load), but debounced to allow render
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 50);
    return () => clearTimeout(timeout);
  }, [nodes.length, fitView]);

  return (
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
        nodeColor={(node) => {
          if (node.type === 'mindmapCenter') return '#63D0CE';
          return node.data?.color?.line || '#ccc';
        }}
        maskColor="rgba(247, 250, 249, 0.7)"
        className="rounded-xl border border-slate-200 shadow-sm hidden sm:block"
      />
    </ReactFlow>
  );
};

const MindmapCanvas = ({ mindmap }) => {
  return (
    <div className="w-full h-[70vh] min-h-[500px] max-h-[800px] rounded-2xl border border-slate-200 overflow-hidden shadow-inner shadow-slate-200/50">
      <ReactFlowProvider>
        <Flow mindmap={mindmap} />
      </ReactFlowProvider>
    </div>
  );
};

export default MindmapCanvas;
