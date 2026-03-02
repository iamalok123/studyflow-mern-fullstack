import React, { useState, useEffect } from 'react'
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
import Flashcard from './Flashcard'

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  const fetchFlashcardSets = async () => {
    try {
      setLoading(true);
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data);
    } catch (error) {
      toast.error(error.message);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchFlashcardSets();
    }
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    try {
      setGenerating(true);
      await aiService.generateFlashcards(documentId);
      await fetchFlashcardSets();
      toast.success("Flashcards generated successfully");
    } catch (error) {
      toast.error(error.error || error.message || "Failed to generate flashcards");

    } finally {
      setGenerating(false);
    }
  }

  const handleNextCard = () => {
    if (selectedSet) {
      handleReview(currentCardIndex);
      setCurrentCardIndex(
        (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
      );
    }
  }
  const handlePreviousCard = () => {
    if (selectedSet) {
      handleReview(currentCardIndex);
      setCurrentCardIndex(
        (prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
      );
    }
  }

  const handleReview = async (index) => {
    const currentCard = selectedSet?.cards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      await fetchFlashcardSets();
      toast.success("Flashcard Reviewed!");
    } catch (error) {
      toast.error(error.message);

    }
  }

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      const updatedSets = flashcardSets.map(set => {
        if (set._id === selectedSet._id) {
          const updatedCards = set.cards.map((card) => {
            return card._id === cardId ? { ...card, isStarred: !card.isStarred } : card;
          });
          return { ...set, cards: updatedCards };
        }
        return set;
      });
      setFlashcardSets(updatedSets);
      setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));
      toast.success("Flashcard starred!");
    } catch (error) {
      toast.error(error.message);

    }
  }

  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
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

  const handleSelectedSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  }

  const renderFlashcardViewer = () => {
    const currentCard = selectedSet.cards[currentCardIndex];

    return (
      <div className='space-y-8'>
        {/* Back Button */}
        <button
          onClick={() => setSelectedSet(null)}
          className='group inline-flex items-center text-slate-600 gap-2 text-sm hover:text-emerald-600 transition-colors duration-200'
        >
          <ArrowLeft className='w-6 h-6 group-hover:translate-x-1 transition-transform duration-200' strokeWidth={2} />
          Back to Sets
        </button>

        {/* Flashcard Display*/}
        <div className='flex flex-col items-center space-y-8'>
          <div className='w-full max-w-2xl'>
            <Flashcard
              key={currentCard._id}
              flashcard={currentCard}
              onToggleStar={handleToggleStar}
            />
          </div>

          {/* Navigation Controls */}
          <div className='flex items-center gap-3 sm:gap-6'>
            <button
              onClick={handlePreviousCard}
              disabled={selectedSet.cards.length <= 1}
              className='group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 h-10 sm:h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-700'
            >
              <ChevronLeft className='w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200' strokeWidth={2.5} />
              <span className='hidden sm:inline'>Previous</span>
            </button>
            <div className='px-3 sm:px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 font-medium'>
              <span className='text-xs sm:text-sm font-semibold text-slate-700'>
                {currentCardIndex + 1}{" "}
                <span className='text-slate-400 font-normal'>/</span>{" "}
                {selectedSet.cards.length}
              </span>
            </div>
            <button
              onClick={handleNextCard}
              disabled={selectedSet.cards.length <= 1}
              className='group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 h-10 sm:h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-700'
            >
              <span className='hidden sm:inline'>Next</span>
              <ChevronRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200' strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    )
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
        <div className='flex flex-col items-center justify-center py-16'>
          <div className='inline-flex items-center justify-center h-16 w-16 rounded-xl bg-linear-to-r from-emerald-100 to-teal-100 mb-6'>
            <Brain className='w-8 h-8 text-emerald-600' />
          </div>
          <h3 className='text-xl font-semibold text-slate-900 mb-2'>No Flashcards Yet</h3>
          <p className='text-sm text-slate-600 mb-8 text-center max-w-sm'>Generate flashcards from your documents to start learning and reinforce your knowledge. </p>
          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className='group inline-flex items-center px-6 h-12  bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 gap-2 mx-auto'
          >
            {generating ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className='w-5 h-5 font-semibold' strokeWidth={2} />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      )
    }

    return (
      <div className='space-y-6'>
        {/* Header with generate button */}
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-semibold text-slate-900'>
              Your flashcard sets
            </h3>
            <p className='text-sm text-slate-600 mt-1'>
              {flashcardSets.length} {" "}
              {flashcardSets.length !== 1 ? 'sets' : 'set'} available
            </p>
          </div>
          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className='group inline-flex items-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300'
          >
            {generating ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>
                <Plus className='w-4 h-4' strokeWidth={2} />
                Generate New Set
              </>
            )}
          </button>
        </div>

        {/* Flashcard set grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {flashcardSets.map((set) => (
            <div
              key={set._id}
              onClick={() => handleSelectedSet(set)}
              className='group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200/60 hover:border-emerald-300 rounded-2xl shadow-xl shadow-slate-200/50 p-6 hover:shadow-2xl transition-all duration-200 cursor-pointer'
            >
              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteRequest(e, set)}
                className='absolute top-4 right-4 p-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-100 transition-all duration-200 opacity-0 group-hover:opacity-100'
              >
                <Trash2 className='w-4 h-4' strokeWidth={2} />
              </button>

              {/* Set Content */}
              <div className='space-y-4'>
                <div className='inline-flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-r from-emerald-100 to-teal-100'>
                  <Brain className='w-6 h-6 text-emerald-600' />
                </div>
                <div>
                  <h4 className='text-base font-semibold text-slate-900 mb-1'>
                    Flashcard Set
                  </h4>
                  <p className='text-xs font-medium text-slate-600 uppercase tracking-wide'>
                    Created {moment(set.createdAt).format('MMM D, YYYY')}
                  </p>
                </div>

                <div className='flex items-center gap-2 pt-2 border-t border-slate-100'>
                  <div className='px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg'>
                    <span className='text-sm font-semibold text-slate-700'>
                      {set.cards.length}{" "}
                      {set.cards.length !== 1 ? 'cards' : 'card'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8'>
        {selectedSet ? (
          renderFlashcardViewer()
        ) : (
          renderSetList()
        )}
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
              className='px-5 h-11 text-slate-100 hover:text-slate-200 bg-slate-700 hover:bg-slate-800 font-medium text-sm rounded-xl transition-all duration-200'
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
    </>
  )
}

export default FlashcardManager