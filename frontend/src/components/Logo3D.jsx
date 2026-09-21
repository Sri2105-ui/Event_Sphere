import React from 'react';

export const Logo3D = ({
  size = 'md',
  showText = true,
  animate = true,
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const imgSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* 3D Orb Icon Container */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Neon Outer Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-500/30 to-purple-500/30 blur-md group-hover:blur-lg group-hover:scale-110 transition-all duration-500" />
        
        {/* 3D Glass Sphere Image */}
        <div
          className={`relative ${imgSize} rounded-full overflow-hidden border border-cyan-400/40 shadow-lg shadow-cyan-500/20 bg-slate-950/80 backdrop-blur-md group-hover:scale-105 group-hover:border-cyan-300 transition-all duration-300 ${
            animate ? 'hover:animate-float' : ''
          }`}
          style={{
            boxShadow: '0 0 20px -3px rgba(34, 211, 238, 0.4), inset 0 0 12px rgba(99, 102, 241, 0.3)'
          }}
        >
          <img
            src="/logo-3d.png"
            alt="EventSphere 3D Emblem"
            className="w-full h-full object-cover transform scale-105 group-hover:rotate-6 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center">
            Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]">Sphere</span>
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 -mt-1">
            Collegiate Events OS
          </span>
        </div>
      )}
    </div>
  );
};
