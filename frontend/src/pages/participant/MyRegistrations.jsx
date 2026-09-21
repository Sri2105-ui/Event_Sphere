import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { QRTicketModal } from '../../components/QRTicketModal';
import {
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Star,
  Search,
  ExternalLink
} from 'lucide-react';

export const MyRegistrations = ({ onSelectEvent }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, confirmed, checked_in, cancelled
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { addToast } = useToast();

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/registrations/my');
      if (res.data.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (regId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket registration?')) return;

    try {
      const res = await api.put(`/registrations/${regId}/cancel`);
      if (res.data.success) {
        addToast('Registration cancelled successfully.', 'info');
        fetchRegistrations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Cancellation failed', 'error');
    }
  };

  const filtered = registrations.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'checked_in') return r.attendanceStatus === 'checked_in';
    return r.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-400 mb-1">
            <Ticket className="w-4 h-4" />
            <span>Digital Passes</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white">My Registrations & Tickets</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your QR entry passes, attendance records, and ticket receipts.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start">
          {[
            { id: 'all', label: 'All' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'checked_in', label: 'Checked In' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-white">No registrations found in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((reg) => {
            const evt = reg.event || {};
            const isCheckedIn = reg.attendanceStatus === 'checked_in';
            const isCancelled = reg.status === 'cancelled';

            return (
              <div
                key={reg._id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all"
              >
                {/* Event Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                    <img
                      src={evt.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=80'}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-brand-400 tracking-wider">
                        {reg.registrationNumber}
                      </span>
                      {isCheckedIn ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Checked-In
                        </span>
                      ) : isCancelled ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Cancelled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                          Active Pass
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        HASH: {reg.ticketHash}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectEvent && onSelectEvent(evt)}
                      className="font-bold text-base text-white hover:text-brand-300 cursor-pointer transition-colors"
                    >
                      {evt.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-400" />
                        {new Date(evt.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {evt.venueName}
                      </span>
                      <span className="text-slate-300 font-medium font-mono">
                        {reg.amountPaid > 0 ? `$${reg.amountPaid}` : 'Free'} ({reg.paymentMethod})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end md:self-center w-full md:w-auto justify-end">
                  {!isCancelled && (
                    <button
                      onClick={() => setSelectedTicket(reg)}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Ticket className="w-4 h-4" /> View QR Pass
                    </button>
                  )}

                  {!isCancelled && !isCheckedIn && (
                    <button
                      onClick={() => handleCancel(reg._id)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Ticket Modal */}
      {selectedTicket && (
        <QRTicketModal
          registration={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};
