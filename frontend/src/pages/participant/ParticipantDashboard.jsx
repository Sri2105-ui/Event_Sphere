import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { QRTicketModal } from '../../components/QRTicketModal';
import { CertificateModal } from '../../components/CertificateModal';
import { Tilt3D } from '../../components/Tilt3D';
import {
  Calendar,
  Ticket,
  Award,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const ParticipantDashboard = ({ setTab, onSelectEvent }) => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedReg, setSelectedReg] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [regsRes, certsRes] = await Promise.all([
          api.get('/registrations/my'),
          api.get('/certificates/my')
        ]);
        if (regsRes.data.success) {
          setRegistrations(regsRes.data.registrations);
        }
        if (certsRes.data.success) {
          setCertificates(certsRes.data.certificates);
        }
      } catch (error) {
        console.error('Error fetching participant data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const upcomingRegs = registrations.filter(
    (r) => r.event && new Date(r.event.startDate) >= new Date() && r.status === 'confirmed'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-purple-500/10 dark:from-brand-950/70 dark:via-slate-900 dark:to-indigo-950/70 border border-brand-500/25 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Participant Portal
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            {user?.organization || 'College Student'} • Manage your tickets, check-in history, and certificates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('explore')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Find New Events
          </button>
        </div>
      </div>

      {/* Metrics Row with 3D Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-display text-slate-900 dark:text-white">{registrations.length}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Registered Events</span>
            </div>
          </div>
        </Tilt3D>

        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">{upcomingRegs.length}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Upcoming Schedules</span>
            </div>
          </div>
        </Tilt3D>

        <Tilt3D maxTilt={10}>
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400">{certificates.length}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Earned Certificates</span>
            </div>
          </div>
        </Tilt3D>
      </div>

      {/* Upcoming Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Upcoming Registered Events</h2>
          <button
            onClick={() => setTab('participant-tickets')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>View All Registrations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-900/40 animate-pulse border border-slate-200 dark:border-slate-800" />
        ) : upcomingRegs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <p>You have no upcoming events registered right now.</p>
            <button
              onClick={() => setTab('explore')}
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              Browse events on campus →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingRegs.map((reg) => (
              <Tilt3D key={reg._id} maxTilt={6}>
                <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 flex flex-col justify-between space-y-4 transition-all shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                        Pass #{reg.registrationNumber}
                      </span>
                      <h3
                        onClick={() => onSelectEvent && onSelectEvent(reg.event)}
                        className="font-bold text-slate-900 dark:text-white text-base hover:text-brand-600 dark:hover:text-brand-300 cursor-pointer transition-colors line-clamp-1 mt-0.5"
                      >
                        {reg.event.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                          {new Date(reg.event.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {reg.event.venueName}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                      {reg.amountPaid > 0 ? `$${reg.amountPaid}` : 'Free Pass'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Confirmed
                    </span>
                    <button
                      onClick={() => setSelectedReg(reg)}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Ticket className="w-3.5 h-3.5" /> View QR Pass
                    </button>
                  </div>
                </div>
              </Tilt3D>
            ))}
          </div>
        )}
      </div>

      {/* Certificates Highlight */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Earned Verifiable Credentials</h2>
          <button
            onClick={() => setTab('participant-certificates')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>View All Certificates</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {certificates.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            No certificates issued yet. Attend events and check-in to earn certified credentials!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <Tilt3D key={cert._id} maxTilt={8} glare={true}>
                <div className="p-5 rounded-2xl bg-gradient-to-b from-white to-amber-50/40 dark:from-slate-900 dark:to-slate-950 border border-amber-300 dark:border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-3 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                      <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        {cert.verificationCode}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{cert.eventName}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Issued to {cert.recipientName}</p>
                  </div>

                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-400/40 dark:border-amber-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                  >
                    <Award className="w-3.5 h-3.5" /> View Certificate
                  </button>
                </div>
              </Tilt3D>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedReg && (
        <QRTicketModal registration={selectedReg} onClose={() => setSelectedReg(null)} />
      )}
      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};
