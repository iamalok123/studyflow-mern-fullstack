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
      toast.error("Failed to generate summary.");
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
      toast.error("Failed to explain concept.");
    } finally {
      setLoadingAction(null);
    }
  };


  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className='px-6 py-5 border-b border-slate-200/60 bg-linear-to-r from-slate-50 to-white/50'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600'>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className='text-neutral-800 font-semibold text-lg'>AI Assistant</h3>
              <p className='text-neutral-600 text-xs'>Powered by advanced AI</p>
            </div>
          </div>
        </div>

        <div className='p-6 space-y-6'>
          {/* Generate Summary */}
          <div className='group p-5 bg-linear-to-br from-slate-50/50 to-white/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex-1'>
                <div className='flex items-start justify-start gap-2 mb-2'>
                  <div className='h-8 w-8 rounded-lg bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center'>
                    <BookOpen
                      className="w-4 h-4 text-blue-600"
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
                className='px-4 py-2 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
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
          <div className='group p-5 bg-linear-to-br from-slate-50/50 to-white/50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1'>
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
                  className="flex-1 px-4 h-11 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-300 focus:outline-none focus:border-emerald-500"
                  disabled={loadingAction === "explain"}
                />

                <button
                  type="submit"
                  disabled={loadingAction === "explain" || !concept.trim()}
                  className='shrink-0 px-5 h-11 bg-linear-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
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