import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Clock,
  Star,
  Keyboard,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Flame
} from 'lucide-react'
import toast from 'react-hot-toast'

import flashcardService from '../../services/flashcardService'
import aiService from '../../services/aiService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import GenerateQuantityModal from '../../components/common/GenerateQuantityModal'
import Flashcard from '../../components/flashcards/Flashcard'

type FilterMode = 'all' | 'due' | 'starred';

const FlashcardPage = () => {
  const { id: documentId, setId } = useParams();
  const location = useLocation();
  const fromContext = location.state?.from || 'sidebar';

  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

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

  // Filtered card list based on activeFilter
  const displayedCards = useMemo(() => {
    const now = Date.now();
    if (activeFilter === 'starred') {
      return flashcards.filter(c => c.isStarred);
    }
    if (activeFilter === 'due') {
      return flashcards.filter(c => !c.nextReviewDate || new Date(c.nextReviewDate).getTime() <= now);
    }
    return flashcards;
  }, [flashcards, activeFilter]);

  // Keep index within range when displayedCards changes
  useEffect(() => {
    setCurrentCardIndex((prev) => (prev >= displayedCards.length ? 0 : prev));
    setIsCardFlipped(false);
  }, [displayedCards.length]);

  const dueCount = useMemo(() => {
    const now = Date.now();
    return flashcards.filter(c => !c.nextReviewDate || new Date(c.nextReviewDate).getTime() <= now).length;
  }, [flashcards]);

  const starredCount = useMemo(() => {
    return flashcards.filter(c => c.isStarred).length;
  }, [flashcards]);

  const handleConfirmGenerateFlashcards = async (count: number) => {
    try {
      setGenerating(true);
      await aiService.generateFlashcards(documentId, { count });
      await fetchFlashcards();
      toast.success("Flashcards generated successfully");
      setIsGenerateModalOpen(false);
    } catch (error) {
      console.error("Error generating flashcards: ", error);
      toast.error("Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = useCallback(() => {
    if (displayedCards.length <= 1) return;
    setIsCardFlipped(false);
    setCurrentCardIndex(prev => (prev + 1) % displayedCards.length);
  }, [displayedCards.length]);

  const handlePreviousCard = useCallback(() => {
    if (displayedCards.length <= 1) return;
    setIsCardFlipped(false);
    setCurrentCardIndex(prev => (prev - 1 + displayedCards.length) % displayedCards.length);
  }, [displayedCards.length]);

  // SM-2 Review Rating Handler
  const handleRateReview = useCallback(async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const currentCard = displayedCards[currentCardIndex];
    if (!currentCard || isSubmittingReview) return;

    try {
      setIsSubmittingReview(true);
      const res = await flashcardService.reviewFlashcard(currentCard._id, {
        rating,
        cardIndex: currentCardIndex,
      });

      const updatedCard = res?.card || {
        ...currentCard,
        reviewCount: (currentCard.reviewCount || 0) + 1,
        lastReviewed: new Date(),
      };

      setFlashcards(prev =>
        prev.map(c => c._id === currentCard._id ? { ...c, ...updatedCard } : c)
      );

      const intervalDays = updatedCard.interval || 1;
      if (rating === 'again') {
        toast.success('Scheduled for repeat review today');
      } else {
        toast.success(`Next review in ${intervalDays} day${intervalDays > 1 ? 's' : ''}`);
      }

      // Flip back to question and move to next card
      setIsCardFlipped(false);
      if (displayedCards.length > 1) {
        setCurrentCardIndex(prev => (prev + 1) % displayedCards.length);
      }
    } catch (error) {
      console.error("Error submitting review: ", error);
      toast.error("Failed to record review");
    } finally {
      setIsSubmittingReview(false);
    }
  }, [displayedCards, currentCardIndex, isSubmittingReview]);

  const handleToggleStar = useCallback(async (cardId: string) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards(prevFlashcards =>
        prevFlashcards.map(card =>
          card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
        )
      );
      toast.success("Flashcard starred");
    } catch (error) {
      console.error("Error starring flashcard: ", error);
      toast.error("Failed to star flashcard");
    }
  }, []);

  const handleDeleteFlashcardSet = async () => {
    try {
      setDeleting(true);
      await flashcardService.deleteFlashcardSet(flashcardSets._id);
      setIsDeleteModalOpen(false);
      fetchFlashcards();
      toast.success("Flashcard set deleted");
    } catch (error) {
      console.error("Error deleting flashcard set: ", error);
      toast.error("Failed to delete flashcard set");
    } finally {
      setDeleting(false);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or a modal is open
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable ||
        isGenerateModalOpen ||
        isDeleteModalOpen
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsCardFlipped(prev => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowLeft' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handlePreviousCard();
      } else if (e.key === '1') {
        e.preventDefault();
        handleRateReview('again');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRateReview('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRateReview('good');
      } else if (e.key === '4') {
        e.preventDefault();
        handleRateReview('easy');
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        const currentCard = displayedCards[currentCardIndex];
        if (currentCard) {
          handleToggleStar(currentCard._id);
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNextCard,
    handlePreviousCard,
    handleRateReview,
    handleToggleStar,
    displayedCards,
    currentCardIndex,
    isGenerateModalOpen,
    isDeleteModalOpen,
  ]);

  // Interval preview calculation for SM-2 buttons
  const getIntervalPreview = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const currentCard = displayedCards[currentCardIndex];
    if (!currentCard) return '1d';
    const rep = currentCard.repetition || 0;
    const ef = currentCard.easeFactor || 2.5;
    const interval = currentCard.interval || 0;

    switch (rating) {
      case 'again':
        return '< 1d';
      case 'hard':
        return rep === 0 ? '1d' : `${Math.max(1, Math.round(interval * 1.2))}d`;
      case 'good':
        return rep === 0 ? '1d' : rep === 1 ? '6d' : `${Math.round(interval * ef)}d`;
      case 'easy':
        return rep === 0 ? '4d' : rep === 1 ? '7d' : `${Math.round(interval * (ef + 0.15))}d`;
    }
  };

  const renderFlashcardContent = () => {
    if (loading) {
      return (
        <div className='flex items-center justify-center py-20'>
          <Spinner />
        </div>
      );
    }

    if (flashcards.length === 0) {
      return (
        <EmptyState
          title="No Flashcards Yet"
          description="Generate flashcards from your document to start learning"
        />
      );
    }

    if (displayedCards.length === 0) {
      if (activeFilter === 'due') {
        return (
          <div className='flex flex-col items-center justify-center py-16 px-6 app-panel max-w-lg mx-auto text-center space-y-4'>
            <div className='w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm'>
              <CheckCircle2 className='w-9 h-9' />
            </div>
            <h3 className='text-xl font-bold text-slate-900'>All caught up!</h3>
            <p className='text-sm text-slate-600 max-w-sm'>
              You have reviewed all due cards in this set according to the SM-2 spaced repetition schedule. Great job!
            </p>
            <Button onClick={() => setActiveFilter('all')} variant='secondary'>
              Review All {flashcards.length} Cards
            </Button>
          </div>
        );
      }

      if (activeFilter === 'starred') {
        return (
          <div className='flex flex-col items-center justify-center py-16 px-6 app-panel max-w-lg mx-auto text-center space-y-4'>
            <div className='w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-sm'>
              <Star className='w-9 h-9' />
            </div>
            <h3 className='text-xl font-bold text-slate-900'>No starred cards</h3>
            <p className='text-sm text-slate-600 max-w-sm'>
              Press <kbd className='px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-xs'>S</kbd> or click the star on any card to save it here for fast revision.
            </p>
            <Button onClick={() => setActiveFilter('all')} variant='secondary'>
              View All Cards
            </Button>
          </div>
        );
      }
    }

    const currentCard = displayedCards[currentCardIndex];

    return (
      <div className='flex flex-col items-center space-y-6'>
        {/* Study Filter Tabs */}
        <div className='flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 shadow-xs'>
          <button
            onClick={() => { setActiveFilter('all'); setCurrentCardIndex(0); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Cards ({flashcards.length})
          </button>
          <button
            onClick={() => { setActiveFilter('due'); setCurrentCardIndex(0); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'due'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className='w-3.5 h-3.5 text-emerald-600' />
            Due for Review ({dueCount})
          </button>
          <button
            onClick={() => { setActiveFilter('starred'); setCurrentCardIndex(0); }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'starred'
                ? 'bg-white text-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className='w-3.5 h-3.5 text-amber-500 fill-amber-500' />
            Starred ({starredCount})
          </button>
        </div>

        {/* The Card */}
        <div className='w-full max-w-lg'>
          <Flashcard
            flashcard={currentCard}
            onToggleStar={handleToggleStar}
            isFlipped={isCardFlipped}
            onFlip={() => setIsCardFlipped(prev => !prev)}
          />
        </div>

        {/* SM-2 Spaced Repetition Rating Panel */}
        <div className='w-full max-w-lg bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs'>
          <div className='flex items-center justify-between mb-2.5 px-1'>
            <span className='text-xs font-bold uppercase tracking-wider text-slate-500'>
              Rate Recall (SM-2 Scheduler)
            </span>
            <span className='text-[11px] text-slate-400 font-medium'>
              {isCardFlipped ? 'Pick your recall grade' : 'Flip card to grade'}
            </span>
          </div>

          <div className='grid grid-cols-4 gap-2'>
            {/* 1. Again */}
            <button
              onClick={() => handleRateReview('again')}
              disabled={isSubmittingReview}
              className='flex flex-col items-center justify-center p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-all cursor-pointer group active:scale-95 disabled:opacity-50'
              title="Repeat review (< 1 day)"
            >
              <span className='text-xs font-black flex items-center gap-1'>
                Again
                <span className='text-[10px] font-mono px-1 rounded bg-white/70 text-rose-800 border border-rose-200'>1</span>
              </span>
              <span className='text-[10px] font-medium text-rose-600/80 mt-0.5'>
                {getIntervalPreview('again')}
              </span>
            </button>

            {/* 2. Hard */}
            <button
              onClick={() => handleRateReview('hard')}
              disabled={isSubmittingReview}
              className='flex flex-col items-center justify-center p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 transition-all cursor-pointer group active:scale-95 disabled:opacity-50'
              title="Difficult recall (1 day)"
            >
              <span className='text-xs font-black flex items-center gap-1'>
                Hard
                <span className='text-[10px] font-mono px-1 rounded bg-white/70 text-amber-900 border border-amber-200'>2</span>
              </span>
              <span className='text-[10px] font-medium text-amber-700/80 mt-0.5'>
                {getIntervalPreview('hard')}
              </span>
            </button>

            {/* 3. Good */}
            <button
              onClick={() => handleRateReview('good')}
              disabled={isSubmittingReview}
              className='flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-all cursor-pointer group active:scale-95 disabled:opacity-50'
              title="Good recall (recommended)"
            >
              <span className='text-xs font-black flex items-center gap-1'>
                Good
                <span className='text-[10px] font-mono px-1 rounded bg-white/70 text-emerald-900 border border-emerald-200'>3</span>
              </span>
              <span className='text-[10px] font-medium text-emerald-700/80 mt-0.5'>
                {getIntervalPreview('good')}
              </span>
            </button>

            {/* 4. Easy */}
            <button
              onClick={() => handleRateReview('easy')}
              disabled={isSubmittingReview}
              className='flex flex-col items-center justify-center p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 transition-all cursor-pointer group active:scale-95 disabled:opacity-50'
              title="Instant effortless recall"
            >
              <span className='text-xs font-black flex items-center gap-1'>
                Easy
                <span className='text-[10px] font-mono px-1 rounded bg-white/70 text-sky-900 border border-sky-200'>4</span>
              </span>
              <span className='text-[10px] font-medium text-sky-700/80 mt-0.5'>
                {getIntervalPreview('easy')}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className='flex items-center gap-4'>
          <Button
            onClick={handlePreviousCard}
            disabled={displayedCards.length <= 1}
            variant='secondary'
            title="Previous card (ArrowLeft or H)"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span className='app-pill normal-case tracking-normal font-semibold'>
            {currentCardIndex + 1} / {displayedCards.length}
          </span>
          <Button
            onClick={handleNextCard}
            disabled={displayedCards.length <= 1}
            title="Next card (ArrowRight or L)"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Keyboard Shortcuts Hint Pill */}
        <div className='flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500'>
          <span className='inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md font-mono text-[11px] border border-slate-200'>
            Space
          </span>
          <span>Flip</span>
          <span className='text-slate-300'>•</span>
          <span className='inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md font-mono text-[11px] border border-slate-200'>
            1-4
          </span>
          <span>SM-2 Grade</span>
          <span className='text-slate-300'>•</span>
          <span className='inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md font-mono text-[11px] border border-slate-200'>
            ← / →
          </span>
          <span>Navigate</span>
          <span className='text-slate-300'>•</span>
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            className='inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline'
          >
            <Keyboard size={13} />
            All Shortcuts (?)
          </button>
        </div>
      </div>
    );
  };

  const backTarget = fromContext === 'workspace' && flashcardSets?.workspaceId
    ? `/workspaces/${flashcardSets.workspaceId._id || flashcardSets.workspaceId}`
    : fromContext === 'document' && flashcardSets?.documentId
      ? `/documents/${flashcardSets.documentId._id || flashcardSets.documentId}`
      : '/flashcards';

  const backLabel = fromContext === 'workspace' ? 'Back to Workspace' : fromContext === 'document' ? 'Back to Document' : 'Back to Flashcards';

  return (
    <div className='app-page'>
      <div className='mb-4'>
        <Link
          to={backTarget}
          className='inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-emerald-700 transition-colors'
        >
          <ArrowLeft size={20} />
          {backLabel}
        </Link>
      </div>

      <PageHeader
        title={flashcardSets?.workspaceId?.title ? `Flashcards - ${flashcardSets.workspaceId.title}` : flashcardSets?.documentId?.title ? `Flashcards - ${flashcardSets.documentId.title}` : "Flashcards"}
      >
        <div className='flex gap-2'>
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            className='app-secondary-action h-10 px-3 flex items-center gap-1.5 text-xs font-semibold'
            title="Keyboard Shortcuts"
          >
            <Keyboard size={15} />
            <span className='hidden sm:inline'>Shortcuts</span>
          </button>
          {!loading &&
            (flashcards.length > 0 ? (
              <Button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={deleting}
                variant='secondary'
              >
                <Trash2 size={16} />
                Delete Set
              </Button>
            ) : (
              <Button
                onClick={() => setIsGenerateModalOpen(true)}
                disabled={generating}
              >
                {generating ? (
                  <Spinner inline className='h-4 w-4' />
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

      {/* Delete Confirmation Modal */}
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

      {/* Keyboard Shortcuts Modal */}
      <Modal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        title="⚡ Keyboard Shortcuts"
      >
        <div className='space-y-4 text-slate-700 text-sm'>
          <p className='text-xs text-slate-500'>
            Study faster and navigate smoothly with these desktop keyboard shortcuts:
          </p>

          <div className='divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden'>
            <div className='flex items-center justify-between p-3 bg-slate-50'>
              <span className='font-medium'>Flip Flashcard</span>
              <kbd className='px-2 py-1 rounded bg-white border border-slate-300 font-mono text-xs shadow-2xs'>Space</kbd>
            </div>
            <div className='flex items-center justify-between p-3'>
              <span className='font-medium'>Next Card</span>
              <div className='flex gap-1'>
                <kbd className='px-2 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-xs'>→</kbd>
                <kbd className='px-2 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-xs'>L</kbd>
              </div>
            </div>
            <div className='flex items-center justify-between p-3 bg-slate-50'>
              <span className='font-medium'>Previous Card</span>
              <div className='flex gap-1'>
                <kbd className='px-2 py-1 rounded bg-white border border-slate-300 font-mono text-xs'>←</kbd>
                <kbd className='px-2 py-1 rounded bg-white border border-slate-300 font-mono text-xs'>H</kbd>
              </div>
            </div>
            <div className='flex items-center justify-between p-3'>
              <span className='font-medium'>Grade: Again (&lt; 1 day)</span>
              <kbd className='px-2 py-1 rounded bg-rose-50 border border-rose-300 text-rose-800 font-mono text-xs font-bold'>1</kbd>
            </div>
            <div className='flex items-center justify-between p-3 bg-slate-50'>
              <span className='font-medium'>Grade: Hard (1 day)</span>
              <kbd className='px-2 py-1 rounded bg-amber-50 border border-amber-300 text-amber-800 font-mono text-xs font-bold'>2</kbd>
            </div>
            <div className='flex items-center justify-between p-3'>
              <span className='font-medium'>Grade: Good (~6 days)</span>
              <kbd className='px-2 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-xs font-bold'>3</kbd>
            </div>
            <div className='flex items-center justify-between p-3 bg-slate-50'>
              <span className='font-medium'>Grade: Easy (~15 days)</span>
              <kbd className='px-2 py-1 rounded bg-sky-50 border border-sky-300 text-sky-800 font-mono text-xs font-bold'>4</kbd>
            </div>
            <div className='flex items-center justify-between p-3'>
              <span className='font-medium'>Star / Bookmark Card</span>
              <kbd className='px-2 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-xs'>S</kbd>
            </div>
            <div className='flex items-center justify-between p-3 bg-slate-50'>
              <span className='font-medium'>Toggle Shortcuts Help</span>
              <kbd className='px-2 py-1 rounded bg-white border border-slate-300 font-mono text-xs'>?</kbd>
            </div>
          </div>

          <div className='flex justify-end pt-2'>
            <Button onClick={() => setIsShortcutsModalOpen(false)}>
              Got it
            </Button>
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
    </div>
  )
}

export default FlashcardPage