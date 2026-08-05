import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain
} from 'lucide-react'
import toast from 'react-hot-toast'
import moment from 'moment'

import flashcardService from '../../services/flashcardService'
import aiService from '../../services/aiService'
import Spinner from '../common/Spinner'
import Modal from '../common/Modal'
import EmptyState from '../common/EmptyState'
import GenerateQuantityModal from '../common/GenerateQuantityModal'
import FlashcardSetCard from './FlashcardSetCard'

const FlashcardManager = ({ documentId, onCountUpdate }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  const fetchFlashcardSets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data || []);
      if (onCountUpdate) onCountUpdate(response.data?.length || 0);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch flashcards');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchFlashcardSets();
    }
  }, [documentId, fetchFlashcardSets]);

  const handleOpenGenerateModal = () => {
    setIsGenerateModalOpen(true);
  };

  const handleConfirmGenerateFlashcards = async (count) => {
    try {
      setGenerating(true);
      await aiService.generateFlashcards(documentId, { count });
      await fetchFlashcardSets();
      toast.success("Flashcards generated successfully");
      setIsGenerateModalOpen(false);
    } catch (error) {
      toast.error(error.error || error.message || "Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRequest = (set) => {
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  }

  const handleConfirmDelete = async () => {
    try {
      if (!setToDelete) return;
      setDeleting(true);
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      toast.success("Flashcard set deleted successfully");
      fetchFlashcardSets();
      setIsDeleteModalOpen(false);
      setSetToDelete(null);
    } catch (error) {
      toast.error(error.message);

    } finally {
      setDeleting(false);
    }
  }

  const renderSetList = () => {
    if (loading) {
      return (
        <div className='flex items-center justify-center py-20'>
          <Spinner />
        </div>
      )
    }

    if (flashcardSets.length === 0) {
      return (
        <EmptyState
          title="No Flashcards Generated Yet"
          description="Generate flashcards from your document to start learning and reinforce your knowledge."
          icon={Brain}
        />
      )
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {flashcardSets.map((set) => (
          <FlashcardSetCard
            key={set._id}
            flashcardSet={set}
            onDelete={handleDeleteRequest}
            context="document"
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Document Flashcards</h3>
            <p className="text-xs text-slate-500">
              Study sets generated from this document
            </p>
          </div>
          <button
            onClick={handleOpenGenerateModal}
            disabled={generating}
            className='group app-primary-action h-11 px-4 text-sm'
          >
            {generating ? <Spinner size="sm" /> : <Plus size={16} />}
            Generate Flashcards
          </button>
        </div>

        {renderSetList()}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Flashcard Set?"
      >
        <div className='space-y-6'>
          <p className='text-sm text-slate-600'>
            Are you sure you want to delete this flashcard set? This action cannot be undone.
          </p>
          <div className='flex items-center justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className='app-secondary-action h-11 px-5'
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200'
            >
              {deleting ? (
                <span>
                  Deleting...
                </span>
              ) : (
                'Delete Set'
              )}
            </button>
          </div>
        </div>
      </Modal>

      <GenerateQuantityModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onConfirm={handleConfirmGenerateFlashcards}
        title="Generate Document Flashcards"
        description="Select how many flashcards you want to generate from this document."
        type="flashcard"
        defaultCount={5}
        generating={generating}
      />
    </>
  )
}

export default FlashcardManager
