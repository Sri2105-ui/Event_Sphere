import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  X,
  AlertTriangle
} from 'lucide-react';

export const EventApprovals = ({ setTab }) => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { addToast } = useToast();

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events/pending');
      if (res.data.success) {
        setPendingEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
      addToast('Error fetching pending events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReview = async (action, eventId, reason = '') => {
    try {
      const res = await api.put(`/admin/events/${eventId}/review`, {
        action,
        reason
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedEvent(null);
        fetchPending();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Review action failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => setTab('admin-dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Event Approvals & Moderation</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white">Event Review Queue</h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect submissions from college organizers before making them live on the public explore directory.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : pendingEvents.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="font-bold text-white text-base">All Caught Up!</h3>
          <p className="text-xs max-w-sm mx-auto">
            There are currently no events pending moderation in the queue.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingEvents.map((evt) => (
            <div
              key={evt._id}
              className="glass-panel rounded-3xl p-6 border border-amber-500/30 bg-slate-900/80 space-y-5"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={evt.organizer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                    alt={evt.organizer?.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                      Submitted by Organizer
                    </span>
                    <span className="font-bold text-sm text-white">{evt.organizer?.name}</span>
                    <span className="text-xs text-slate-400 block">{evt.organizer?.organization || 'Campus Club'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReview('approve', evt._id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Publish
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(evt);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject / Notes
                  </button>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="md:col-span-3 space-y-2">
                  <h3 className="font-display font-bold text-xl text-white">{evt.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{evt.shortDescription}</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-3 pt-1">
                    {evt.description}
                  </p>
                </div>

                <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Category:</span>
                    <span className="font-bold text-white">{evt.category?.name || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Format:</span>
                    <span className="font-bold text-white uppercase">{evt.venueType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Capacity:</span>
                    <span className="font-bold text-white">{evt.capacity} Seats</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ticket Price:</span>
                    <span className="font-bold text-brand-300">{evt.price === 0 ? 'Free' : `$${evt.price}`}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Reject Event Submission</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300">
              Provide feedback for <strong>{selectedEvent.title}</strong> so the organizer can revise and resubmit:
            </p>

            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Schedule conflicts with graduation ceremony, or venue safety permits missing..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReview('reject', selectedEvent._id, rejectReason)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
