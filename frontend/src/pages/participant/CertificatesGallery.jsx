import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CertificateModal } from '../../components/CertificateModal';
import { Award, Calendar, CheckCircle2, ShieldCheck, Printer, ExternalLink } from 'lucide-react';

export const CertificatesGallery = ({ setTab }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.get('/certificates/my');
        if (res.data.success) {
          setCertificates(res.data.certificates);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
            <Award className="w-4 h-4" />
            <span>Academic Portfolio</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white">Earned Certificates</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official collegiate credentials cryptographically verifiable worldwide.
          </p>
        </div>
        <button
          onClick={() => setTab('verify-cert')}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5 self-start"
        >
          <ShieldCheck className="w-4 h-4" /> Check Verification Portal
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">No Certificates Yet</h3>
          <p className="text-xs max-w-sm mx-auto">
            Attend your registered events and get your QR code scanned at the entrance counter to qualify for verified completion certificates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="glass-panel glass-panel-hover rounded-3xl p-6 border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30">
                    {cert.verificationCode}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {cert.title}
                </span>
                <h3 className="font-display font-bold text-lg text-white mt-1 leading-snug">
                  {cert.eventName}
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Issued to <strong className="text-slate-200">{cert.recipientName}</strong> on{' '}
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" /> View Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};
