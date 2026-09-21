import React, { useState } from 'react';
import { Sparkles, Zap, Shield, Trophy } from 'lucide-react';

export const HologramSphere3D = ({ onSelectTag }) => {
  const [activeOrb, setActiveOrb] = useState(0);

  return (
    <div className="relative w-full max-w-lg mx-auto h-80 sm:h-96 flex items-center justify-center perspective-1000 select-none">
      {/* 3D Isometric Base Ring */}
      <div
        className="absolute bottom-4 w-72 h-72 rounded-full border border-indigo-500/20 bg-gradient-to-b from-transparent to-brand-500/5 blur-sm"
        style={{ transform: 'rotateX(75deg) translateZ(-40px)' }}
      />
      <div
        className="absolute bottom-8 w-56 h-56 rounded-full border border-cyan-400/30 border-dashed animate-spin-slow"
        style={{ transform: 'rotateX(75deg) translateZ(-30px)' }}
      />

      {/* Floating 3D Hologram Container with Tilt */}
      <div className="relative preserve-3d flex items-center justify-center">
        {/* Orbital Ring 1: Cyan Axis */}
        <div
          className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-spin-slow pointer-events-none"
          style={{
            transform: 'rotate3d(1, 1, 0, 55deg)',
            animationDuration: '14s'
          }}
        />

        {/* Orbital Ring 2: Purple Axis */}
        <div
          className="absolute w-60 h-60 sm:w-68 sm:h-68 rounded-full border-2 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-spin-slow pointer-events-none"
          style={{
            transform: 'rotate3d(1, -1, 0, 65deg)',
            animationDuration: '10s',
            animationDirection: 'reverse'
          }}
        />

        {/* Orbital Ring 3: Indigo Axis */}
        <div
          className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.4)] animate-spin-slow pointer-events-none"
          style={{
            transform: 'rotate3d(0, 1, 1, 70deg)',
            animationDuration: '18s'
          }}
        />

        {/* Central 3D Glowing Core Sphere */}
        <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_50px_rgba(34,211,238,0.4)] overflow-hidden flex items-center justify-center p-1.5 backdrop-blur-xl group hover:scale-105 transition-transform duration-500 cursor-pointer">
          <img
            src="/logo-3d.png"
            alt="3D Hologram Orb"
            className="w-full h-full object-cover rounded-full group-hover:rotate-12 transition-transform duration-700"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-400/10 to-transparent pointer-events-none" />
        </div>

        {/* Floating 3D Event Pill Badges around the Hologram */}
        <div
          className="absolute -top-6 -left-12 sm:-left-20 z-20 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 border border-cyan-500/40 shadow-xl shadow-cyan-500/15 backdrop-blur-md flex items-center gap-2 animate-float text-xs text-white"
          style={{ animationDelay: '0s' }}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">🚀 Hackathons</span>
          <span className="text-[10px] text-cyan-300 font-mono">36-Hr</span>
        </div>

        <div
          className="absolute top-1/2 -right-14 sm:-right-24 z-20 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 border border-purple-500/40 shadow-xl shadow-purple-500/15 backdrop-blur-md flex items-center gap-2 animate-float text-xs text-white"
          style={{ animationDelay: '1.2s' }}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-bold">✨ AI Labs & Masterclasses</span>
        </div>

        <div
          className="absolute -bottom-4 -left-8 sm:-left-16 z-20 px-3.5 py-1.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 border border-emerald-500/40 shadow-xl shadow-emerald-500/15 backdrop-blur-md flex items-center gap-2 animate-float text-xs text-white"
          style={{ animationDelay: '2.4s' }}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">🎓 Verified Credentials</span>
        </div>
      </div>
    </div>
  );
};
