import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo3D } from '../../components/Logo3D';
import { UserPlus, Mail, Lock, User, Building, Phone } from 'lucide-react';

export const RegisterPage = ({ setTab }) => {
  const { register } = useAuth();
  const [role, setRole] = useState('participant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register({
      name,
      email,
      password,
      role,
      organization,
      phone
    });
    setLoading(false);
    if (result.success) {
      if (role === 'organizer') setTab('organizer-dashboard');
      else setTab('participant-dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <Logo3D size="lg" showText={false} />
        </div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">Join EventSphere</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Discover and organize top collegiate events</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-xl dark:shadow-2xl space-y-4">
        {/* Role Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('participant')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                role === 'participant'
                  ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              🎓 Student Participant
            </button>
            <button
              type="button"
              onClick={() => setRole('organizer')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                role === 'organizer'
                  ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              🎪 Club Organizer
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@campus.edu"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            {role === 'organizer' ? 'Club / Society Name' : 'College / Department'}
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder={role === 'organizer' ? 'e.g. AI & Robotics Club' : 'e.g. Computer Science Dept'}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          Already registered?{' '}
          <button
            type="button"
            onClick={() => setTab('login')}
            className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
          >
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
};
