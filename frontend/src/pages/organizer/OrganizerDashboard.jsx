import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Tilt3D } from '../../components/Tilt3D';
import {
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  Plus,
  QrCode,
  Award,
  BarChart2,
  Trash2,
  Edit,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const OrganizerDashboard = ({ setTab, onSelectEvent, onOpenScanner, onManageAttendees }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [eventsRes, analyticsRes] = await Promise.all([
        api.get('/events/organizer/my-events'),
        api.get('/analytics/organizer')
      ]);
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.events);
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Error fetching organizer dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data.success) {
        addToast('Event deleted successfully', 'info');
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const metrics = analytics?.metrics || {
    totalEvents: events.length,
    totalRegistrations: 0,
    checkedInCount: 0,
    overallAttendanceRate: 0,
    totalRevenue: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-purple-500/10 dark:from-brand-950/80 dark:via-slate-900 dark:to-indigo-950/80 border border-brand-500/25 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Organizer Hub
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            {user?.name}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            {user?.organization || 'Campus Society'} • Manage upcoming events, live admissions, and certificates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setTab('organizer-create-event')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
          <button
            onClick={onOpenScanner}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" /> Gate Scanner
          </button>
          <button
            onClick={() => setTab('organizer-analytics')}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
        </div>
      </div>

      {/* Metrics Row with 3D Tilt */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Created Events</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">{metrics.totalEvents}</span>
              <Calendar className="w-5 h-5 text-brand-500 dark:text-brand-400" />
            </div>
          </div>
        </Tilt3D>

        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Registrations</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-display text-brand-600 dark:text-brand-400">
                {metrics.totalRegistrations}
              </span>
              <Users className="w-5 h-5 text-brand-500 dark:text-brand-400" />
            </div>
          </div>
        </Tilt3D>

        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Check-In Rate</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                {metrics.overallAttendanceRate}%
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
        </Tilt3D>

        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ticket Revenue</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400">
                ${metrics.totalRevenue}
              </span>
              <DollarSign className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
          </div>
        </Tilt3D>
      </div>

      {/* Events Table / Card Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">My Managed Events</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">{events.length} Total Events</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-3">
            <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">No Events Created Yet</h3>
            <p className="text-xs">Create your first collegiate hackathon, workshop, or fest to get started.</p>
            <button
              onClick={() => setTab('organizer-create-event')}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-md"
            >
              Create Event Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((evt) => (
              <div
                key={evt._id}
                className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-all shadow-sm"
              >
                {/* Event Summary */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex-shrink-0 border border-slate-200 dark:border-slate-800">
                    <img
                      src={evt.bannerImage}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          evt.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : evt.status === 'pending_approval'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {evt.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                        {evt.eventType} • {evt.venueType}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectEvent && onSelectEvent(evt)}
                      className="font-bold text-base text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-300 cursor-pointer transition-colors"
                    >
                      {evt.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                        {new Date(evt.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {evt.registeredCount || 0} / {evt.capacity} Attendees
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">
                        {evt.price === 0 ? 'Free' : `$${evt.price}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Actions */}
                <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                  <button
                    onClick={() => onManageAttendees && onManageAttendees(evt)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Attendees ({evt.registeredCount || 0})
                  </button>

                  <button
                    onClick={() => {
                      setTab('organizer-create-event', { editEvent: evt });
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                    title="Edit Event"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(evt._id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/30 transition-colors shadow-sm"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
