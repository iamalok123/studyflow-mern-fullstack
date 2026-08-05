import React, { useState, useEffect } from 'react';
import { Minus, Plus, Sparkles } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const MIN_LIMIT = 5;
const MAX_LIMIT = 20;

const GenerateQuantityModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Generate Study Material',
  description = 'Select the quantity of items to generate. The limit is between 5 and 20.',
  type = 'flashcard', // 'flashcard' | 'quiz'
  defaultCount = 5,
  generating = false,
}) => {
  const [count, setCount] = useState(() => {
    return Math.min(Math.max(defaultCount, MIN_LIMIT), MAX_LIMIT);
  });

  useEffect(() => {
    if (isOpen) {
      setCount(Math.min(Math.max(defaultCount, MIN_LIMIT), MAX_LIMIT));
    }
  }, [isOpen, defaultCount]);

  const handleDecrement = () => {
    setCount((prev) => Math.max(prev - 1, MIN_LIMIT));
  };

  const handleIncrement = () => {
    setCount((prev) => Math.min(prev + 1, MAX_LIMIT));
  };

  const handleConfirm = () => {
    const validCount = Math.min(Math.max(count, MIN_LIMIT), MAX_LIMIT);
    onConfirm(validCount);
  };

  const itemLabel = type === 'quiz' ? 'Questions' : 'Flashcards';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} panelClassName="max-w-md w-full mx-auto p-5 sm:p-8">
      <div className="space-y-6">
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          {description}
        </p>

        {/* Stepper Quantity Control */}
        <div className="app-soft-panel p-6 flex flex-col items-center justify-center space-y-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Number of {itemLabel}
          </span>

          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={count <= MIN_LIMIT || generating}
              className="h-12 w-12 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-700 shadow-sm transition-all duration-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Decrease quantity"
            >
              <Minus className="w-5 h-5" strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center min-w-17.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight select-none">
                {count}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {count === 1 ? itemLabel.slice(0, -1) : itemLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={count >= MAX_LIMIT || generating}
              className="h-12 w-12 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-700 shadow-sm transition-all duration-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Increase quantity"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
            <span>Range limit: 5 – 20 items</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={generating}
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 app-primary-action"
          >
            {generating ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {type === 'quiz' ? 'Quiz' : 'Cards'}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GenerateQuantityModal;
