import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        const data = response.data;
        setProfileData({
          username: data.username || '',
          email: data.email || '',
        });
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
          <div className='flex items-center gap-4 mb-8'>
            <div className='w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-lg shadow-slate-950/15'>
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className='w-full h-full object-cover'
                  referrerPolicy='no-referrer'
                />
              ) : (
                <User className='w-8 h-8 text-white' strokeWidth={2} />
              )}
            </div>
            <div>
              <h2 className='text-lg font-semibold text-slate-900'>{user?.username || 'User'}</h2>
              <p className='text-sm text-slate-500'>{user?.email || 'user@example.com'}</p>
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

        {/* Change Password Card */}
        <div className='app-panel p-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='h-10 w-10 app-muted-icon-tile'>
              <Lock className='w-5 h-5 text-slate-600' strokeWidth={2} />
            </div>
            <h3 className='text-lg font-medium text-slate-900 tracking-tight'>Change Password</h3>
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
                  className='absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors'
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
                  className='absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors'
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
      </div>
    </div>
  );
};

export default ProfilePage;
