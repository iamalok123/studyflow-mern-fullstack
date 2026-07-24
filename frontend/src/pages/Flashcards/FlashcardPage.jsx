import React, { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import flashcardService from '../../services/flashcardService'
import aiService from '../../services/aiService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Flashcard from '../../components/flashcards/Flashcard'

const FlashcardPage = () => {
  const { id: documentId, setId } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardSets, setFlashcardSets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      if (setId) {
        const response = await flashcardService.getFlashcardSetById(setId);
        setFlashcardSets(response.data);
        setFlashcards(response.data?.cards || []);
      } else if (documentId) {
        const response = await flashcardService.getFlashcardsForDocument(documentId);
        const setObj = response.data[0] || null;
        setFlashcardSets(setObj);
        setFlashcards(setObj?.cards || []);
      }
    } catch (error) {
      console.error("Error fetching flashcards: ", error);
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  }, [documentId, setId]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleGenerateFlashcards = async () => {
    try {
      setGenerating(true);
      await aiService.generateFlashcards(documentId);
      await fetchFlashcards();
      toast.success("Flashcards generated successfully");
    } catch (error) {
      console.error("Error generating flashcards: ", error);
      toast.error("Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    handleReview(currentCardIndex)
    setCurrentCardIndex(prevIndex => (prevIndex + 1) % flashcards.length);
  };

  const handlePreviousCard = () => {
    handleReview(currentCardIndex)
    setCurrentCardIndex(prevIndex => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleReview = async (cardIndex) => {
    const currentCard = flashcards[cardIndex];
    if (!currentCard) {
      return;
    }

    try {
      await flashcardService.reviewFlashcard(currentCard._id, cardIndex);
      toast.success("Flashcard reviewed successfully");
    } catch (error) {
      console.error("Error reviewing flashcard: ", error);
      toast.error("Failed to review flashcard");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards(prevFlashcards =>
        prevFlashcards.map(card =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
        )
      );
      toast.success("Flashcard starred successfully");
    } catch (error) {
      console.error("Error starring flashcard: ", error);
      toast.error("Failed to star flashcard");
    }
  };

  const handleDeleteFlashcardSet = async () => {
    try {
      setDeleting(true);
      await flashcardService.deleteFlashcardSet(flashcardSets._id);
      setIsDeleteModalOpen(false);
      fetchFlashcards();
      toast.success("Flashcard deleted successfully");
    } catch (error) {
      console.error("Error deleting flashcard: ", error);
      toast.error("Failed to delete flashcard");
    } finally {
      setDeleting(false);
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState
          title="No Flashcards Yet"
          description="Generate flashcards from your document to start learning"
        />
      );
    }

    const currentCard = flashcards[currentCardIndex];

    return (
      <div className='flex flex-col items-center space-y-6'>
        <div className='w-full max-w-md'>
          <Flashcard
            flashcard={currentCard}
            onToggleStar={handleToggleStar}
          />
        </div>
        <div className='flex items-center gap-4'>
          <Button
            onClick={handlePreviousCard}
            disabled={flashcards.length === 0}
            variant='secondary'
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span className='app-pill normal-case tracking-normal'>
            {currentCardIndex + 1} / {flashcards.length}
          </span>
          <Button
            onClick={handleNextCard}
            disabled={flashcards.length <= 1}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className='app-page'>
      <div className='mb-4'>
        {flashcardSets?.workspaceId ? (
          <Link
            to={`/workspaces/${flashcardSets.workspaceId._id || flashcardSets.workspaceId}`}
            className='inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-emerald-700 transition-colors'
          >
            <ArrowLeft size={20} />
            Back to Workspace
          </Link>
        ) : (
          <Link
            to={documentId ? `/documents/${documentId}` : '/flashcards'}
            className='inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-emerald-700 transition-colors'
          >
            <ArrowLeft size={20} />
            {documentId ? 'Back to Document' : 'Back to Flashcards'}
          </Link>
        )}
      </div>
      <PageHeader
        title={flashcardSets?.workspaceId?.title ? `Flashcards - ${flashcardSets.workspaceId.title}` : flashcardSets?.documentId?.title ? `Flashcards - ${flashcardSets.documentId.title}` : "Flashcards"}
      >
        <div className='flex gap-2'>
          {!loading &&
            (flashcards.length > 0 ? (
              <>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={deleting}
                >
                  <Trash2 size={16} />
                  Delete Set
                </Button>
              </>
            ) : (
              <Button
                onClick={handleGenerateFlashcards}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Spinner />
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Generate Flashcards
                  </>
                )}
              </Button>
            ))
          }
        </div>
      </PageHeader>

      {renderFlashcardContent()}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Flashcard Set"
      >
        <div className='space-y-4'>
          <p className='text-slate-600 text-sm'>
            Are you sure you want to delete all flashcards for this document? This action can't be undone.
          </p>

          <div className='flex justify-end gap-2 pt-2.5'>
            <Button
              type='button'
              onClick={() => setIsDeleteModalOpen(false)}
              variant='secondary'
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteFlashcardSet}
              disabled={deleting}
              className='bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500'
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default FlashcardPage
