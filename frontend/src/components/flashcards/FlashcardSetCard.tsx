import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, TrendingUp, Trash2 } from 'lucide-react';
import moment from 'moment';

interface FlashcardSetCardProps {
  flashcardSet: any;
  onDelete?: (flashcardSet: any) => void;
  context?: string;
}

const FlashcardSetCard: React.FC<FlashcardSetCardProps> = ({ flashcardSet, onDelete, context = 'sidebar' }) => {
  const navigate = useNavigate();

  const handleStudyNow = () => {
    navigate(`/flashcards/set/${flashcardSet._id}`, { state: { from: context } });
  };

  const title = flashcardSet?.documentId?.title || flashcardSet?.workspaceId?.title || flashcardSet?.title || 'Flashcard Set';
  const reviewedCount = flashcardSet.cards?.filter((card: any) => card.lastReviewed)?.length || 0;
  const totalCards = flashcardSet.cards?.length || 0;
  const progressPercentage = totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;

  return (
    <div className="group relative app-panel app-panel-hover overflow-hidden p-5 cursor-pointer flex flex-col justify-between">
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(flashcardSet);
          }}
          className='absolute top-3 right-3 p-2 bg-slate-100 sm:bg-transparent text-slate-500 hover:text-red-500 hover:bg-red-50 sm:hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-20'
        >
          <Trash2 className='h-4 w-4' strokeWidth={2} />
        </button>
      )}
      <div className="space-y-4">
        {/* Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 app-muted-icon-tile">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-900 line-clamp-2 mb-1">
              {title}
            </h3>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Created {moment(flashcardSet.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 pt-2">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-sm font-semibold text-slate-700">
              {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
            </span>
          </div>
          {reviewedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
              <span className="text-sm font-semibold text-emerald-700">
                {progressPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalCards > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                Progress
              </span>
              <span className="text-xs font-medium text-slate-700">
                {reviewedCount}/{totalCards} reviewed
              </span>
            </div>
            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Study Button */}
      <div className='mt-6 pt-4 border-t border-slate-100'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStudyNow();
          }}
          className="group/btn app-primary-action relative w-full h-11 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            Study Now
          </span>

          <div className='absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700' />
        </button>
      </div>
    </div>
  );
};

export default FlashcardSetCard;
