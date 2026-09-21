import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Printer, CheckCircle, Calendar, MapPin, Ticket, ShieldCheck } from 'lucide-react';
import { Tilt3D } from './Tilt3D';

export const QRTicketModal = ({ registration, onClose }) => {
  const ticketRef = useRef(null);

  if (!registration) return null;

  const event = registration.event || {};
  const user = registration.user || {};
  const isCheckedIn = registration.attendanceStatus === 'checked_in';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-brand-500 dark:text-brand-400" />
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">Digital Entry Pass</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Container */}
        <div ref={ticketRef} className="p-6 bg-slate-100/70 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950">
          {/* Main 3D Pass Card */}
          <Tilt3D maxTilt={14} perspective={1000} scale={1.02} glare={true}>
            <div className="relative rounded-2xl border border-slate-300 dark:border-indigo-500/30 bg-white dark:bg-gradient-to-b dark:from-slate-800/90 dark:to-slate-900/95 p-6 shadow-xl dark:shadow-2xl overflow-hidden preserve-3d">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Pass Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700/60 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                  EventSphere Official Pass
                </span>
                <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-0.5 leading-snug">
                  {event.title}
                </h4>
              </div>
              <div className="flex-shrink-0">
                {isCheckedIn ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Checked-In
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Confirmed
                  </span>
                )}
              </div>
            </div>

            {/* Event Time & Venue */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date & Time
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold">
                  {new Date(event.startDate || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {new Date(event.startDate || Date.now()).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                  {event.venueName || 'Campus Center'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                  {event.address || 'Engineering Quad'}
                </p>
              </div>
            </div>

            {/* Perforated Divider with Notches */}
            <div className="relative my-6 -mx-6">
              <div className="ticket-notch-left" />
              <div className="ticket-notch-right" />
              <div className="border-b-2 border-dashed border-slate-200 dark:border-slate-700/80 w-full" />
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-white/95 text-slate-950 shadow-inner mb-4 border border-slate-200 dark:border-transparent">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <QRCodeSVG
                  value={
                    JSON.stringify({
                      tHash: registration.ticketHash,
                      regNo: registration.registrationNumber,
                      eventId: event._id,
                      name: user.name
                    })
                  }
                  size={160}
                  level="H"
                  includeMargin={false}
                  fgColor="#0f172a"
                />
              </div>
              <p className="text-[11px] font-mono font-bold tracking-wider text-slate-700 mt-2 uppercase">
                {registration.registrationNumber}
              </p>
              <p className="text-[10px] font-mono text-slate-500">
                HASH: {registration.ticketHash}
              </p>
            </div>

            {/* Attendee Details */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Attendee</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{user.organization || user.email}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tier</span>
                <span className="font-bold text-brand-600 dark:text-brand-300">
                  {registration.amountPaid > 0 ? `PAID ($${registration.amountPaid})` : 'FREE PASS'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  {registration.paymentMethod}
                </span>
              </div>
            </div>
          </div>
        </Tilt3D>
      </div>

      {/* Modal Bottom Actions */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Show this QR pass at the gate scanner for rapid 1-second admission.
        </p>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all flex-shrink-0 shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print Pass
        </button>
      </div>
    </div>
  </div>
  );
};
