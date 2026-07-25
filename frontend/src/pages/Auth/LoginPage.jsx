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
    if (loading) return;
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
    <div className='min-h-screen py-4 sm:py-6 flex items-center justify-center app-bg overflow-x-hidden'>
      <div className='relative px-4 sm:px-0 w-full max-w-lg mx-auto'>
        <div className='app-panel rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-100'>
          {/* Header */}
          <div className='text-center mb-5'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-950 shadow-md shadow-slate-950/15 mb-2.5'>
              <img src="/logo2.svg" alt="StudyFlow Logo" className="w-6 h-6" />
            </div>
            <h1 className='text-2xl font-black text-slate-950 tracking-tight mb-1'>
              Welcome back
            </h1>
            <p className='text-slate-500 text-xs font-medium'>
              Sign in to continue your AI-powered learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-3.5'>
            {/* Email Field */}
            <div className='space-y-1'>
              <label className='block text-[11px] font-bold text-slate-700 uppercase tracking-wider'>
                Email
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'email' ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <Mail className='w-4 h-4' strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="email"
                  className="app-input h-11 rounded-xl pl-10 pr-4 text-xs font-medium"
                  placeholder='you@example.com'
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='space-y-1'>
              <label className='block text-[11px] font-bold text-slate-700 uppercase tracking-wider'>
                Password
              </label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 ${focusedField === 'password' ? 'text-emerald-500' : 'text-slate-400'}`}>
                  <Lock className='w-4 h-4' strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="current-password"
                  className='app-input h-11 rounded-xl pl-10 pr-4 text-xs font-medium'
                  placeholder='••••••••'
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='rounded-xl bg-red-50 border border-red-200 p-2.5'>
                <p className='text-red-600 text-xs font-medium text-center'>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className='group app-primary-action relative w-full h-11 rounded-xl text-xs font-bold shadow-md cursor-pointer overflow-hidden mt-1'
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
              <div className='flex items-center gap-3 my-4'>
                <div className='flex-1 h-px bg-slate-200/70'></div>
                <span className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>or continue with</span>
                <div className='flex-1 h-px bg-slate-200/70'></div>
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
                  width={380}
                  text="signin_with"
                  theme="outline"
                />
              </div>
            </>
          )}

          {/* Footer Link */}
          <div className='mt-5 pt-3.5 border-t border-slate-100 text-center'>
            <p className='text-xs text-slate-500 font-medium'>
              Don't have an account?{" "}
              <Link to="/register" className='font-bold text-emerald-600 hover:text-emerald-700 transition-colors'>
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Terms */}
        <p className='text-center text-[11px] text-slate-400 mt-3 font-medium'>
          By continuing, you agree to our{" "}
          <Link to="/terms" className='font-semibold text-slate-600 hover:text-emerald-600 transition-colors'>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className='font-semibold text-slate-600 hover:text-emerald-600 transition-colors'>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage;
