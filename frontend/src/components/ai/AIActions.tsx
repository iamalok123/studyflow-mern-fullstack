import React, { useState } from 'react'
import { useParams } from 'react-router-dom';
import { Sparkles, BookOpen, Lightbulb } from 'lucide-react';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';
import MarkdownRenderer from '../common/MarkdownRenderer';
import Modal from '../common/Modal';


const AiActions = () => {
  const { id: documentId } = useParams();
  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const { summary } = await aiService.generateSummary(documentId);
      setModalTitle("Generated Summary");
      setModalContent(summary);
      setIsModalOpen(true);
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to generate summary.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.error("Please enter a concept to explain.");
      return;
    }
    setLoadingAction("explain");
    try {
      const { explanation } = await aiService.explainConcept(
        documentId,
        concept
      );
      setModalTitle(`Explanation of "${concept}"`);
      setModalContent(explanation);
      setIsModalOpen(true);
      setConcept("");
    } catch (error) {
      toast.error(error?.error || error?.message || "Failed to explain concept.");
    } finally {
      setLoadingAction(null);
    }
  };


  return (
    <>
      <div className="app-panel overflow-hidden">
        {/* Header */}
        <div className='px-6 py-5 border-b border-slate-200/80 bg-[#EEF6F2]/70'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 app-icon-tile'>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className='text-slate-950 font-black text-lg'>AI Assistant</h3>
              <p className='text-slate-600 text-xs font-medium'>Powered by advanced AI</p>
            </div>
          </div>
        </div>

        <div className='p-6 space-y-6'>
          {/* Generate Summary */}
          <div className='group app-soft-panel p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex-1'>
                <div className='flex items-start justify-start gap-2 mb-2'>
                  <div className='h-8 w-8 app-muted-icon-tile'>
                    <BookOpen
                      className="w-4 h-4 text-emerald-600"
                      strokeWidth={2}
                    />
                  </div>
                  <h4 className='font-semibold text-slate-600 leading-relaxed'>
                    Generate Summary
                  </h4>
                </div>
                <p className='text-sm text-slate-600 leading-relaxed'>
                  Get a concise summary of the document
                </p>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className='app-primary-action h-10 px-4'
              >
                {loadingAction === "summary" ? (
                  <span className='flex items-center gap-2'>
                    <div className='h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Loading...
                  </span>
                ) : (
                  <span>
                    Summarize
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Explain Concept */}
          <div className='group app-soft-panel p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white'>
            <form onSubmit={handleExplainConcept}>
              <div className='flex items-center gap-2 mb-3'>
                <div className='h-8 w-8 rounded-lg bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center'>
                  <Lightbulb
                    className="w-4 h-4 text-amber-600"
                    strokeWidth={2}
                  />
                </div>
                <h4 className='font-semibold text-slate-900'>
                  Explain a concept
                </h4>
              </div>
              <p className='text-sm text-slate-600 leading-relaxed mb-4'>
                Get a detailed explanation of any concept in the document
              </p>
              <div className='flex items-center gap-3'>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="e.g., 'React Hooks' or 'Promises'"
                  className="app-input flex-1 h-11 rounded-xl px-4"
                  disabled={loadingAction === "explain"}
                />

                <button
                  type="submit"
                  disabled={loadingAction === "explain" || !concept.trim()}
                  className='app-primary-action shrink-0 h-11 px-5'
                >
                  {loadingAction === "explain" ? (
                    <span className='flex items-center gap-2'>
                      <div className='h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Loading...
                    </span>
                  ) : (
                    <span>
                      Explain
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="max-h-[60vh] overflow-y-auto prose prose-sm max-w-none prose-slate">
          <MarkdownRenderer content={modalContent} />
        </div>
      </Modal>
    </>
  )
}

export default AiActions
