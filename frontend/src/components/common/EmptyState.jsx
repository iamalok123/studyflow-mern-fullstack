import React from 'react'
import { FileText, Plus } from 'lucide-react';

const EmptyState = ({ onActionClick, title, description, buttonText }) => {
    return (
        <div className='flex flex-col items-center justify-center py-16 px-6 text-center bg-linear-to-br from-slate-50/50 to-white border-2 border-dashed border-slate-300 rounded-3xl'>
            <div className='inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200/50 mb-4'>
                <FileText className='w-8 h-8 text-slate-400' />
            </div>
            <h3 className='text-xl font-semibold mb-2 text-slate-800'>{title}</h3>
            <p className='text-slate-500'>{description}</p>
            {onActionClick && buttonText && (
                <button
                    onClick={onActionClick}
                    className='group relative mt-4 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 overflow-hidden'
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