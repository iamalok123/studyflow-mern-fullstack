import { X } from 'lucide-react'
import React from 'react'

const Modal = ({ isOpen, onClose, title, children, panelClassName = 'max-w-lg p-8' }) => {
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6'>
      <div className='flex items-center justify-center min-h-full transition-opacity'>
        <div
          className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity'
          onClick={onClose}
        >
        </div>
        <div className={`relative w-full app-panel ${panelClassName} z-10 animate-in fade-in slide-in-from-bottom-4 duration-300`}>
          <button
            onClick={onClose}
            className='absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-300'
          >
            <X
              className='w-5 h-5'
              strokeWidth={2}
            />
          </button>

          <div className='mb-6 pr-8'>
            <h3 className='text-2xl font-black text-slate-950 tracking-tight'>{title}</h3>
          </div>

          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
