import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { Logo3D } from './Logo3D';
import {
  Calendar,
  Compass,
  Award,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  QrCode,
  LayoutDashboard,
  Layers,
  Menu,
  X,
  Sparkles,
  Ticket,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar = ({ currentTab, setTab }) => {
  const { user, logout, quickDemoLogin, isAuthenticated } = useAuth();
  const { unreadCount } = useSocket();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [campusNode, setCampusNode] = useState('MIT Tech Hub / Campus');
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);

  const handleNav = (tabName) => {
    setTab(tabName);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-300">
      {/* Demo Switcher Quick Bar */}
      <div className="bg-slate-100/90 dark:bg-gradient-to-r dark:from-brand-950/70 dark:via-slate-900 dark:to-indigo-950/70 border-b border-slate-200 dark:border-indigo-900/30 px-4 py-1.5 text-xs text-slate-600 dark:text-slate-300 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-medium text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400 animate-pulse" />
            <span>Interactive Demo Roles:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => quickDemoLogin('participant')}
              className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-all ${
                user?.role === 'participant'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🎓 Participant (Student)
            </button>
            <button
              onClick={() => quickDemoLogin('organizer')}
              className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-all ${
                user?.role === 'organizer'
                  ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-500/50 shadow-sm'
                  : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🎪 Organizer (Tech Club)
            </button>
            <button
              onClick={() => quickDemoLogin('admin')}
              className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-all ${
                user?.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              👑 Admin (Senate)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with 3D Emblem & Campus Node Switcher */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => handleNav('home')}
              className="cursor-pointer select-none flex items-center gap-2"
            >
              <Logo3D size="md" showText={true} />
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 dark:bg-surface-container text-primary border border-primary/30 uppercase font-bold tracking-wider">
                PRO
              </span>
            </div>

            {/* Campus Node Switcher */}
            <div className="relative hidden xl:block">
              <button
                type="button"
                onClick={() => setCampusDropdownOpen(!campusDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-low dark:hover:bg-surface-container border border-slate-200 dark:border-slate-800 text-left transition-colors text-xs"
              >
                <span className="material-symbols-outlined text-primary text-[15px]">apartment</span>
                <span className="font-medium text-slate-700 dark:text-on-surface-variant truncate max-w-[140px]">{campusNode}</span>
                <span className="material-symbols-outlined text-slate-400 text-[14px]">expand_more</span>
              </button>
              {campusDropdownOpen && (
                <div className="absolute left-0 mt-1 w-56 rounded-xl bg-white dark:bg-surface-container border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in text-xs">
                  {['MIT Tech Hub / Campus', 'Stanford Innovation Node', 'UC Berkeley Hub', 'Harvard Tech Corridor', 'IIT Innovation Cluster'].map((hub) => (
                    <button
                      key={hub}
                      onClick={() => {
                        setCampusNode(hub);
                        setCampusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-surface-container-high transition-colors flex items-center justify-between ${
                        campusNode === hub ? 'text-primary font-bold bg-primary/10' : 'text-slate-700 dark:text-on-surface'
                      }`}
                    >
                      <span>{hub}</span>
                      {campusNode === hub && <span className="material-symbols-outlined text-[14px] text-primary">check</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'home'
                  ? 'text-brand-600 dark:text-white bg-slate-200/70 dark:bg-slate-800/80 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('explore')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'explore'
                  ? 'text-brand-600 dark:text-white bg-slate-200/70 dark:bg-slate-800/80 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Compass className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              Explore Events
            </button>
            <button
              onClick={() => handleNav('categories')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'categories'
                  ? 'text-brand-600 dark:text-white bg-slate-200/70 dark:bg-slate-800/80 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              Categories
            </button>
            <button
              onClick={() => handleNav('verify-cert')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'verify-cert'
                  ? 'text-brand-600 dark:text-white bg-slate-200/70 dark:bg-slate-800/80 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Verify Certificate
            </button>
          </nav>

          {/* Right Action Icons & User Account */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* 3D Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-amber-300 hover:border-brand-500/50 hover:shadow-md hover:scale-105 transition-all flex items-center justify-center group"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-500" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Role Specific Shortcuts */}
                {user.role === 'organizer' && (
                  <button
                    onClick={() => handleNav('organizer-scanner')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-600 dark:text-brand-300 text-xs font-semibold transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    Scan QR Pass
                  </button>
                )}

                {user.role === 'participant' && (
                  <button
                    onClick={() => handleNav('participant-tickets')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                  >
                    <Ticket className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                    My Tickets
                  </button>
                )}

                {/* Notifications Link with Telemetry Badge */}
                <button
                  onClick={() => handleNav(user.role === 'organizer' ? 'organizer-notifications' : 'participant-notifications')}
                  className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-low dark:hover:bg-surface-container border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface transition-colors shadow-sm"
                  title="Notifications"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-bold ring-2 ring-white dark:ring-surface-container-lowest">
                    {unreadCount || 3}
                  </span>
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1 pl-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="text-left pr-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user.name.split(' ')[0]}</p>
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium capitalize">{user.role}</span>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        {user.role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleNav('admin-dashboard')}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2"
                            >
                              <LayoutDashboard className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Admin Dashboard
                            </button>
                            <button
                              onClick={() => handleNav('admin-approvals')}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2"
                            >
                              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Event Approvals
                            </button>
                          </>
                        )}

                        {user.role === 'organizer' && (
                          <>
                            <button
                              onClick={() => handleNav('organizer-dashboard')}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2"
                            >
                              <LayoutDashboard className="w-4 h-4 text-brand-500 dark:text-brand-400" /> Organizer Hub
                            </button>
                            <button
                              onClick={() => handleNav('organizer-create-event')}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400" /> Create Event
                            </button>
                          </>
                        )}

                        {user.role === 'participant' && (
                          <>
                            <button
                              onClick={() => handleNav('participant-dashboard')}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2"
                            >
                              <LayoutDashboard className="w-4 h-4 text-brand-500 dark:text-brand-400" /> My Dashboard
                            </button>
                            <button
                              onClick={() => handleNav('participant-tickets')}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2"
                            >
                              <Ticket className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> My Tickets
                            </button>
                            <button
                              onClick={() => handleNav('participant-certificates')}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2"
                            >
                              <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Certificates
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleNav('profile')}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" /> Account Profile
                        </button>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger & theme toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-300"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            {isAuthenticated && (
              <button
                onClick={() => handleNav(user.role === 'organizer' ? 'organizer-notifications' : 'participant-notifications')}
                className="p-2 text-slate-600 dark:text-slate-300"
              >
                <Bell className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 px-4 pt-2 pb-6 space-y-2 backdrop-blur-xl">
          <button
            onClick={() => handleNav('home')}
            className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('explore')}
            className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Explore Events
          </button>
          <button
            onClick={() => handleNav('categories')}
            className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Categories
          </button>
          <button
            onClick={() => handleNav('verify-cert')}
            className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Verify Certificate
          </button>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="px-3 py-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <span className="text-xs text-brand-600 dark:text-brand-400 capitalize">{user.role}</span>
              </div>
              {user.role === 'admin' && (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="w-full text-left px-3 py-2 text-sm text-amber-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Admin Portal
                </button>
              )}
              {user.role === 'organizer' && (
                <button
                  onClick={() => handleNav('organizer-dashboard')}
                  className="w-full text-left px-3 py-2 text-sm text-brand-600 dark:text-brand-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Organizer Portal
                </button>
              )}
              {user.role === 'participant' && (
                <button
                  onClick={() => handleNav('participant-dashboard')}
                  className="w-full text-left px-3 py-2 text-sm text-emerald-600 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Participant Portal
                </button>
              )}
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => handleNav('login')}
                className="flex-1 py-2 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                Log In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="flex-1 py-2 text-center text-sm font-semibold text-white bg-brand-600 rounded-lg"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
