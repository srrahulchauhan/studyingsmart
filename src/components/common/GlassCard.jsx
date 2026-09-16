import React from 'react';

export default function GlassCard({
  children,
  className = '',
  glow = 'none', // 'none' | 'sky' | 'yellow' | 'pink' | 'red' | 'white' | 'indigo'
  hoverEffect = true,
  onClick = null,
  header = null,
  ...props
}) {
  const glowClasses = {
    none: '',
    sky: 'hover:border-sky-400/40 hover:shadow-[0_0_32px_-6px_rgba(14,165,233,0.32)]',
    yellow: 'hover:border-yellow-400/40 hover:shadow-[0_0_32px_-6px_rgba(234,179,8,0.28)]',
    pink: 'hover:border-pink-400/40 hover:shadow-[0_0_32px_-6px_rgba(236,72,153,0.28)]',
    red: 'hover:border-red-400/40 hover:shadow-[0_0_32px_-6px_rgba(239,68,68,0.28)]',
    white: 'hover:border-white/30 hover:shadow-[0_0_28px_-6px_rgba(255,255,255,0.18)]',
    // Fallback aliases
    indigo: 'hover:border-sky-400/40 hover:shadow-[0_0_32px_-6px_rgba(14,165,233,0.32)]',
    emerald: 'hover:border-sky-400/40 hover:shadow-[0_0_32px_-6px_rgba(14,165,233,0.32)]',
    amber: 'hover:border-yellow-400/40 hover:shadow-[0_0_32px_-6px_rgba(234,179,8,0.28)]',
    rose: 'hover:border-pink-400/40 hover:shadow-[0_0_32px_-6px_rgba(236,72,153,0.28)]',
    cyan: 'hover:border-sky-400/40 hover:shadow-[0_0_32px_-6px_rgba(14,165,233,0.32)]',
  };

  // Base persistent subtle glows
  const persistentGlowClasses = {
    none: '',
    sky: 'shadow-[0_0_35px_-8px_rgba(14,165,233,0.22)] border-sky-400/20',
    yellow: 'shadow-[0_0_35px_-8px_rgba(234,179,8,0.18)] border-yellow-400/20',
    pink: 'shadow-[0_0_35px_-8px_rgba(236,72,153,0.18)] border-pink-400/20',
    red: 'shadow-[0_0_35px_-8px_rgba(239,68,68,0.18)] border-red-400/20',
    white: 'shadow-[0_0_28px_-8px_rgba(255,255,255,0.12)] border-white/20',
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-3xl backdrop-blur-2xl transition-all duration-300 ${
        hoverEffect ? 'command-card' : ''
      } bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.09] shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] ${
        glowClasses[glow] || ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.07] flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={header ? 'p-5 sm:p-6' : ''}>{children}</div>
    </div>
  );
}
