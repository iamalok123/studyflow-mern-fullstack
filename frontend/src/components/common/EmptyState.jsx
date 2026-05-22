import React from 'react'
import { FileText, Plus } from 'lucide-react';

const EmptyState = ({ onActionClick, title, description, buttonText }) => {
  return (
    <div className='flex flex-col items-center justify-center py-16 px-6 text-center rounded-3xl border-2 border-dashed border-emerald-200 bg-[#EEF6F2]/60'>
      <div className='inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white border border-emerald-100 text-emerald-600 shadow-sm mb-4'>
        <FileText className='w-8 h-8' />
      </div>
      <h3 className='text-xl font-black mb-2 text-slate-950'>{title}</h3>
      <p className='text-slate-600 font-medium'>{description}</p>
      {onActionClick && buttonText && (
        <button
          onClick={onActionClick}
          className='app-primary-action mt-4 h-10'
        >
          <span className='relative z-10 flex items-center gap-2'>
            <Plus size={16} strokeWidth={2} />
            {buttonText}
          </span>
          <div className='absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300' />
        </button>
      )}
    </div>
  )
}

export default EmptyState
