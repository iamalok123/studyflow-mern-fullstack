import React, { useState } from 'react'
import { Star, RotateCcw, Clock, Zap } from 'lucide-react'

const difficultyColors: Record<string, string> = {
  Easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Medium: 'bg-lime-50 text-lime-800 border border-lime-200',
  Hard: 'bg-red-100 text-red-700 border border-red-200',
};

interface FlashcardProps {
  flashcard: any;
  onToggleStar: (cardId: string) => void;
  isFlipped?: boolean;
  onFlip?: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ flashcard, onToggleStar, isFlipped: controlledFlipped, onFlip }) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;
  const difficultyClass = difficultyColors[flashcard?.difficulty] || difficultyColors.Medium;

  const handleFlip = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  const intervalLabel = flashcard?.interval
    ? `${flashcard.interval}d interval`
    : flashcard?.reviewCount > 0
    ? 'Reviewed'
    : 'New';
  return (
    <div className='min-h-80' style={{ perspective: '1000px' }}>
      <div
        className='relative w-full min-h-80 transition-transform duration-500 transform-gpu cursor-pointer'
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
        onClick={handleFlip}
      >
        {/* Front of the card (Question) */}
        <div
          className='absolute inset-0 app-panel p-8 flex flex-col justify-between'
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Header Row */}
          <div className='flex justify-between items-start'>
            <div className='flex items-center gap-1.5'>
              <div className={`text-[10px] px-3 py-1 rounded font-medium uppercase ${difficultyClass}`}>
                {flashcard?.difficulty}
              </div>
              {flashcard?.interval !== undefined && flashcard?.interval > 0 && (
                <div className='text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1'>
                  <Clock className='w-3 h-3' />
                  {flashcard.interval}d
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id)
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${flashcard.isStarred ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-400'}`}
            >
              <Star
                className='w-6 h-6'
                fill={flashcard.isStarred ? 'currentColor' : 'none'}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Question Content */}
          <div className='text-center'>
            <p className='text-lg font-semibold text-slate-900 leading-relaxed'>
              {flashcard.question}
            </p>
          </div>

          {/* Flip Indicator */}
          <div className='flex items-center justify-center gap-2'>
            <RotateCcw className='w-4 h-4 text-slate-400' strokeWidth={2} />
            <span className='text-xs text-slate-600'>Click to reveal answer</span>
          </div>
        </div>

        {/* Back of the card (Answer) */}
        <div
          className='absolute inset-0 rounded-2xl border border-emerald-200 bg-[#EEF6F2]/95 shadow-[0_24px_70px_rgba(16,185,129,0.12)] backdrop-blur p-8 flex flex-col justify-between'
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Header Row */}
          <div className='flex justify-between items-start'>
            <div className='flex items-center gap-1.5'>
              <div className={`text-[10px] px-3 py-1 rounded font-medium uppercase ${difficultyClass}`}>
                {flashcard?.difficulty}
              </div>
              {flashcard?.interval !== undefined && flashcard?.interval > 0 && (
                <div className='text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1'>
                  <Clock className='w-3 h-3' />
                  {flashcard.interval}d
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id)
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${flashcard.isStarred ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-400'}`}
            >
              <Star
                className='w-6 h-6'
                fill={flashcard.isStarred ? 'currentColor' : 'none'}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Answer Content */}
          <div className='text-center'>
            <p className='text-lg font-semibold text-slate-900 leading-relaxed'>
              {flashcard.answer}
            </p>
          </div>

          {/* Flip Indicator */}
          <div className='flex items-center justify-center gap-2'>
            <RotateCcw className='w-4 h-4 text-emerald-400' strokeWidth={2} />
            <span className='text-xs text-emerald-500'>Click to flip back</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Flashcard
