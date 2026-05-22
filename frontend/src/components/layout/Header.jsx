import { Bell, Menu, User } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import React from 'react'

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className='sticky top-0 z-40 w-full h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl'>
      <div className='flex items-center justify-between h-full px-6'>
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className='md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-950 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent rounded-xl transition-all duration-200'
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>

        <div className='hidden md:block'></div>

        <div className='flex items-center gap-3'>
          <button className='relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-950 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent rounded-xl transition-all duration-200 group'>
            <Bell
              size={20}
              strokeWidth={2}
              className='group-hover:scale-110 transition-transform duration-200'
            />

            <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white'></span>
          </button>

          {/* User Profile */}
          <div className='flex items-center gap-3 pl-3 border-l border-slate-200/60'>
            <div className='flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-emerald-50/70 transition-colors duration-200 cursor-pointer group'>
              <div className='w-9 h-9 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center text-white shadow-md shadow-slate-950/15 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-200'>
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.username}
                    className='w-full h-full object-cover'
                    referrerPolicy='no-referrer'
                  />
                ) : (
                  <User size={18} strokeWidth={2.5} />
                )}
              </div>
              <div>
                <p className='text-sm font-semibold text-slate-900'>
                  {user?.username || 'User'}
                </p>
                <p className='text-xs text-slate-500'>
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
