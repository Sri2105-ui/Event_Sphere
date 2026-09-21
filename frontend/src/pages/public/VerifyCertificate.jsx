import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CertificateModal } from '../../components/CertificateModal';
import { Tilt3D } from '../../components/Tilt3D';
import {
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  User,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const VerifyCertificate = ({ initialCode = '' }) => {
  const [code, setCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleVerify = async (codeToVerify) => {
    const targetCode = (codeToVerify || code).trim();
    if (!targetCode) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/certificates/verify/${targetCode}`);
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (error) {
      setResult({
        success: false,
        valid: false,
        message: error.response?.data?.message || 'No valid certificate found with this code.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold shadow-inner">
          <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Public Credential Registry</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white">
          Verify Academic Credentials
        </h1>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Verify certificates issued by collegiate faculties, club directors, and hackathon boards. Enter the unique verification code printed on any EventSphere pass.
        </p>
      </div>

      {/* Lookup Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify(code);
        }}
        className="max-w-xl mx-auto flex items-center p-2 rounded-2xl bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xl dark:shadow-2xl focus-within:border-amber-500 transition-all"
      >
        <div className="flex items-center pl-3 flex-1">
          <Search className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter Code (e.g. ESP-8F29A1D4)"
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      {/* Quick sample prompt for demo convenience */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Try demo verification code:{' '}
        <button
          onClick={() => {
            setCode('ESP-8F29A1D4');
            handleVerify('ESP-8F29A1D4');
          }}
          className="font-mono text-amber-600 dark:text-amber-400 hover:underline font-bold"
        >
          ESP-8F29A1D4
        </button>
      </div>

      {/* Result Card */}
      {searched && (
        <div className="max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300">
          {result?.valid ? (
            <Tilt3D maxTilt={8} scale={1.02} glare={true}>
              <div className="p-6 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-emerald-500/40 shadow-xl dark:shadow-2xl space-y-6">
                {/* Verified Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Official Record Validated
                      </span>
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                        Verified Credential
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                    {result.certificate.verificationCode}
                  </span>
                </div>

                {/* Certificate Details */}
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Recipient</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {result.certificate.recipientName}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                        {result.certificate.user?.organization || 'Collegiate Student'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Issued For</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {result.certificate.eventName}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                        {new Date(result.certificate.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                    <span>Certificate #: {result.certificate.certificateNumber}</span>
                    <span>Issuer: {result.certificate.issuerName}</span>
                  </div>
                </div>

                {/* View Full Certificate Modal Trigger */}
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" /> View Full Visual Certificate
                </button>
              </div>
            </Tilt3D>
          ) : (
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Certificate Verification Failed</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                {result?.message || 'No record matching this code could be verified on the campus registry.'}
              </p>
            </div>
          )}
        </div>
      )}

      {showModal && result?.certificate && (
        <CertificateModal
          certificate={result.certificate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
