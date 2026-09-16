import React from 'react';

export default function ProgressRing({
  progress = 0,
  secondaryProgress = null,
  size = 120,
  strokeWidth = 8,
  variant = 'sky', // 'sky' | 'yellow' | 'pink' | 'red' | 'white'
  children = null,
  showPercentage = true,
  className = '',
}) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  // Secondary ring for dual indicators (e.g. target vs actual)
  const secondaryRadius = radius - strokeWidth - 2;
  const secondaryCircumference = Math.max(0, secondaryRadius * 2 * Math.PI);
  const normalizedSecondary = secondaryProgress !== null ? Math.min(100, Math.max(0, secondaryProgress)) : null;
  const secondaryDashoffset = secondaryCircumference - ((normalizedSecondary || 0) / 100) * secondaryCircumference;

  const colorConfig = {
    sky: {
      from: '#0ea5e9',
      to: '#38bdf8',
      shadow: 'rgba(14, 165, 233, 0.4)',
    },
    yellow: {
      from: '#eab308',
      to: '#fde047',
      shadow: 'rgba(234, 179, 8, 0.4)',
    },
    pink: {
      from: '#ec4899',
      to: '#f472b6',
      shadow: 'rgba(236, 72, 153, 0.4)',
    },
    red: {
      from: '#ef4444',
      to: '#f87171',
      shadow: 'rgba(239, 68, 68, 0.4)',
    },
    white: {
      from: '#ffffff',
      to: '#e2e8f0',
      shadow: 'rgba(255, 255, 255, 0.25)',
    },
    // Aliases
    indigo: { from: '#0ea5e9', to: '#38bdf8', shadow: 'rgba(14, 165, 233, 0.4)' },
    emerald: { from: '#0ea5e9', to: '#38bdf8', shadow: 'rgba(14, 165, 233, 0.4)' },
    cyan: { from: '#0ea5e9', to: '#38bdf8', shadow: 'rgba(14, 165, 233, 0.4)' },
    rose: { from: '#ec4899', to: '#f472b6', shadow: 'rgba(236, 72, 153, 0.4)' },
    amber: { from: '#eab308', to: '#fde047', shadow: 'rgba(234, 179, 8, 0.4)' },
    purple: { from: '#ec4899', to: '#f472b6', shadow: 'rgba(236, 72, 153, 0.4)' },
  };

  const config = colorConfig[variant] || colorConfig.sky;
  const gradId = `grad-${variant}-${size}`;
  const secGradId = `sec-grad-${variant}-${size}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 origin-center overflow-visible"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.from} />
            <stop offset="100%" stopColor={config.to} />
          </linearGradient>
          <linearGradient id={secGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>

        {/* Outer Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200/60 dark:text-white/[0.08]"
          fill="transparent"
        />

        {/* Primary Progress Ring */}
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
            filter: `drop-shadow(0 0 6px ${config.shadow})`,
          }}
        />

        {/* Optional Secondary Inner Ring (Requirement 17: yellow secondary accent) */}
        {normalizedSecondary !== null && secondaryRadius > 6 && (
          <>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={secondaryRadius}
              stroke="currentColor"
              strokeWidth={Math.max(2, strokeWidth - 4)}
              className="text-slate-200/40 dark:text-white/[0.04]"
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={secondaryRadius}
              stroke={`url(#${secGradId})`}
              strokeWidth={Math.max(2, strokeWidth - 4)}
              strokeDasharray={secondaryCircumference}
              strokeDashoffset={secondaryDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </>
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        {children ? (
          children
        ) : showPercentage ? (
          <span className="text-sm font-black tracking-tight text-white drop-shadow-sm font-mono">
            {Math.round(normalizedProgress)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
