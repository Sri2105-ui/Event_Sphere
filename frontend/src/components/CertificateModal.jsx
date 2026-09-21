import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Tilt3D } from './Tilt3D';

export const CertificateModal = ({ certificate, onClose }) => {
  const certRef = useRef(null);

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(certificate.eventDate || certificate.issuedAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <span className="font-display font-bold text-slate-900 dark:text-white text-sm">
              Verifiable Academic Credential
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Frame */}
        <div className="p-6 md:p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
          <Tilt3D maxTilt={7} perspective={1200} glare={true} className="w-full">
            <div
              ref={certRef}
              className="w-full bg-amber-50 text-slate-900 rounded-2xl p-8 md:p-12 relative border-8 border-double border-amber-600/60 shadow-2xl overflow-hidden font-serif"
            >
            {/* Ornate corner motifs */}
            <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-700 pointer-events-none" />
            <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-700 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-amber-700 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-amber-700 pointer-events-none" />

            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Award className="w-96 h-96 text-amber-900" />
            </div>

            {/* Certificate Header */}
            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-500 mb-3 text-amber-700 shadow-sm">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-amber-800 font-sans">
                EventSphere Collegiate Credential
              </h2>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {certificate.title || 'Certificate of Achievement'}
              </h1>
              <p className="text-xs text-slate-600 mt-1 italic">
                This official credential certifies that
              </p>
            </div>

            {/* Recipient Name */}
            <div className="text-center my-6 relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-indigo-950 tracking-tight underline decoration-amber-400/60 decoration-2 underline-offset-8">
                {certificate.recipientName}
              </h3>
            </div>

            {/* Certificate Body Text */}
            <div className="text-center max-w-xl mx-auto my-4 text-xs md:text-sm text-slate-700 leading-relaxed relative z-10">
              has successfully participated in, completed, and demonstrated mastery in
              <span className="block text-base font-bold text-slate-950 mt-1">
                "{certificate.eventName}"
              </span>
              conducted under the auspices of collegiate faculty coordinators on {formattedDate}.
            </div>

            {/* Gold Foil Seal & Verification */}
            <div className="mt-8 pt-6 border-t border-amber-300/80 flex items-end justify-between gap-4 relative z-10 flex-wrap">
              {/* Left: Signature Block */}
              <div className="text-left space-y-1">
                <div className="w-36 border-b border-slate-700 pb-1 font-signature text-slate-800 italic font-bold">
                  {certificate.issuerName || 'Dean of Activities'}
                </div>
                <p className="text-[11px] font-bold text-slate-900">{certificate.issuerName}</p>
                <p className="text-[10px] text-slate-600">{certificate.issuerRole || 'Event Coordinator'}</p>
              </div>

              {/* Center: Gold Foil Seal */}
              <div className="text-center my-2 sm:my-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg mx-auto flex items-center justify-center">
                  <div className="w-full h-full rounded-full border border-yellow-100 flex flex-col items-center justify-center text-amber-950">
                    <span className="text-[8px] font-extrabold tracking-wider uppercase">Official</span>
                    <Award className="w-4 h-4 my-0.5" />
                    <span className="text-[8px] font-extrabold uppercase">Verified</span>
                  </div>
                </div>
              </div>

              {/* Right: Verification QR Code & Code */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Verification Code</span>
                  <span className="font-mono font-bold text-xs text-indigo-900 block tracking-wider">
                    {certificate.verificationCode}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    {certificate.certificateNumber}
                  </span>
                </div>
                <div className="p-1 bg-white border border-amber-300 rounded">
                  <QRCodeSVG
                    value={`${window.location.origin}/?verify=${certificate.verificationCode}`}
                    size={48}
                    level="M"
                  />
                </div>
              </div>
            </div>
          </div>
        </Tilt3D>
      </div>

      {/* Verification Info Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Cryptographically Verified & Publicly Lookupable</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          Code: {certificate.verificationCode}
        </span>
      </div>
    </div>
  </div>
  );
};
