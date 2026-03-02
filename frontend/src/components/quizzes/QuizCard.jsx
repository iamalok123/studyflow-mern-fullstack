import React from 'react'
import { Link } from 'react-router-dom'
import { Play, BarChart2, Trash2, Award } from 'lucide-react';
import moment from 'moment';

const QuizCard = ({ quiz, onDelete }) => {
  return (
    <div className='group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 transition-all duration-200 rounded-2xl p-4 hover:shadow-lg hover:shadow-emerald-500/20 flex flex-col justify-between'>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(quiz);
        }}
        className='absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100'
      >
        <Trash2 className='h-4 w-4' strokeWidth={2} />
      </button>
      <div className='space-y-4'>
        {/* Status Badge */}
        <div className='inline-flex items-center gap-1.5 py-1 rounded-lg text-xs font-semibold'>
          <div className='flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg'>
            <Award className='w-3.5 h-3.5 text-emerald-600' strokeWidth={2.5} />
            <span className='text-sm font-semibold text-emerald-700'>
              Score: {quiz?.score}
            </span>
          </div>
        </div>

        <div>
          <h3 className='text-base font-semibold text-slate-900 mb-1 line-clamp-2'>
            {quiz?.title || `Quiz - ${moment(quiz?.createdAt).format('MMM DD, YYYY')}`}
          </h3>
          <p className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
            Created {moment(quiz?.createdAt).format('MMM DD, YYYY')}
          </p>
        </div>

        {/* Quiz Info */}
        <div className='flex items-center gap-3 pt-2 border-t border-slate-200'>
          <div className='px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg'>
            <span className='text-sm font-semibold text-slate-700'>
              {quiz.questions.length} {" "}
              {quiz.questions.length === 1 ? 'Question' : 'Questions'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='mt-2 pt-4 border-t border-slate-100'>
        {quiz?.userAnswers?.length > 0 ? (
          <Link to={`/quizzes/${quiz._id}/results`} className='flex-1'>
            <button
              className='group/btn w-full inline-flex items-center justify-center gap-2 h-11 bg-slate-200 hover:bg-slate-300 hover:text-slate-900 text-slate-900 text-sm font-semibold rounded-xl transition-all duration-300 active:scale-95 cursor-pointer'
            >
              <BarChart2 className='h-4 w-4' strokeWidth={2.5} />
              View Results
            </button>
          </Link>
        ) : (
          <Link to={`/quizzes/${quiz._id}`} className='flex-1'>
            <button
              className='group/btn relative w-full h-11 bg-linear-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-emerald-500/30 active:scale-95 cursor-pointer overflow-hidden'
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                <Play className='h-4 w-4' strokeWidth={2.5} />
                Start Quiz
              </span>
              <div className='absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300' />
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default QuizCard