import React, { useState } from 'react'
import { Star, RotateCcw } from 'lucide-react'

const difficultyColors = {
  Easy: 'bg-green-100 text-green-700 border border-green-200',
  Medium: 'bg-orange-100 text-orange-700 border border-orange-200',
  Hard: 'bg-red-100 text-red-700 border border-red-200',
};

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const difficultyClass = difficultyColors[flashcard?.difficulty] || difficultyColors.Medium;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  }
  return (
    <div className='min-h-[320px]' style={{ perspective: '1000px' }}>
      <div
        className='relative w-full min-h-[320px] transition-transform duration-500 transform-gpu cursor-pointer'
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
        onClick={handleFlip}
      >
        {/* Front of the card (Question) */}
        <div
          className='absolute inset-0 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8 flex flex-col justify-between'
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Star Button */}
          <div className='flex justify-between items-start'>
            <div className={`text-[10px] px-4 py-1 rounded font-medium uppercase ${difficultyClass}`}>
              {flashcard?.difficulty}
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
            <RotateCcw className='w-4 h-4 text-slate-400 animate-spin' strokeWidth={2} />
            <span className='text-xs text-slate-600'>Click to reveal answer</span>
          </div>
        </div>

        {/* Back of the card (Answer) */}
        <div
          className='absolute inset-0 bg-emerald-50/80 backdrop-blur-xl border border-emerald-200/60 rounded-2xl shadow-xl shadow-emerald-200/50 p-8 flex flex-col justify-between'
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Star Button */}
          <div className='flex justify-between items-start'>
            <div className={`text-[10px] px-4 py-1 rounded font-medium uppercase ${difficultyClass}`}>
              {flashcard?.difficulty}
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
            <RotateCcw className='w-4 h-4 text-emerald-400 animate-spin' strokeWidth={2} />
            <span className='text-xs text-emerald-500'>Click to flip back</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Flashcard