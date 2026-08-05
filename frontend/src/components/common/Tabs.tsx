import React from 'react'

const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className='relative rounded-2xl border border-slate-200/80 bg-white/80 p-1 shadow-sm'>
        <nav className='grid grid-cols-2 gap-1 min-[420px]:grid-cols-3 sm:flex sm:flex-wrap sm:overflow-visible'>
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => onChange(tab.name)}
              className={`relative min-w-0 rounded-xl px-2.5 py-2.5 text-center text-xs font-bold transition-all duration-200 sm:flex-1 sm:px-3 sm:text-sm md:px-5 ${activeTab === tab.name ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10' : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'}`}
            >
              <span className='relative z-10 block truncate'>
                {tab.label}
              </span>
              {activeTab === tab.name && (
                <div className='absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-emerald-400'></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className='py-6'>
        {tabs.map((tab) => {
          if (activeTab === tab.name) {
            return (
              <div
                key={tab.name}
                className='animate-in fade-in duration-300'
              >
                {tab.content}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  )
}

export default Tabs
