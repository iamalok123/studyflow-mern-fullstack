import React from 'react'

const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className='w-full'>
      <div className='relative border-b-2 border-slate-100'>
        <nav className='flex'>
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => onChange(tab.name)}
              className={`relative pb-4 px-2.5 md:px-6 text-sm font-semibold transition-all duration-200 ${activeTab === tab.name ? 'text-emerald-600' : 'text-gray-800'}`}
            >
              <span className='relative z-10'>
                {tab.label}
              </span>
              {activeTab === tab.name && (
                <div className='absolute left-0 right-0 bottom-0 h-0.5 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/50'></div>
              )}
              {activeTab === tab.name && (
                <div className='absolute inset-0 bg-linear-to-b from-emerald-50/50 to-transparent rounded-t-xl -z-10'></div>
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