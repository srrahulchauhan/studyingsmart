import React from 'react';

export default function GlassCard({
  children,
  className = '',
  glow = 'none',
  hoverEffect = true,
  onClick = null,
  header = null,
  ...props
}) {
  const glowClasses = {
    none: '',
    indigo: 'hover:border-indigo-500/40 hover:shadow-glow-indigo',
    emerald: 'hover:border-emerald-500/40 hover:shadow-glow-emerald',
    cyan: 'hover:border-cyan-500/40 hover:shadow-glow-cyan',
    amber: 'hover:border-amber-500/40 hover:shadow-glow-amber',
    rose: 'hover:border-rose-500/40 hover:shadow-glow-rose',
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-3xl backdrop-blur-xl transition-all duration-300 ${
        hoverEffect ? 'command-card' : ''
      } bg-white/80 dark:bg-[#111728]/80 border border-slate-200/80 dark:border-white/[0.07] shadow-sm dark:shadow-glass ${
        glowClasses[glow] || ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={header ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
