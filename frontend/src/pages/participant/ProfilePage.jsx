import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Mail, Phone, Building, Key, Shield, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name,
        organization,
        phone,
        bio,
        avatar
      });
      if (res.data.success) {
        addToast('Profile updated successfully!', 'success');
        updateUser(res.data.user);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPass(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        addToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Password update failed', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-400 mb-1">
          <User className="w-4 h-4" />
          <span>Personal Account</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white">Account Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your collegiate identity, club affiliations, and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card / Avatar Overview */}
        <div className="md:col-span-1 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-brand-500/40 p-1 bg-slate-950"
            />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/40">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 space-y-8">
          <form
            onSubmit={handleProfileSubmit}
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs"
          >
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2">
              Profile Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase tracking-wider">Organization / Dept</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase tracking-wider">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase tracking-wider">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold uppercase tracking-wider">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your collegiate pursuits..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Password Form */}
          <form
            onSubmit={handlePasswordSubmit}
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs"
          >
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Key className="w-4 h-4 text-amber-400" /> Change Password
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPass}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold transition-all shadow-md"
            >
              {savingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
