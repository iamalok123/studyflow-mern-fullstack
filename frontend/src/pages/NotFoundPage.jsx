import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100'>
      <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30' />

      <div className='relative text-center px-6'>
        <div className='inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-amber-100 to-orange-100 shadow-lg shadow-amber-500/20 mb-6'>
          <AlertTriangle className='w-10 h-10 text-amber-600' strokeWidth={1.5} />
        </div>

        <h1 className='text-6xl font-bold bg-linear-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent mb-4'>
          404
        </h1>

        <h2 className='text-xl font-medium text-slate-900 tracking-tight mb-2'>
          Page Not Found
        </h2>

        <p className='text-slate-500 text-sm max-w-md mx-auto mb-8'>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className='flex items-center justify-center gap-3'>
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className='group inline-flex items-center gap-2 px-6 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-[0.98]'
          >
            <Home className='w-4 h-4' strokeWidth={2.5} />
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
          </Link>

          <button
            onClick={() => window.history.back()}
            className='inline-flex items-center gap-2 px-6 h-12 bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-[0.98]'
          >
            <ArrowLeft className='w-4 h-4' strokeWidth={2.5} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;