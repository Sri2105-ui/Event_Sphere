import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  QrCode,
  X,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const AttendanceScannerModal = ({ events = [], activeEventId, onClose }) => {
  const [selectedEventId, setSelectedEventId] = useState(activeEventId || (events[0]?._id || ''));
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [stats, setStats] = useState(null);
  const scannerRef = useRef(null);
  const { addToast } = useToast();

  const activeEvent = events.find((e) => e._id === selectedEventId) || events[0];

  // Play audio chime for check-in
  const playChime = (success) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(success ? 587.33 : 220, ctx.currentTime); // D5 or A3
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext not allowed without user interaction
    }
  };

  const handleProcessCode = async (codeToVerify) => {
    if (!codeToVerify || loading) return;
    setLoading(true);
    try {
      const res = await api.post('/attendance/scan', {
        code: codeToVerify,
        eventId: selectedEventId
      });

      if (res.data.success) {
        setLastResult(res.data);
        if (res.data.stats) setStats(res.data.stats);

        if (res.data.alreadyCheckedIn) {
          playChime(false);
          addToast(`⚠️ Already checked in: ${res.data.attendee.name}`, 'warning');
        } else {
          playChime(true);
          addToast(`🎉 Check-in verified for ${res.data.attendee.name}!`, 'success');
        }
        setManualCode('');
      }
    } catch (error) {
      playChime(false);
      const msg = error.response?.data?.message || 'Invalid ticket code';
      addToast(msg, 'error');
      setLastResult({
        success: false,
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  // Setup HTML5 QR Code Scanner
  useEffect(() => {
    let html5QrcodeScanner = null;
    if (scanning) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader-container',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          handleProcessCode(decodedText);
        },
        (error) => {
          // ignore frame read errors
        }
      );
      scannerRef.current = html5QrcodeScanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error(err));
      }
    };
  }, [scanning, selectedEventId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">Live Attendance Check-In</h3>
              <p className="text-xs text-slate-400">Scan digital QR passes or enter ticket hash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-gradient-to-b from-slate-900 to-slate-950">
          {/* Event Selector */}
          {events.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Active Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setLastResult(null);
                }}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              >
                {events.map((evt) => (
                  <option key={evt._id} value={evt._id}>
                    {evt.title} ({evt.registeredCount || 0}/{evt.capacity} registered)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Camera Scanner Toggle / View */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-brand-400" />
                Camera Scanner
              </span>
              <button
                onClick={() => setScanning(!scanning)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  scanning
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-brand-600 text-white hover:bg-brand-500 shadow-md shadow-brand-500/20'
                }`}
              >
                {scanning ? 'Stop Camera' : 'Start Camera Scanner'}
              </button>
            </div>

            {scanning ? (
              <div id="qr-reader-container" className="overflow-hidden rounded-xl bg-slate-950 text-white" />
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Camera is idle. Click "Start Camera Scanner" or enter the ticket hash below.
              </div>
            )}
          </div>

          {/* Manual Ticket Hash / Code Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessCode(manualCode);
            }}
            className="space-y-1.5"
          >
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Manual Code Lookup / Scanner Gun Input
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Paste Ticket Hash, Reg # (e.g. ESP-HACK-001) or payload"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!manualCode.trim() || loading}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Check In'}
              </button>
            </div>
          </form>

          {/* Last Result Card */}
          {lastResult && (
            <div
              className={`p-4 rounded-2xl border transition-all animate-in zoom-in-95 ${
                lastResult.success && !lastResult.alreadyCheckedIn
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                  : lastResult.alreadyCheckedIn
                  ? 'bg-amber-950/70 border-amber-500/40 text-amber-200'
                  : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {lastResult.success && !lastResult.alreadyCheckedIn && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                {lastResult.alreadyCheckedIn && (
                  <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                {!lastResult.success && (
                  <X className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1 text-xs space-y-1">
                  <p className="font-bold text-sm text-white">
                    {lastResult.message}
                  </p>
                  {lastResult.attendee && (
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] opacity-90">
                      <div>
                        <span className="text-slate-400 block font-sans">Name</span>
                        <span className="font-bold text-white">{lastResult.attendee.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans">Reg #</span>
                        <span>{lastResult.attendee.registrationNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans">College/Org</span>
                        <span className="truncate block">{lastResult.attendee.organization || 'Campus'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans">Check-in Time</span>
                        <span>{new Date(lastResult.attendee.checkedInAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Dial */}
          {stats && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                <span className="text-slate-300">Turnout:</span>
                <span className="font-bold text-white font-mono">
                  {stats.checkedInCount} / {stats.totalAttendees}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <span className="font-bold text-emerald-400">{stats.percentage}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
