import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo3D } from '../../components/Logo3D';
import { Sparkles, LogIn, Lock, Mail, ArrowRight, Shield, Users } from 'lucide-react';

export const LoginPage = ({ setTab }) => {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.user.role === 'admin') setTab('admin-dashboard');
      else if (result.user.role === 'organizer') setTab('organizer-dashboard');
      else setTab('participant-dashboard');
    }
  };

  const handleQuick = async (role) => {
    setLoading(true);
    const result = await quickDemoLogin(role);
    setLoading(false);
    if (result.success) {
      if (role === 'admin') setTab('admin-dashboard');
      else if (role === 'organizer') setTab('organizer-dashboard');
      else setTab('participant-dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <Logo3D size="lg" showText={false} />
        </div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">Welcome Back</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to your EventSphere collegiate account</p>
      </div>

      {/* Quick 1-Click Demo Login Bar */}
      <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-gradient-to-b dark:from-indigo-950/50 dark:to-slate-900 border border-slate-200 dark:border-indigo-500/30 space-y-2.5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-4 h-4 text-brand-500 dark:text-brand-400 animate-pulse" />
          <span>Instant Evaluator Demo Sign-In:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuick('participant')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-all shadow-sm"
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => handleQuick('organizer')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-center text-xs font-semibold text-brand-700 dark:text-brand-300 transition-all shadow-sm"
          >
            🎪 Organizer
          </button>
          <button
            type="button"
            onClick={() => handleQuick('admin')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-center text-xs font-semibold text-amber-700 dark:text-amber-300 transition-all shadow-sm"
          >
            👑 Admin
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 shadow-xl dark:shadow-2xl space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@eventsphere.com"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
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
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => setTab('register')}
            className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
          >
            Create Account
          </button>
        </p>
      </form>
    </div>
  );
};
