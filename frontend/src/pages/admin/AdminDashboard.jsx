import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Tilt3D } from '../../components/Tilt3D';
import {
  ShieldCheck,
  Users,
  Calendar,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const AdminDashboard = ({ setTab, onSelectEvent }) => {
  const [stats, setStats] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [recentPendingEvents, setRecentPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentRegistrations(res.data.recentRegistrations || []);
        setRecentPendingEvents(res.data.recentPendingEvents || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Error fetching admin statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleQuickApprove = async (eventId) => {
    try {
      const res = await api.put(`/admin/events/${eventId}/review`, {
        action: 'approve'
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchAdminStats();
      }
    } catch (err) {
      addToast('Approval failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading admin console...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-950/60 dark:via-slate-900 dark:to-slate-950 border border-amber-500/25 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Platform Governance Console
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            Senate Administration
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Moderate event submissions, audit user roles, and monitor campus-wide metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('admin-approvals')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Review Pending ({stats?.pendingEvents || 0})
          </button>
          <button
            onClick={() => setTab('admin-users')}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
          >
            Manage Users
          </button>
        </div>
      </div>

      {/* Metrics Row with 3D Tilt */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Users</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{stats?.totalUsers || 0}</p>
          </div>
        </Tilt3D>
        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400">Published Events</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {stats?.publishedEvents || 0}
            </p>
          </div>
        </Tilt3D>
        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400">Pending Approvals</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {stats?.pendingEvents || 0}
            </p>
          </div>
        </Tilt3D>
        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400">Platform Volume</span>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1 font-mono">
              ${stats?.totalRevenue || 0}
            </p>
          </div>
        </Tilt3D>
      </div>

      {/* Pending Approvals Quick Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            Moderation Queue (Pending Review)
          </h2>
          <button
            onClick={() => setTab('admin-approvals')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View All Queue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentPendingEvents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            🎉 All caught up! No events currently waiting for approval.
          </div>
        ) : (
          <div className="space-y-3">
            {recentPendingEvents.map((evt) => (
              <div
                key={evt._id}
                className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-amber-300 dark:border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Submitted by {evt.organizer?.name} ({evt.organizer?.organization || 'Club'})
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{evt.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Dates: {new Date(evt.startDate).toLocaleDateString()} • Capacity: {evt.capacity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickApprove(evt._id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    Approve & Publish
                  </button>
                  <button
                    onClick={() => setTab('admin-approvals')}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Platform Registrations */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Recent Student Registrations</h2>
        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Event</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {recentRegistrations.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
                    {r.user?.name} ({r.user?.email})
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{r.event?.title}</td>
                  <td className="p-4 font-mono font-bold text-brand-600 dark:text-brand-300">
                    {r.amountPaid > 0 ? `$${r.amountPaid}` : 'Free'}
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">
                    {new Date(r.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
