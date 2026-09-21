import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Bell, Check, CheckCheck, Ticket, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAll = async () => {
    try {
      await api.put('/analytics/notifications/read-all');
      addToast('All notifications marked as read', 'success');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      addToast('Error marking notifications', 'error');
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await api.put(`/analytics/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-400 mb-1">
            <Bell className="w-4 h-4" />
            <span>Alerts & Updates</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Notifications
          </h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No notifications right now.</p>
          <p className="text-xs text-slate-500 mt-1">You're all caught up with campus events.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.read && handleMarkOne(notif._id)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                notif.read
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900/90 border-brand-500/40 text-slate-200 shadow-md'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{notif.title}</span>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-400" />
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                <span className="text-[10px] text-slate-500 font-mono block pt-1">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
