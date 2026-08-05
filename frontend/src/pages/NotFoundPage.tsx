import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className='flex items-center justify-center min-h-screen app-bg'>
      <div className='relative text-center px-6'>
        <div className='inline-flex items-center justify-center w-20 h-20 rounded-2xl border border-lime-200 bg-lime-50 shadow-lg shadow-emerald-500/10 mb-6'>
          <AlertTriangle className='w-10 h-10 text-amber-600' strokeWidth={1.5} />
        </div>

        <h1 className='text-6xl font-black text-slate-950 mb-4'>
          404
        </h1>

        <h2 className='text-xl font-black text-slate-950 tracking-tight mb-2'>
          Page Not Found
        </h2>

        <p className='text-slate-500 text-sm max-w-md mx-auto mb-8'>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className='flex items-center justify-center gap-3'>
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className='app-primary-action h-12'
          >
            <Home className='w-4 h-4' strokeWidth={2.5} />
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
          </Link>

          <button
            onClick={() => window.history.back()}
            className='app-secondary-action h-12'
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
