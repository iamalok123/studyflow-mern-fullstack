import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import authService from '../../services/authService'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      login(user, token);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      setError(error.error || error.message || 'Login failed. Please check your credentials.');
      toast.error(error.error || error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const response = await authService.googleLogin(credentialResponse.credential);
      const { token, user } = response.data;
      login(user, token);
      toast.success('Logged in with Google!');
      navigate('/dashboard');
    } catch (error) {
      setError(error.error || error.message || 'Google login failed.');
      toast.error(error.error || error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className='flex items-center justify-center min-h-screen app-bg'>

      <div className='relative px-6  w-full max-w-md'>
        <div className='app-panel rounded-3xl p-10'>
          {/* Header */}
          <div className='text-center mb-10'>
            <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-950 shadow-lg shadow-slate-950/15 mb-4'>
              <img src="/logo2.svg" alt="logo2" />
            </div>
            <h1 className='text-2xl font-black text-slate-950 tracking-tight mb-2'>
              Welcome back
            </h1>
            <p className='text-slate-500 text-sm'>
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Email Field */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Email
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'email' ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <Mail className='w-5 h-5' strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="email"
                  className="app-input h-12 rounded-xl pl-12 pr-4"
                  placeholder='you@example.com'
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Password
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'password' ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <Lock className='w-5 h-5' strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="current-password"
                  className='app-input h-12 rounded-xl pl-12 pr-4'
                  placeholder='••••••••'
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='rounded-xl bg-red-50 border border-red-200 p-3'>
                <p className='text-red-600 text-xs font-medium text-center'>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className='group app-primary-action relative w-full h-12 overflow-hidden'
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-200' strokeWidth={2.5} />
                  </>
                )}
              </span>

              <div className='absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
            </button>
          </form>

          {googleEnabled && (
            <>
              <div className='flex items-center gap-3 my-6'>
                <div className='flex-1 h-px bg-slate-200/60'></div>
                <span className='text-xs font-medium text-slate-400 uppercase tracking-wide'>or continue with</span>
                <div className='flex-1 h-px bg-slate-200/60'></div>
              </div>

              <div className='flex justify-center'>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError('Google sign-in failed. Please try again.');
                    toast.error('Google sign-in failed');
                  }}
                  shape="rectangular"
                  size="large"
                  width={350}
                  text="signin_with"
                  theme="outline"
                />
              </div>
            </>
          )}

          {/* Footer */}
          <div className='mt-8 pt-6 border-t border-slate-200/60'>
            <p className='text-center text-sm text-slate-500'>
              Don't have an account?{" "}
              <Link to="/register" className='font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-700'>
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Subtle footer text */}
        <p className='text-center text-xs text-slate-400 mt-6'>
          By continuing, you agree to our{" "}
          <Link to="/terms" className='font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-700'>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className='font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-700'>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage;
