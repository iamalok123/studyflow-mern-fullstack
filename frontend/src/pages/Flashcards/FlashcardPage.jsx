import React, { useState, useEffect } from 'react'
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
  const { id: documentId } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      console.error("Error fetching flashcards: ", error);
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

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
          <span className='text-sm font-medium text-neutral-600'>
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
    <div>
      <div className='mb-4'>
        <Link
          to={`/documents/${documentId}`}
          className='inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors'
        >
          <ArrowLeft size={20} />
          Back to Document
        </Link>
      </div>
      <PageHeader
        title="Flashcards"
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
          <p className='text-neutral-600 text-sm'>
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