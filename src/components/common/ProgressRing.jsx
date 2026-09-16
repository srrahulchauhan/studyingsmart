import React from 'react';

export default function ProgressRing({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  variant = 'indigo', // 'indigo' | 'emerald' | 'cyan' | 'rose' | 'amber' | 'purple'
  children = null,
  showPercentage = true,
  className = '',
}) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  const colorConfig = {
    indigo: {
      stroke: 'url(#grad-indigo)',
      glow: 'glow-filter-indigo',
      from: '#6366f1',
      to: '#818cf8',
    },
    emerald: {
      stroke: 'url(#grad-emerald)',
      glow: 'glow-filter-emerald',
      from: '#10b981',
      to: '#34d399',
    },
    cyan: {
      stroke: 'url(#grad-cyan)',
      glow: '',
      from: '#06b6d4',
      to: '#22d3ee',
    },
    rose: {
      stroke: 'url(#grad-rose)',
      glow: '',
      from: '#f43f5e',
      to: '#fb7185',
    },
    amber: {
      stroke: 'url(#grad-amber)',
      glow: 'glow-filter-amber',
      from: '#f59e0b',
      to: '#fbbf24',
    },
    purple: {
      stroke: 'url(#grad-purple)',
      glow: '',
      from: '#8b5cf6',
      to: '#a78bfa',
    },
  };

  const config = colorConfig[variant] || colorConfig.indigo;
  const gradId = `grad-${variant}-${size}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 origin-center"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.from} />
            <stop offset="100%" stopColor={config.to} />
          </linearGradient>
        </defs>

        {/* Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-white/[0.06] transition-colors"
          fill="transparent"
        />

        {/* Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        {children ? (
          children
        ) : showPercentage ? (
          <span className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100">
            {Math.round(normalizedProgress)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
