import React, { useEffect, useState } from 'react';
import { BrainCircuit, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import MindmapCanvas from './MindmapCanvas';


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
              <MindmapCanvas mindmap={mindmap} />
            ) : (
              <div className='p-8 text-center text-slate-500 font-medium'>
                Mindmap structure is too simple to display visually.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MindmapViewer;
