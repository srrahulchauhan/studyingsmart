import React from 'react';
import AnimatedNumber from './AnimatedNumber';

export default function StatCard({
  title,
  value,
  displayValue,
  description,
  icon: Icon,
  progress = null,
  trend = null, // e.g. '+12%'
  variant = 'indigo', // 'indigo' | 'emerald' | 'cyan' | 'amber' | 'rose' | 'purple'
  sparklineData = [2, 4, 3, 7, 5, 8, 6], // subtle SVG curve
  footerText = null,
  onClick = null,
}) {
  const colorMap = {
    indigo: {
      bg: 'from-indigo-500/[0.08] to-transparent',
      border: 'hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-500',
      stroke: '#6366f1',
      progressBg: 'bg-indigo-500',
    },
    emerald: {
      bg: 'from-emerald-500/[0.08] to-transparent',
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
      stroke: '#10b981',
      progressBg: 'bg-emerald-500',
    },
    cyan: {
      bg: 'from-cyan-500/[0.08] to-transparent',
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-500',
      stroke: '#06b6d4',
      progressBg: 'bg-cyan-500',
    },
    amber: {
      bg: 'from-amber-500/[0.08] to-transparent',
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-500',
      stroke: '#f59e0b',
      progressBg: 'bg-amber-500',
    },
    rose: {
      bg: 'from-rose-500/[0.08] to-transparent',
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-500',
      stroke: '#f43f5e',
      progressBg: 'bg-rose-500',
    },
    purple: {
      bg: 'from-purple-500/[0.08] to-transparent',
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-500',
      stroke: '#8b5cf6',
      progressBg: 'bg-purple-500',
    },
  };

  const c = colorMap[variant] || colorMap.indigo;

  // Mini sparkline points generator
  const max = Math.max(...sparklineData, 1);
  const min = Math.min(...sparklineData, 0);
  const range = max - min || 1;
  const width = 60;
  const height = 22;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 backdrop-blur-xl shadow-sm command-card transition-all flex flex-col justify-between ${
        c.border
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div>
        {/* Top bar: title + icon */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
            {title}
          </span>
          <div className={`p-2 rounded-xl ${c.iconBg} shrink-0`}>
            {Icon && <Icon className="w-4 h-4" />}
          </div>
        </div>

        {/* Value + Sparkline */}
        <div className="flex items-baseline justify-between gap-2 my-1">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {displayValue !== undefined ? (
              displayValue
            ) : typeof value === 'number' ? (
              <AnimatedNumber value={value} />
            ) : (
              value
            )}
          </div>

          {/* Sparkline curve */}
          <div className="shrink-0">
            <svg width={width} height={height} className="overflow-visible opacity-70">
              <polyline
                fill="none"
                stroke={c.stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        </div>

        {description && (
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        )}
      </div>

      {/* Progress bar or Footer */}
      {(progress !== null || footerText) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
          {progress !== null && (
            <div className="space-y-1">
              <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${c.progressBg}`}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>{Math.round(progress)}% reached</span>
                {footerText && <span>{footerText}</span>}
              </div>
            </div>
          )}

          {progress === null && footerText && (
            <div className="text-[10px] text-slate-400 font-medium">
              {footerText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
