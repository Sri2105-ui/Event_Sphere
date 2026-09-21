import React from 'react';
import { Globe, Share2, Shield, Award, Terminal } from 'lucide-react';
import { Logo3D } from './Logo3D';

export const Footer = ({ setTab }) => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/90 dark:bg-slate-950/90 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div onClick={() => setTab('home')} className="cursor-pointer">
              <Logo3D size="sm" showText={true} />
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              The unified collegiate operating system for campus hackathons, research symposiums, technical workshops, and cultural galas.
            </p>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <span className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-brand-600 dark:text-brand-400 shadow-sm">
                <Globe className="w-4 h-4" />
              </span>
              <span className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-brand-600 dark:text-brand-400 shadow-sm">
                <Share2 className="w-4 h-4" />
              </span>
              <span className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-brand-600 dark:text-brand-400 shadow-sm">
                <Shield className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setTab('explore')} className="hover:text-brand-600 dark:hover:text-white transition-colors">
                  All Upcoming Events
                </button>
              </li>
              <li>
                <button onClick={() => setTab('categories')} className="hover:text-brand-600 dark:hover:text-white transition-colors">
                  Hackathons & Competitions
                </button>
              </li>
              <li>
                <button onClick={() => setTab('categories')} className="hover:text-brand-600 dark:hover:text-white transition-colors">
                  Workshops & Labs
                </button>
              </li>
              <li>
                <button onClick={() => setTab('verify-cert')} className="hover:text-brand-600 dark:hover:text-white transition-colors flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Certificate Verification
                </button>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider mb-3">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setTab('participant-dashboard')} className="hover:text-brand-600 dark:hover:text-white transition-colors">
                  Student Participant Hub
                </button>
              </li>
              <li>
                <button onClick={() => setTab('organizer-dashboard')} className="hover:text-brand-600 dark:hover:text-white transition-colors">
                  Club Organizer Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setTab('organizer-scanner')} className="hover:text-brand-600 dark:hover:text-white transition-colors">
                  Live QR Gate Scanner
                </button>
              </li>
              <li>
                <button onClick={() => setTab('admin-dashboard')} className="hover:text-brand-600 dark:hover:text-white transition-colors">
                  Administrative Governance
                </button>
              </li>
            </ul>
          </div>

          {/* System Info */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider mb-3">Platform Specs</h4>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs shadow-sm">
              <div className="flex items-center justify-between">
                <span>API Status</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Real-Time Engine</span>
                <span className="text-brand-600 dark:text-brand-300 font-mono text-[11px]">Socket.IO 4.8</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification</span>
                <span className="text-amber-600 dark:text-amber-300 font-mono text-[11px]">SHA-256 Hashes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} EventSphere Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Engineered for campus excellence with 3D web graphics</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
