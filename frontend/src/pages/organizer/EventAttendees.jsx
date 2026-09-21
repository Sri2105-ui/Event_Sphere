import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Download,
  Mail,
  Award,
  QrCode,
  ChevronLeft,
  RefreshCw,
  Send,
  X
} from 'lucide-react';

export const EventAttendees = ({ event, onBack, onOpenScanner }) => {
  const { addToast } = useToast();
  const [attendees, setAttendees] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, checkedInCount: 0, checkInRate: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Announcement Modal
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceMsg, setAnnounceMsg] = useState('');
  const [sendingAnnounce, setSendingAnnounce] = useState(false);

  // Certificate Issuance State
  const [issuingCerts, setIssuingCerts] = useState(false);

  const fetchAttendees = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/attendance/events/${event._id}/attendees?status=${statusFilter}&search=${search}`
      );
      if (res.data.success) {
        setAttendees(res.data.attendees);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading attendees roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [event, statusFilter, search]);

  const handleToggleCheckIn = async (regId) => {
    try {
      const res = await api.put(`/attendance/registrations/${regId}/toggle`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
        fetchAttendees();
      }
    } catch (err) {
      addToast('Check-in status update failed', 'error');
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSendingAnnounce(true);
    try {
      const res = await api.post(`/attendance/events/${event._id}/announce`, {
        title: announceTitle,
        message: announceMsg
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        setShowAnnounceModal(false);
        setAnnounceTitle('');
        setAnnounceMsg('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Broadcast failed', 'error');
    } finally {
      setSendingAnnounce(false);
    }
  };

  const handleBatchCertificates = async () => {
    if (stats.checkedInCount === 0) {
      addToast('No checked-in attendees found to issue certificates to!', 'warning');
      return;
    }
    if (!window.confirm(`Issue verifiable certificates to all ${stats.checkedInCount} checked-in attendees?`)) return;

    setIssuingCerts(true);
    try {
      const res = await api.post(`/certificates/events/${event._id}/generate`);
      if (res.data.success) {
        addToast(res.data.message, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Certificate generation failed', 'error');
    } finally {
      setIssuingCerts(false);
    }
  };

  const exportCSV = () => {
    if (attendees.length === 0) return;
    const headers = ['Registration Number', 'Name', 'Email', 'Organization', 'Status', 'Attendance', 'Amount Paid'];
    const rows = attendees.map((a) => [
      a.registrationNumber,
      `"${a.user?.name || ''}"`,
      a.user?.email || '',
      `"${a.user?.organization || ''}"`,
      a.status,
      a.attendanceStatus,
      a.amountPaid
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.slug}-roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Bar */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Managed Events
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Attendee Roster & Admissions
            </h1>
            <p className="text-xs text-brand-400 font-semibold mt-0.5">{event?.title}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenScanner}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" /> Live QR Scanner
            </button>
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4 text-brand-400" /> Broadcast Update
            </button>
            <button
              onClick={handleBatchCertificates}
              disabled={issuingCerts}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Award className="w-4 h-4" />
              {issuingCerts ? 'Issuing...' : 'Release Certificates'}
            </button>
            <button
              onClick={exportCSV}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Total Registered</span>
          <p className="text-xl font-bold text-white mt-1 font-mono">{stats.totalCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Checked-In</span>
          <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{stats.checkedInCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Remaining Absent</span>
          <p className="text-xl font-bold text-slate-300 mt-1 font-mono">{stats.absentCount || 0}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Turnout Rate</span>
          <p className="text-xl font-bold text-brand-400 mt-1 font-mono">{stats.checkInRate}%</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendee by name, email, or Reg #..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['all', 'registered', 'checked_in'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white bg-slate-950/50 border border-slate-800'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Attendee Roster Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th className="px-5 py-3.5">Attendee</th>
              <th className="px-5 py-3.5">Reg #</th>
              <th className="px-5 py-3.5">Ticket Hash</th>
              <th className="px-5 py-3.5">Payment</th>
              <th className="px-5 py-3.5">Attendance</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading attendee roster...
                </td>
              </tr>
            ) : attendees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  No attendees found matching current filter.
                </td>
              </tr>
            ) : (
              attendees.map((att) => {
                const isCheckedIn = att.attendanceStatus === 'checked_in';
                return (
                  <tr key={att._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={att.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=64&q=80'}
                          alt={att.user?.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white text-xs block">{att.user?.name}</span>
                          <span className="text-[11px] text-slate-400">{att.user?.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-300 font-bold">
                      {att.registrationNumber}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                      {att.ticketHash}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-mono text-slate-300 font-semibold">
                        {att.amountPaid > 0 ? `$${att.amountPaid}` : 'Free'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      {isCheckedIn ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Registered
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleCheckIn(att._id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isCheckedIn
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        {isCheckedIn ? 'Uncheck' : 'Check In'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Broadcast Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-white text-base">Broadcast to Attendees</h3>
              </div>
              <button
                onClick={() => setShowAnnounceModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold uppercase tracking-wider block">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="e.g. Schedule Update / Venue Change"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold uppercase tracking-wider block">
                  Message Content (Sent via email & in-app notifications)
                </label>
                <textarea
                  rows={4}
                  value={announceMsg}
                  onChange={(e) => setAnnounceMsg(e.target.value)}
                  placeholder="Dear attendees, please note that registration begins 30 minutes earlier at Hall A..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={sendingAnnounce}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20"
              >
                <Send className="w-4 h-4" />
                {sendingAnnounce ? 'Sending...' : 'Send Broadcast Now'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
