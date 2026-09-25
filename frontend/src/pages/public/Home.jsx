import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { EventCard } from '../../components/EventCard';
import { Tilt3D } from '../../components/Tilt3D';
import { HologramSphere3D } from '../../components/HologramSphere3D';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Sparkles,
  Calendar,
  Award,
  ShieldCheck,
  CheckCircle2,
  Users,
  Search,
  ArrowRight,
  Share2,
  Zap,
  TrendingUp,
  Cpu,
  Code,
  Music,
  Mic,
  BookOpen,
  Terminal,
  ChevronRight,
  PlusCircle,
  Clock,
  Radio,
  SlidersHorizontal,
  X
} from 'lucide-react';

export const Home = ({ setTab, onSelectEvent }) => {
  const { user, isAuthenticated, switchRole } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRoleUpgradeModal, setShowRoleUpgradeModal] = useState(false);
  const [upgradingRole, setUpgradingRole] = useState(false);
  const { addToast } = useToast();

  const handleHostEventClick = () => {
    if (!isAuthenticated) {
      setTab('login');
      return;
    }
    if (user?.role === 'participant') {
      setShowRoleUpgradeModal(true);
    } else {
      setTab('organizer-create-event');
    }
  };

  const handleConfirmUpgrade = async () => {
    setUpgradingRole(true);
    const res = await switchRole('organizer');
    setUpgradingRole(false);
    if (res.success) {
      setShowRoleUpgradeModal(false);
      setTab('organizer-create-event');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, catsRes] = await Promise.all([
          api.get('/events?featured=true&limit=6'),
          api.get('/categories')
        ]);
        if (eventsRes.data.success) {
          if (eventsRes.data.events && eventsRes.data.events.length > 0) {
            setFeaturedEvents(eventsRes.data.events);
          } else {
            // Fallback: If no featured events, fetch general published events
            try {
              const fallbackRes = await api.get('/events?limit=6');
              if (fallbackRes.data.success && fallbackRes.data.events?.length > 0) {
                setFeaturedEvents(fallbackRes.data.events);
              } else {
                setFeaturedEvents([]);
              }
            } catch {
              setFeaturedEvents([]);
            }
          }
        }
        if (catsRes.data.success) {
          setCategories(catsRes.data.categories);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setTab('explore', { keyword: searchKeyword });
  };

  const handleShareFlagship = () => {
    navigator.clipboard.writeText(window.location.origin);
    addToast('HackVerse 2025 link copied to clipboard!', 'info');
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Value Proposition / Hero with 3D Hologram */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 overflow-hidden">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col gap-5 text-left">
              {/* Live Operational Tag */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-surface-container-high border border-slate-200 dark:border-slate-700/80 text-primary font-mono text-[11px] uppercase font-bold tracking-wider shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Next-Gen Campus Event OS
                </div>
                <div className="text-slate-500 dark:text-on-surface-variant font-mono text-[11px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">sensors</span>
                  v2.4 Telemetry
                </div>
              </div>

              {/* Core Headline & Subtitle */}
              <div className="flex flex-col gap-2">
                <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-on-surface tracking-tight leading-[1.12]">
                  Where Campus Sparks Turn Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-primary dark:to-teal-300">Movements.</span>
                </h1>
                <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-on-surface-variant leading-relaxed mt-1 max-w-2xl">
                  From 36-hour national AI hackathons to sold-out amphitheater music fests. One unified platform for student discovery, instant QR ticketing, escrow settlements, and verified credentials.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  onClick={() => setTab('explore')}
                  className="h-12 px-6 rounded-xl bg-primary text-on-primary font-display text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-primary-container transition-all active:scale-[0.98]"
                  type="button"
                >
                  <span>Explore Campus Events</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
                <button
                  onClick={handleHostEventClick}
                  className="h-12 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-high dark:hover:bg-surface-bright border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-on-surface font-display text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">add_circle</span>
                  <span>Host an Event</span>
                </button>
              </div>

              {/* Search Terminal Box */}
              <div className="mt-2 bg-white/90 dark:bg-surface-container border border-slate-200 dark:border-slate-800 p-3 rounded-2xl flex flex-col gap-2 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between px-1">
                  <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-on-surface-variant font-mono text-xs">
                    <span className="material-symbols-outlined text-primary text-[15px]">location_on</span>
                    <span className="font-semibold text-slate-900 dark:text-on-surface">MIT Hub / Greater Boston</span>
                  </div>
                  <span className="text-[10px] text-primary font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                    ONLINE 24/7
                  </span>
                </div>
                <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-50 dark:bg-surface-container-lowest px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Find hackathons, keynotes, workshops..."
                    className="bg-transparent border-0 outline-none text-slate-900 dark:text-on-surface placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs w-full"
                  />
                  <button
                    type="submit"
                    aria-label="Filters"
                    className="p-1.5 rounded-lg bg-white dark:bg-surface-container text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                  </button>
                </form>

                {/* Popular Search Chips */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 dark:text-slate-400 px-1 pt-1">
                  <span className="font-semibold text-[11px]">Trending:</span>
                  {['Hackathon', 'AI & Machine Learning', 'Workshops', 'Keynotes'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setTab('explore', { keyword: term })}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-high dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] transition-colors"
                    >
                      #{term}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 3D Hologram Column */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <HologramSphere3D onSelectTag={(tag) => setTab('explore', { keyword: tag })} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Metrics Bar / Campus Telemetry with 3D Tilt */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 dark:bg-surface-container-lowest border border-slate-200 dark:border-slate-800/80 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500 dark:text-outline font-bold">
              Real-Time Campus Telemetry
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-primary font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span> SYNCED
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Tilt3D maxTilt={10}>
              <div className="bg-slate-50 dark:bg-surface-container-low p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                <span className="font-display text-2xl sm:text-3xl text-primary font-bold">42</span>
                <span className="font-sans text-xs text-slate-600 dark:text-on-surface-variant mt-1 font-medium">Live Assemblies</span>
              </div>
            </Tilt3D>
            <Tilt3D maxTilt={10}>
              <div className="bg-slate-50 dark:bg-surface-container-low p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                <span className="font-display text-2xl sm:text-3xl text-slate-900 dark:text-on-surface font-bold">12.4k</span>
                <span className="font-sans text-xs text-slate-600 dark:text-on-surface-variant mt-1 font-medium">Verified Students</span>
              </div>
            </Tilt3D>
            <Tilt3D maxTilt={10}>
              <div className="bg-slate-50 dark:bg-surface-container-low p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                <span className="font-display text-2xl sm:text-3xl text-slate-900 dark:text-on-surface font-bold">$128k+</span>
                <span className="font-sans text-xs text-slate-600 dark:text-on-surface-variant mt-1 font-medium">Prize & Escrow Vol</span>
              </div>
            </Tilt3D>
            <Tilt3D maxTilt={10}>
              <div className="bg-slate-50 dark:bg-surface-container-low p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                <span className="font-display text-2xl sm:text-3xl text-secondary font-bold">99.8%</span>
                <span className="font-sans text-xs text-slate-600 dark:text-on-surface-variant mt-1 font-medium">Gate Scan Rate</span>
              </div>
            </Tilt3D>
          </div>
        </div>
      </section>

      {/* 3. Flagship Event Spotlight with 3D Tilt */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">local_fire_department</span>
            <h2 className="font-display text-xl sm:text-2xl text-slate-900 dark:text-on-surface font-bold">
              Flagship Spotlight
            </h2>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-primary border border-emerald-500/30 font-bold font-mono uppercase tracking-wider">
            LIVE
          </span>
        </div>

        {/* Spotlight Interactive Card */}
        <Tilt3D maxTilt={6} glare={true} className="rounded-3xl">
          <div className="relative bg-white dark:bg-surface-container border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row">
            {/* Media Header */}
            <div className="relative md:w-1/2 h-56 md:h-auto overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="HackVerse AI Hackathon at MIT"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBr8vnHHj_T6ReNtTuDu6Q5lMCuXHdG8k8dT7Yy28_QWdg3k8DIRsWGPOjFzkyyrGdDsYdTpf5i-uGO3gWLf8saga5VpvpezEMuHd9QgQxJ4mWweDjBd90evuN1kzUEU00RcYMpJL42tj577FQYxUz4jcO1j_UdLKaHcqlxiPiCn2qyU085OOxKa_vKKeCXHHQFfjoImW5L0DpUZfIGUm0foFp5K0Yc-bx63uzsyry2RTeVKFrK5hm4"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                <span className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-primary font-mono text-xs font-semibold flex items-center gap-1 border border-primary/30">
                  <span className="material-symbols-outlined text-[14px]">military_tech</span> $15,000 Pool
                </span>
                <span className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono text-xs flex items-center gap-1 border border-white/20">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">timer</span> 2d : 14h left
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-secondary font-mono text-xs font-semibold">
                  <span className="material-symbols-outlined text-[15px]">apartment</span>
                  <span>Stata Center • MIT Kresge Hall</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-slate-900 dark:text-on-surface font-bold tracking-tight">
                  HackVerse 2025: National AI Hackathon
                </h3>
                <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-on-surface-variant leading-relaxed">
                  Build autonomous agents, multi-modal LLM stacks, and edge robotic intelligence with 600+ top collegiate builders across 48 universities.
                </p>
              </div>

              {/* Telemetry Meter */}
              <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-surface-container-low p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-on-surface-variant font-medium">Capacity Telemetry</span>
                  <span className="text-purple-600 dark:text-tertiary font-mono font-bold">92% Reserved (552/600 Seats)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-surface-container-highest overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '92%' }}></div>
                </div>
              </div>

              {/* Rapid Action Bar */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setTab('explore', { keyword: 'HackVerse' })}
                  className="flex-1 h-12 bg-primary hover:bg-primary-container text-on-primary font-display text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>1-Tap Fast Register</span>
                </button>
                <button
                  onClick={handleShareFlagship}
                  aria-label="Share Event"
                  className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-surface-container-high dark:hover:bg-surface-bright text-slate-700 dark:text-on-surface flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                </button>
              </div>
            </div>
          </div>
        </Tilt3D>
      </section>

      {/* 4. Category Hub: Browse by Node */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="font-display text-xl sm:text-2xl text-slate-900 dark:text-on-surface font-bold">
              Browse by Node
            </h2>
            <span className="text-xs text-slate-500 dark:text-outline">Segmented campus tracks</span>
          </div>
          <button
            onClick={() => setTab('categories')}
            className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline"
            type="button"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[15px]">chevron_right</span>
          </button>
        </div>

        {/* 4 Node Grid with 3D Tilt */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Tilt3D maxTilt={12}>
            <div
              onClick={() => setTab('explore', { category: 'hackathon' })}
              className="bg-white/90 dark:bg-surface-container border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-36 hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">terminal</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-surface-container-highest text-secondary font-bold">
                  18 Live
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-on-surface">Hackathons</span>
                <span className="text-[11px] text-slate-500 dark:text-on-surface-variant truncate">Sprints & AI Agents</span>
              </div>
            </div>
          </Tilt3D>

          <Tilt3D maxTilt={12}>
            <div
              onClick={() => setTab('explore', { category: 'cultural' })}
              className="bg-white/90 dark:bg-surface-container border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-36 hover:border-secondary/50 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-surface-container-high flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">music_note</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-surface-container-highest text-slate-500 dark:text-on-surface-variant font-bold">
                  9 Live
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-on-surface">Cultural & Arts</span>
                <span className="text-[11px] text-slate-500 dark:text-on-surface-variant truncate">Band Wars, EDM, Acts</span>
              </div>
            </div>
          </Tilt3D>

          <Tilt3D maxTilt={12}>
            <div
              onClick={() => setTab('explore', { category: 'workshop' })}
              className="bg-white/90 dark:bg-surface-container border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-36 hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-surface-container-highest text-primary font-bold">
                  12 Live
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-on-surface">Workshops</span>
                <span className="text-[11px] text-slate-500 dark:text-on-surface-variant truncate">Robotics, Web3, ML</span>
              </div>
            </div>
          </Tilt3D>

          <Tilt3D maxTilt={12}>
            <div
              onClick={() => setTab('explore', { category: 'seminar' })}
              className="bg-white/90 dark:bg-surface-container border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-36 hover:border-tertiary/50 transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-surface-container-high flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-surface-container-highest text-slate-500 dark:text-on-surface-variant font-bold">
                  6 Live
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-on-surface">Keynotes</span>
                <span className="text-[11px] text-slate-500 dark:text-on-surface-variant truncate">Titans & Research</span>
              </div>
            </div>
          </Tilt3D>
        </div>
      </section>

      {/* 5. Live Campus Events Roster */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-primary font-bold">Live Campus Roster</span>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-on-surface">
              Featured Events Near You
            </h2>
          </div>
          <button
            onClick={() => setTab('explore')}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-900/50 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : featuredEvents.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-3xl bg-slate-100/70 dark:bg-surface-container border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-on-surface">No Campus Events Scheduled Yet</h3>
            <p className="text-xs text-slate-500 dark:text-on-surface-variant max-w-md mx-auto">
              Browse the catalog for upcoming departmental fests, workshops, and hackathons, or host a new event!
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setTab('explore')}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-all shadow-md"
              >
                Browse All Events
              </button>
              <button
                onClick={handleHostEventClick}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Host an Event
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <EventCard key={evt._id} event={evt} onSelect={onSelectEvent} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Frictionless Campus Rails (Architecture) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 mb-8 text-left">
          <span className="font-mono text-[11px] uppercase tracking-widest text-primary font-bold">Architecture</span>
          <h2 className="font-display text-2xl sm:text-3xl text-slate-900 dark:text-on-surface font-bold">
            Frictionless Campus Rails
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-on-surface-variant max-w-xl">
            Three automated layers built to scale from departmental club meetups to multi-thousand attendees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Tilt3D maxTilt={8}>
            <div className="bg-white/90 dark:bg-surface-container border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-between h-full space-y-4 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-secondary-container text-primary flex items-center justify-center font-display text-lg font-bold border border-slate-200 dark:border-indigo-900/40">
                01
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-on-surface">Discover & RSVP in Seconds</h3>
                <p className="font-sans text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                  Fast-track collegiate pass with instant dynamic QR badges natively synced to Apple & Google Wallet with verified student emails.
                </p>
              </div>
            </div>
          </Tilt3D>

          <Tilt3D maxTilt={8}>
            <div className="bg-white/90 dark:bg-surface-container border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-between h-full space-y-4 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-secondary-container text-primary flex items-center justify-center font-display text-lg font-bold border border-slate-200 dark:border-indigo-900/40">
                02
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-on-surface">Frictionless Gate Check-In</h3>
                <p className="font-sans text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                  Sub-second door verifications using offline-first edge scanners. Process 600+ students per portal without Wi-Fi dropouts.
                </p>
              </div>
            </div>
          </Tilt3D>

          <Tilt3D maxTilt={8}>
            <div className="bg-white/90 dark:bg-surface-container border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col justify-between h-full space-y-4 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-secondary-container text-primary flex items-center justify-center font-display text-lg font-bold border border-slate-200 dark:border-indigo-900/40">
                03
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-on-surface">Verified Proof of Skill</h3>
                <p className="font-sans text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                  Automatic post-event cryptographic credentials and tamper-proof badges attached directly to verified university achievement records.
                </p>
              </div>
            </div>
          </Tilt3D>
        </div>
      </section>

      {/* 7. Social Proof / Organizer Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 dark:bg-surface-container-low border border-slate-200 dark:border-slate-800/80 p-6 sm:p-10 rounded-3xl flex flex-col gap-6 shadow-sm">
          <div className="flex flex-col gap-1 text-center items-center">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-outline font-bold">Network Protocol</span>
            <h2 className="font-display text-xl sm:text-2xl text-slate-900 dark:text-on-surface font-bold">
              Trusted by 140+ Campus Chapters
            </h2>
          </div>

          {/* Badges Carousel */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { icon: 'code', name: 'ACM Student Chapter', color: 'text-primary' },
              { icon: 'memory', name: 'IEEE Student Branch', color: 'text-primary' },
              { icon: 'groups', name: 'Student Council', color: 'text-secondary' },
              { icon: 'hub', name: 'Blockchain Lab', color: 'text-primary' },
              { icon: 'security', name: 'CyberSec Society', color: 'text-tertiary' }
            ].map((b, i) => (
              <div
                key={i}
                className="px-4 py-2 rounded-full bg-white dark:bg-surface-container border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-on-surface font-mono text-xs flex items-center gap-2 shadow-sm"
              >
                <span className={`material-symbols-outlined ${b.color} text-[15px]`}>{b.icon}</span>
                <span>{b.name}</span>
              </div>
            ))}
          </div>

          {/* Student Testimonial Card with 3D Tilt */}
          <Tilt3D maxTilt={6}>
            <div className="bg-white dark:bg-surface-container border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col gap-4 shadow-sm max-w-3xl mx-auto">
              <div className="flex items-center gap-3.5">
                <img
                  alt="Student Tech Organizer"
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1XsTfapjSgL3paLvfCcIExhYX9ok1WHqZ0rAg_IKlbiSz6muQZCWOOS3ERA22b2c4kcL8xT6YFfyZ1h9_qp68i_s6YRaVHamufGjuwqYFIwlVD0jzLM84X1YtpiV_UX3NaXat94nDw-s9L-Yge8MnsTG-KGENBXJlEQQVwOt9p-aFfgkZ36iTXUqeodM0GfzN3OGMFFqg6uwWNFrzIQSRQb5eJahSPuXxDA3glRGn_MpuLxx_VwIMZWNWM"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-display font-bold text-sm text-slate-900 dark:text-on-surface truncate">Sarah Lin</span>
                  <span className="text-xs text-slate-500 dark:text-on-surface-variant truncate">Lead Director, MIT HackVerse 2024</span>
                  <span className="text-[11px] text-primary flex items-center gap-0.5 font-semibold">
                    <span className="material-symbols-outlined text-[12px]">verified</span> Verified Organizer
                  </span>
                </div>
              </div>
              <blockquote className="font-sans text-xs sm:text-sm text-slate-700 dark:text-on-surface italic leading-relaxed">
                “EventSphere automated 100% of our gate scanning and ticket escrow for HackVerse. We checked in 450+ hackers in under 20 minutes with zero downtime!”
              </blockquote>
            </div>
          </Tilt3D>
        </div>
      </section>

      {/* 8. Bottom CTA Anchor Box with 3D Tilt */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tilt3D maxTilt={5}>
          <div className="bg-white dark:bg-surface-container border border-slate-200 dark:border-slate-800 p-8 sm:p-12 rounded-3xl flex flex-col items-center text-center gap-4 shadow-xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-primary-container/20 text-primary flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-[32px]">rocket_launch</span>
            </div>
            <div className="flex flex-col gap-1 max-w-lg">
              <h2 className="font-display text-2xl sm:text-3xl text-slate-900 dark:text-on-surface font-bold">
                Ready to ignite your campus?
              </h2>
              <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-on-surface-variant">
                Join thousands of students or empower your collegiate club today with modern ticketing and telemetry.
              </p>
            </div>
            <div className="flex flex-col items-center w-full max-w-xs gap-2 mt-2">
              <button
                onClick={() => setTab('register')}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-display text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
                type="button"
              >
                <span>Get Started Free</span>
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </button>
              <span className="font-mono text-[10px] text-slate-500 dark:text-outline">
                No institutional credit card required • Instant .edu onboarding
              </span>
            </div>
          </div>
        </Tilt3D>
      </section>

      {/* Role Upgrade Modal when Participant clicks Host an Event */}
      {showRoleUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowRoleUpgradeModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/30">
              <span className="material-symbols-outlined text-[28px]">campaign</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                Host an Event on Campus
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You are currently signed in as a <strong className="text-slate-900 dark:text-white">Student Participant</strong> (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold">participant</code>).
                To publish events and manage attendees, upgrade your account to <strong className="text-brand-600 dark:text-brand-400">Club Organizer</strong> with 1 click.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={upgradingRole}
                onClick={handleConfirmUpgrade}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {upgradingRole ? 'Upgrading Role...' : 'Upgrade to Organizer & Host Event'}
              </button>
              <button
                type="button"
                onClick={() => setShowRoleUpgradeModal(false)}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
              >
                Keep Student Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
