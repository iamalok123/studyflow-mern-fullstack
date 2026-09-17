import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import authService from '../../services/authService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const isGoogleUser = user?.authProvider === 'google' || Boolean(user?.googleId);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        const data = response.data;
        setProfileData({
          username: data.username || '',
          email: data.email || '',
        });
        if (data) {
          updateUser(data);
        }
      } catch (error) {
        toast.error(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileData.username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const response = await authService.updateProfile({ username: profileData.username });
      updateUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='min-h-full'>
      <div className='app-page max-w-3xl'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-black text-slate-950 tracking-tight mb-2'>
            Profile Settings
          </h1>
          <p className='text-slate-500 text-sm'>
            Manage your account information and security
          </p>
        </div>

        {/* Profile Card */}
        <div className='app-panel p-8 mb-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-10 w-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-lg shadow-slate-950/15 shrink-0'>
              <User className='w-5 h-5 text-emerald-400' strokeWidth={2} />
            </div>
            <div>
              <h3 className='text-lg font-bold text-slate-900 tracking-tight'>Personal Information</h3>
              <p className='text-xs text-slate-500'>Update your username and profile details</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className='space-y-5'>
            {/* Username */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Username
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400'>
                  <User className='w-5 h-5' strokeWidth={2} />
                </div>
                <input
                  type='text'
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  className='app-input h-12 rounded-xl pl-12 pr-4'
                  placeholder='Your username'
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Email
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400'>
                  <Mail className='w-5 h-5' strokeWidth={2} />
                </div>
                <input
                  type='email'
                  value={profileData.email}
                  readOnly
                  className='w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl bg-slate-100/70 text-slate-500 text-sm font-medium cursor-not-allowed'
                />
              </div>
              <p className='text-xs text-slate-400 pl-1'>Email cannot be changed</p>
            </div>

            {/* Save Button */}
            <button
              type='submit'
              disabled={saving}
              className='group app-primary-action relative w-full h-12 overflow-hidden'
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                {saving ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4' strokeWidth={2.5} />
                    <span>Save Changes</span>
                  </>
                )}
              </span>
              <div className='absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
            </button>
          </form>
        </div>

        {/* Security & Password Card */}
        <div className='app-panel p-8'>
          {isGoogleUser ? (
            <div>
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-lg shadow-slate-950/15 shrink-0'>
                    <ShieldCheck className='w-5 h-5 text-emerald-400' strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className='text-lg font-bold text-slate-900 tracking-tight'>Authentication & Security</h3>
                    <p className='text-xs text-slate-500'>Account secured via Single Sign-On</p>
                  </div>
                </div>
                <span className='app-pill text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-200/80'>
                  Google Account
                </span>
              </div>

              <div className='rounded-2xl border border-emerald-200/70 bg-linear-to-br from-[#EEF6F2]/80 via-white to-[#F4F9F6] p-6'>
                <div className='flex items-start gap-4'>
                  <div className='w-11 h-11 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0 mt-0.5'>
                    <svg className='w-5 h-5' viewBox='0 0 24 24'>
                      <path
                        fill='#4285F4'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='#34A853'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z'
                      />
                      <path
                        fill='#EA4335'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z'
                      />
                    </svg>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-bold text-slate-900 mb-1'>
                      Password Managed by Google
                    </h4>
                    <p className='text-xs text-slate-600 leading-relaxed max-w-xl'>
                      You are signed in with Google OAuth ({profileData.email || user?.email}). Password changes are disabled here because your account credentials and 2-step verification are secured directly by Google.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className='flex items-center gap-3 mb-6'>
                <div className='h-10 w-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-lg shadow-slate-950/15 shrink-0'>
                  <Lock className='w-5 h-5 text-white' strokeWidth={2} />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-slate-900 tracking-tight'>Change Password</h3>
                  <p className='text-xs text-slate-500'>Update your password to keep your account safe</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className='space-y-5'>
                {/* Current Password */}
                <div className='space-y-2'>
                  <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                    Current Password
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400'>
                      <Lock className='w-5 h-5' strokeWidth={2} />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                      className='app-input h-12 rounded-xl pl-12 pr-12'
                      placeholder='Enter current password'
                    />
                    <button
                      type='button'
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className='absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer'
                    >
                      {showCurrentPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className='space-y-2'>
                  <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                    New Password
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400'>
                      <Lock className='w-5 h-5' strokeWidth={2} />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      className='app-input h-12 rounded-xl pl-12 pr-12'
                      placeholder='Enter new password (min 8 chars)'
                    />
                    <button
                      type='button'
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className='absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer'
                    >
                      {showNewPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className='space-y-2'>
                  <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                    Confirm New Password
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400'>
                      <Lock className='w-5 h-5' strokeWidth={2} />
                    </div>
                    <input
                      type='password'
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      className='app-input h-12 rounded-xl pl-12 pr-4'
                      placeholder='Confirm new password'
                    />
                  </div>
                </div>

                {/* Change Password Button */}
                <button
                  type='submit'
                  disabled={changingPassword}
                  className='group app-primary-action relative w-full h-12 overflow-hidden'
                >
                  <span className='relative z-10 flex items-center justify-center gap-2'>
                    {changingPassword ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                        <span>Changing Password...</span>
                      </>
                    ) : (
                      <>
                        <Lock className='w-4 h-4' strokeWidth={2.5} />
                        <span>Change Password</span>
                      </>
                    )}
                  </span>
                  <div className='absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
