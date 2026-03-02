import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, User, FileText, BrainCircuit, BookOpen, LogOut, X } from 'lucide-react'
import toast from 'react-hot-toast'

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    toast.success('Logged out successfully');
    logout();
  };

  const navLinks = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      text: 'Dashboard'
    },
    {
      path: '/documents',
      icon: FileText,
      text: 'Documents'
    },
    {
      path: '/flashcards',
      icon: BookOpen,
      text: 'Flashcards'
    },
    {
      path: '/profile',
      icon: User,
      text: 'Profile'
    }
  ]

  return (
    <div>
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
        aria-hidden="true"
      >

      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/90 backdrop-blur-lg border-r border-slate-200/60 z-50 md:relative md:w-64 md:shrink-0 md:flex md:flex-col md:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo and Close button for mobile */}
        <div className='flex items-center justify-between px-5 h-16 border-b border-slate-200/60'>
          <div className='flex items-center gap-3'>
            <img src="/logo1.svg" alt="logo" />
          </div>
          <button
            onClick={toggleSidebar}
            className='md:hidden text-slate-500 hover:text-slate-900'
            aria-label="Close Sidebar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className='flex-1 px-4 py-6 space-y-2 overflow-y-auto'>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={20}
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}
                  />
                  <span className='font-medium'>{link.text}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className='px-4 py-4 border-t border-slate-200/60'>
          <button
            onClick={handleLogout}
            className='group flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          >
            <LogOut
              size={20}
              strokeWidth={2.5}
              className='transition-transform duration-200 group-hover:scale-110'
            />
            <span className='font-medium'>Logout</span>
          </button>
        </div>
      </aside>
    </div>
  )
}

export default Sidebar
