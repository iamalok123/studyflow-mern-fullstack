import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BrainCircuit, Network, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';

const branchColors = [
  {
    line: '#3B82F6',
    border: 'border-blue-400',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  {
    line: '#22C55E',
    border: 'border-green-400',
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  {
    line: '#14B8A6',
    border: 'border-teal-400',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
  },
  {
    line: '#6366F1',
    border: 'border-indigo-400',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
];

const getColor = (index) => branchColors[index % branchColors.length];

const splitBranches = (children = []) => {
  const left = [];
  const right = [];

  children.forEach((child, index) => {
    if (index % 2 === 0) {
      left.push({ node: child, originalIndex: index });
    } else {
      right.push({ node: child, originalIndex: index });
    }
  });

  return { left, right };
};

const ChildList = ({ childrenNodes = [], color }) => {
  if (!childrenNodes.length) return null;

  return (
    <div className='mt-4 space-y-3'>
      {childrenNodes.map((child, index) => (
        <div key={`${child.title}-${index}`} className='relative flex items-start gap-2 text-left'>
          <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${color.dot} ring-4 ring-white`} />
          <div className='min-w-0 flex-1'>
            <p className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold leading-snug text-slate-800 shadow-sm'>
              {child.title}
            </p>
            {child.children?.length > 0 && (
              <div className='mt-2 space-y-2'>
                {child.children.slice(0, 3).map((leaf, leafIndex) => (
                  <p
                    key={`${leaf.title}-${leafIndex}`}
                    className='text-[11px] font-semibold leading-snug text-slate-500'
                  >
                    {leaf.title}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const BranchCard = ({ item, side, connectorRef }) => {
  const { node, originalIndex } = item;
  const color = getColor(originalIndex);
  const connectorAnchor = side === 'left' ? '-right-2.5' : '-left-2.5';

  return (
    <div className='relative w-75 text-left xl:w-85'>
      <div className={`relative rounded-2xl border-2 ${color.border} bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.07)]`}>
        <span
          ref={connectorRef}
          className={`absolute top-1/2 ${connectorAnchor} h-5 w-5 -translate-y-1/2 rounded-full border-4 border-white ${color.dot} shadow-sm`}
        />
        <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${color.bg} ${color.text}`}>
          <Network className='h-6 w-6' strokeWidth={2.4} />
        </div>
        <h4 className='text-xl font-black text-slate-950'>{node.title}</h4>
        <ChildList childrenNodes={node.children} color={color} />
      </div>
    </div>
  );
};

const getConnectorPath = ({ sourceX, sourceY, targetX, targetY, side }) => {
  const distance = Math.abs(sourceX - targetX);
  const curve = Math.max(130, distance * 0.45);

  if (side === 'left') {
    return `M ${sourceX} ${sourceY} C ${sourceX - curve} ${sourceY}, ${targetX + curve} ${targetY}, ${targetX} ${targetY}`;
  }

  return `M ${sourceX} ${sourceY} C ${sourceX + curve} ${sourceY}, ${targetX - curve} ${targetY}, ${targetX} ${targetY}`;
};

const ConnectorLayer = ({ paths, size }) => {
  if (!paths.length || !size.width || !size.height) return null;

  return (
    <svg
      className='pointer-events-none absolute inset-0 z-0 h-full w-full'
      viewBox={`0 0 ${size.width} ${size.height}`}
      preserveAspectRatio='none'
      aria-hidden='true'
    >
      {paths.map((path) => (
        <path
          key={path.key}
          d={path.d}
          fill='none'
          stroke={path.color}
          strokeLinecap='round'
          strokeWidth='12'
        />
      ))}
    </svg>
  );
};

const DesktopMindmap = ({ mindmap }) => {
  const { left, right } = useMemo(() => splitBranches(mindmap.children), [mindmap.children]);
  const branchCount = Math.max(left.length, right.length, 1);
  const canvasMinHeight = Math.max(900, branchCount * 360 + 360);
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const centerRef = useRef(null);
  const anchorRefs = useRef({ left: [], right: [] });
  const [connectorState, setConnectorState] = useState({ paths: [], size: { width: 0, height: 0 } });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    frame.scrollLeft = Math.max(0, (frame.scrollWidth - frame.clientWidth) / 2);
    frame.scrollTop = Math.max(0, (frame.scrollHeight - frame.clientHeight) / 2);
  }, [mindmap]);

  useLayoutEffect(() => {
    let frameId;

    const updateConnectors = () => {
      window.cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const center = centerRef.current;
        if (!canvas || !center) return;

        const canvasRect = canvas.getBoundingClientRect();
        const centerRect = center.getBoundingClientRect();
        const nextPaths = [];

        const addPath = (item, index, side) => {
          const anchor = anchorRefs.current[side][index];
          if (!anchor) return;

          const anchorRect = anchor.getBoundingClientRect();
          const sourceX = side === 'left'
            ? centerRect.left - canvasRect.left
            : centerRect.right - canvasRect.left;
          const sourceY = centerRect.top + centerRect.height / 2 - canvasRect.top;
          const targetX = anchorRect.left + anchorRect.width / 2 - canvasRect.left;
          const targetY = anchorRect.top + anchorRect.height / 2 - canvasRect.top;
          const color = getColor(item.originalIndex);

          nextPaths.push({
            key: `${side}-${item.originalIndex}`,
            color: color.line,
            d: getConnectorPath({ sourceX, sourceY, targetX, targetY, side }),
          });
        };

        left.forEach((item, index) => addPath(item, index, 'left'));
        right.forEach((item, index) => addPath(item, index, 'right'));

        setConnectorState({
          paths: nextPaths,
          size: {
            width: Math.max(1, canvasRect.width),
            height: Math.max(1, canvasRect.height),
          },
        });
      });
    };

    updateConnectors();

    const observedElements = [
      canvasRef.current,
      centerRef.current,
      ...anchorRefs.current.left,
      ...anchorRefs.current.right,
    ].filter(Boolean);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateConnectors) : null;

    observedElements.forEach((element) => observer?.observe(element));
    window.addEventListener('resize', updateConnectors);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
      window.removeEventListener('resize', updateConnectors);
    };
  }, [left, right]);

  return (
    <div className='hidden rounded-3xl border border-slate-200 bg-[#F7FAF9] p-3 lg:block'>
      <div ref={frameRef} className='h-[72vh] min-h-155 max-h-195 overflow-auto overscroll-contain rounded-[1.35rem] border border-slate-200 bg-white shadow-inner shadow-slate-200/50'>
        <div
          ref={canvasRef}
          className='relative min-w-370 px-14 py-16'
          style={{ minHeight: `${canvasMinHeight}px` }}
        >
          <ConnectorLayer paths={connectorState.paths} size={connectorState.size} />

          <div className='relative z-10 grid min-h-[inherit] grid-cols-[340px_1fr_340px] items-center gap-24 xl:grid-cols-[380px_1fr_380px]'>
            <div className='flex min-w-0 flex-col items-start justify-center gap-12'>
              {left.map((item, index) => (
                <BranchCard
                  key={`${item.node.title}-${index}`}
                  item={item}
                  side='left'
                  connectorRef={(element) => {
                    anchorRefs.current.left[index] = element;
                  }}
                />
              ))}
            </div>

            <div
              ref={centerRef}
              className='mx-auto w-64 rounded-3xl bg-[#63D0CE] px-6 py-5 text-center text-white shadow-[0_20px_56px_rgba(20,184,166,0.22)]'
            >
              <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20'>
                <BrainCircuit className='h-7 w-7' strokeWidth={2.4} />
              </div>
              <h3 className='text-3xl font-black leading-tight'>{mindmap.title}</h3>
            </div>

            <div className='flex min-w-0 flex-col items-end justify-center gap-12'>
              {right.map((item, index) => (
                <BranchCard
                  key={`${item.node.title}-${index}`}
                  item={item}
                  side='right'
                  connectorRef={(element) => {
                    anchorRefs.current.right[index] = element;
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileMindmap = ({ mindmap }) => {
  if (!mindmap?.title) return null;

  return (
    <div className='space-y-4 lg:hidden'>
      <div className='rounded-3xl bg-[#63D0CE] px-5 py-5 text-center text-white shadow-[0_18px_50px_rgba(20,184,166,0.18)]'>
        <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20'>
          <BrainCircuit className='h-7 w-7' strokeWidth={2.4} />
        </div>
        <h3 className='text-2xl font-black leading-tight'>{mindmap.title}</h3>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        {mindmap.children?.map((node, index) => {
          const color = getColor(index);
          return (
            <div key={`${node.title}-${index}`} className={`rounded-2xl border-2 ${color.border} bg-white p-4 shadow-sm`}>
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color.bg} ${color.text}`}>
                <Network className='h-5 w-5' strokeWidth={2.4} />
              </div>
              <h4 className='text-lg font-black text-slate-950'>{node.title}</h4>
              <ChildList childrenNodes={node.children} color={color} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FallbackMindmapNode = ({ node, level = 0 }) => {
  if (!node?.title) return null;

  return (
    <div className={level === 0 ? '' : 'ml-3 border-l border-slate-200 pl-3 sm:ml-4 sm:pl-4'}>
      <div
        className={`rounded-xl border px-4 py-3 text-sm font-bold shadow-sm ${level === 0
          ? 'border-slate-950 bg-slate-950 text-white'
          : 'border-slate-200 bg-white text-slate-900'
          }`}
      >
        {node.title}
      </div>

      {node.children?.length > 0 && (
        <div className='mt-3 space-y-3'>
          {node.children.map((child, index) => (
            <FallbackMindmapNode key={`${child.title}-${index}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const MindmapViewer = ({ documentId, initialMindmap = null }) => {
  const [mindmap, setMindmap] = useState(initialMindmap?.title ? initialMindmap : null);
  const [loading, setLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(!initialMindmap?.title);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!documentId) return;

    if (initialMindmap?.title) {
      setMindmap(initialMindmap);
      setSavedLoading(false);
      setError('');
      return;
    }

    let isMounted = true;

    const fetchSavedMindmap = async () => {
      setSavedLoading(true);
      setError('');

      try {
        const data = await aiService.getMindmap(documentId);
        if (isMounted) {
          setMindmap(data?.mindmap?.title ? data.mindmap : null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.error || err?.message || 'Failed to fetch saved mindmap');
        }
      } finally {
        if (isMounted) {
          setSavedLoading(false);
        }
      }
    };

    fetchSavedMindmap();

    return () => {
      isMounted = false;
    };
  }, [documentId, initialMindmap]);

  const handleGenerateMindmap = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await aiService.generateMindmap(documentId);
      setMindmap(data?.mindmap || null);
      toast.success('Mindmap generated successfully');
    } catch (err) {
      const message = err?.error || err?.message || 'Failed to generate mindmap';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='app-panel overflow-hidden'>
      <div className='flex flex-col gap-4 border-b border-slate-200/80 bg-[#EEF6F2]/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 app-icon-tile'>
            <BrainCircuit className='h-5 w-5 text-white' strokeWidth={2.4} />
          </div>
          <div>
            <h3 className='text-lg font-black text-slate-950'>Document Mindmap</h3>
            <p className='text-xs font-medium text-slate-600'>Generate a structured study map from this document</p>
          </div>
        </div>

        <button
          onClick={handleGenerateMindmap}
          disabled={loading || savedLoading}
          className='app-primary-action h-11 px-5'
        >
          {loading || savedLoading ? (
            <>
              <Spinner inline className='h-4 w-4 text-white' />
              {loading ? 'Generating...' : 'Loading...'}
            </>
          ) : mindmap ? (
            <>
              <RefreshCw className='h-4 w-4' strokeWidth={2.5} />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className='h-4 w-4' strokeWidth={2.5} />
              Generate Mindmap
            </>
          )}
        </button>
      </div>

      <div className='p-5 sm:p-6'>
        {(loading || savedLoading) && (
          <div className='flex min-h-64 flex-col items-center justify-center gap-3 text-center'>
            <Spinner />
            <p className='text-sm font-medium text-slate-600'>
              {loading ? 'Building your mindmap...' : 'Loading saved mindmap...'}
            </p>
          </div>
        )}

        {!loading && !savedLoading && error && (
          <div className='rounded-2xl border border-red-200 bg-red-50 p-5 text-center'>
            <p className='text-sm font-semibold text-red-700'>{error}</p>
            <button
              onClick={handleGenerateMindmap}
              className='app-secondary-action mt-4 h-10 px-5'
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !savedLoading && !error && !mindmap && (
          <div className='flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-[#EEF6F2]/60 px-5 text-center'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-emerald-600 shadow-sm'>
              <BrainCircuit className='h-8 w-8' strokeWidth={2} />
            </div>
            <h4 className='text-xl font-black text-slate-950'>No mindmap generated yet</h4>
            <p className='mt-2 max-w-md text-sm font-medium text-slate-600'>
              Create a compact concept tree to review this document at a glance.
            </p>
            <button
              onClick={handleGenerateMindmap}
              className='app-primary-action mt-5 h-11 px-5'
            >
              <Sparkles className='h-4 w-4' strokeWidth={2.5} />
              Generate Mindmap
            </button>
          </div>
        )}

        {!loading && !savedLoading && !error && mindmap && (
          <div className='overflow-x-hidden rounded-3xl border border-slate-200 bg-[#EEF6F2]/55 p-3 sm:p-5'>
            {mindmap.children?.length > 0 ? (
              <>
                <DesktopMindmap mindmap={mindmap} />
                <MobileMindmap mindmap={mindmap} />
              </>
            ) : (
              <FallbackMindmapNode node={mindmap} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MindmapViewer;
