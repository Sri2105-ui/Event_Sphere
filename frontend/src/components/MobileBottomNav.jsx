import React from 'react';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = ({ currentTab, setTab, onOpenScanner }) => {
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 pb-safe bg-white/90 dark:bg-[#0a0e18]/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-colors">
      <div className="h-16 px-4 flex items-center justify-around">
        {/* Explore */}
        <button
          onClick={() => {
            setTab('explore');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors gap-0.5 ${
            currentTab === 'explore'
              ? 'text-primary font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">explore</span>
          <span className="text-[11px] font-semibold tracking-tight">Explore</span>
        </button>

        {/* My Tickets */}
        <button
          onClick={() => {
            setTab('participant-tickets');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors gap-0.5 ${
            currentTab === 'participant-tickets'
              ? 'text-primary font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
          <span className="text-[11px] font-semibold tracking-tight">My Tickets</span>
        </button>

        {/* Live Scanner Elevated Button */}
        <button
          onClick={onOpenScanner}
          className="flex flex-col items-center justify-center min-w-[60px] h-12 text-on-surface transition-transform active:scale-95 group -mt-4"
          title="Open Live QR Gate Scanner"
        >
          <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_4px_16px_rgba(78,222,163,0.45)] group-hover:bg-primary-container group-hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
          </div>
          <span className="text-[10px] text-primary tracking-tight font-bold mt-0.5 uppercase">Live Scan</span>
        </button>

        {/* Admin or Hub */}
        <button
          onClick={() => {
            if (user?.role === 'admin') setTab('admin-dashboard');
            else if (user?.role === 'organizer') setTab('organizer-dashboard');
            else setTab('participant-dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors gap-0.5 ${
            currentTab === 'admin-dashboard' || currentTab === 'organizer-dashboard' || currentTab === 'participant-dashboard'
              ? 'text-primary font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {user?.role === 'admin' ? 'verified_user' : user?.role === 'organizer' ? 'space_dashboard' : 'account_circle'}
          </span>
          <span className="text-[11px] font-semibold tracking-tight">
            {user?.role === 'admin' ? 'Admin' : user?.role === 'organizer' ? 'Organizer' : 'Portal'}
          </span>
        </button>
      </div>
    </nav>
  );
};
