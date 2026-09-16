import React, { useState } from 'react';
import AnimatedNumber from './AnimatedNumber';
import GlassIcon from './GlassIcon';
import { ArrowUpRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  displayValue,
  description,
  icon: Icon,
  progress = null,
  trend = null,
  variant = 'sky', // 'sky' | 'yellow' | 'pink' | 'red' | 'white'
  sparklineData = [2, 4, 3, 7, 5, 8, 6],
  footerText = null,
  onClick = null,
  live = true,
  isLiveActive = false,
}) {
  const [clicked, setClicked] = useState(false);

  const colorMap = {
    sky: {
      borderHover: 'hover:border-sky-400 dark:hover:border-sky-400/80 hover:shadow-[0_10px_35px_rgba(14,165,233,0.35)]',
      iconVariant: 'sky',
      stroke: '#38bdf8',
      pulseDot: 'bg-sky-400',
      textColor: 'text-sky-600 dark:text-sky-400',
      progressBg: 'bg-gradient-to-r from-sky-500 to-sky-400',
      glow: 'rgba(14,165,233,0.3)',
    },
    yellow: {
      borderHover: 'hover:border-yellow-400 dark:hover:border-yellow-400/80 hover:shadow-[0_10px_35px_rgba(234,179,8,0.35)]',
      iconVariant: 'yellow',
      stroke: '#facc15',
      pulseDot: 'bg-yellow-400',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      progressBg: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
      glow: 'rgba(234,179,8,0.3)',
    },
    pink: {
      borderHover: 'hover:border-pink-400 dark:hover:border-pink-400/80 hover:shadow-[0_10px_35px_rgba(236,72,153,0.35)]',
      iconVariant: 'pink',
      stroke: '#f472b6',
      pulseDot: 'bg-pink-400',
      textColor: 'text-pink-600 dark:text-pink-400',
      progressBg: 'bg-gradient-to-r from-pink-500 to-pink-400',
      glow: 'rgba(236,72,153,0.3)',
    },
    red: {
      borderHover: 'hover:border-red-400 dark:hover:border-red-400/80 hover:shadow-[0_10px_35px_rgba(239,68,68,0.35)]',
      iconVariant: 'red',
      stroke: '#f87171',
      pulseDot: 'bg-red-400',
      textColor: 'text-red-600 dark:text-red-400',
      progressBg: 'bg-gradient-to-r from-red-500 to-red-400',
      glow: 'rgba(239,68,68,0.3)',
    },
    white: {
      borderHover: 'hover:border-slate-300 dark:hover:border-white/50 hover:shadow-[0_10px_35px_rgba(255,255,255,0.25)]',
      iconVariant: 'white',
      stroke: '#ffffff',
      pulseDot: 'bg-white',
      textColor: 'text-slate-700 dark:text-slate-200',
      progressBg: 'bg-white',
      glow: 'rgba(255,255,255,0.2)',
    },
    // Aliases
    indigo: {
      borderHover: 'hover:border-sky-400 dark:hover:border-sky-400/80 hover:shadow-[0_10px_35px_rgba(14,165,233,0.35)]',
      iconVariant: 'sky',
      stroke: '#38bdf8',
      pulseDot: 'bg-sky-400',
      textColor: 'text-sky-600 dark:text-sky-400',
      progressBg: 'bg-gradient-to-r from-sky-500 to-sky-400',
      glow: 'rgba(14,165,233,0.3)',
    },
    cyan: {
      borderHover: 'hover:border-sky-400 dark:hover:border-sky-400/80 hover:shadow-[0_10px_35px_rgba(14,165,233,0.35)]',
      iconVariant: 'sky',
      stroke: '#38bdf8',
      pulseDot: 'bg-sky-400',
      textColor: 'text-sky-600 dark:text-sky-400',
      progressBg: 'bg-gradient-to-r from-sky-500 to-sky-400',
      glow: 'rgba(14,165,233,0.3)',
    },
    amber: {
      borderHover: 'hover:border-yellow-400 dark:hover:border-yellow-400/80 hover:shadow-[0_10px_35px_rgba(234,179,8,0.35)]',
      iconVariant: 'yellow',
      stroke: '#facc15',
      pulseDot: 'bg-yellow-400',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      progressBg: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
      glow: 'rgba(234,179,8,0.3)',
    },
    rose: {
      borderHover: 'hover:border-pink-400 dark:hover:border-pink-400/80 hover:shadow-[0_10px_35px_rgba(236,72,153,0.35)]',
      iconVariant: 'pink',
      stroke: '#f472b6',
      pulseDot: 'bg-pink-400',
      textColor: 'text-pink-600 dark:text-pink-400',
      progressBg: 'bg-gradient-to-r from-pink-500 to-pink-400',
      glow: 'rgba(236,72,153,0.3)',
    },
  };

  const c = colorMap[variant] || colorMap.sky;
  const gradientId = React.useId();

  // Dynamic Telemetry Sparkline Generation
  const cleanData = sparklineData && sparklineData.length >= 2 ? sparklineData : [2, 3, 5, 4, 7];
  const max = Math.max(...cleanData, 1);
  const min = Math.min(...cleanData, 0);
  const range = max - min || 1;
  const width = 64;
  const height = 24;

  const pointsArray = cleanData.map((val, idx) => {
    const x = (idx / (cleanData.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return [x, y];
  });

  const polylinePoints = pointsArray.map(([x, y]) => `${x},${y}`).join(' ');
  const areaPoints = `0,${height} ${polylinePoints} ${width},${height}`;

  const lastPoint = pointsArray[pointsArray.length - 1] || [width, height / 2];

  const handleClick = (e) => {
    if (!onClick) return;
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
    onClick(e);
  };

  return (
    <div
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={onClick ? `Click to open ${title}` : title}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick(e);
        }
      }}
      className={`group relative rounded-3xl bg-white/90 dark:bg-white/[0.045] border border-slate-200/90 dark:border-white/[0.09] p-5 backdrop-blur-2xl shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] transition-all duration-300 flex flex-col justify-between overflow-hidden select-none ${
        c.borderHover
      } ${
        isLiveActive ? 'animate-electric-border ring-2 ring-sky-400/40' : ''
      } ${
        onClick
          ? 'cursor-pointer hover:-translate-y-1.5 hover:shadow-lg active:scale-[0.97]'
          : ''
      } ${clicked ? 'ring-2 ring-offset-2 ring-sky-400 scale-[0.98]' : ''}`}
    >
      {/* Subtle Live Shimmer Light on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] to-white/[0.12] dark:from-white/[0.02] dark:to-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Top Accent Gradient Border Tint */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${c.stroke}, transparent)` }}
      />

      <div>
        {/* Top bar: title + Live Radar Pulse Badge + GlassIcon + Click Arrow */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 truncate">
            {live && (
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border shadow-xs transition-colors ${
                  isLiveActive
                    ? 'bg-sky-500/15 border-sky-400/40'
                    : 'bg-slate-100/90 dark:bg-white/[0.07] border-slate-200/90 dark:border-white/10'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-sonar absolute inline-flex h-full w-full rounded-full ${c.pulseDot}`} />
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.pulseDot} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${c.pulseDot}`} />
                </span>
                <span className={`text-[9px] font-black font-mono tracking-widest ${c.textColor}`}>
                  {isLiveActive ? 'ACTIVE' : 'LIVE'}
                </span>
              </div>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white truncate transition-colors">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onClick && (
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 group-hover:bg-sky-50 dark:group-hover:bg-sky-500/15 transition-all duration-200">
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            )}
            <GlassIcon icon={Icon} variant={c.iconVariant} size="sm" />
          </div>
        </div>

        {/* Main Value + Dynamic Telemetry Sparkline with Moving Dash & Pulsing Dot */}
        <div className="flex items-baseline justify-between gap-2 my-1">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:scale-[1.02] origin-left transition-transform duration-200 font-sans">
            {displayValue !== undefined ? (
              displayValue
            ) : typeof value === 'number' ? (
              <AnimatedNumber value={value} />
            ) : (
              value
            )}
          </div>

          {/* Animated SVG Sparkline with Telemetry Dot */}
          <div className="shrink-0 group-hover:scale-105 transition-transform duration-300">
            <svg width={width} height={height} className="overflow-visible opacity-85 group-hover:opacity-100 transition-opacity">
              <defs>
                <linearGradient id={`grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.stroke} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={c.stroke} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Gradient Fill */}
              <polygon points={areaPoints} fill={`url(#grad-${gradientId})`} />

              {/* Glowing Base Stroke */}
              <polyline
                fill="none"
                stroke={c.stroke}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
                className="animate-flow-dash transition-all duration-500"
              />

              {/* Live Telemetry Dot with Sonar Wave at Latest Point */}
              <circle
                cx={lastPoint[0]}
                cy={lastPoint[1]}
                r="4.5"
                fill={c.stroke}
                className="animate-sonar"
                opacity="0.8"
              />
              <circle
                cx={lastPoint[0]}
                cy={lastPoint[1]}
                r="3"
                fill={c.stroke}
                className="animate-ping"
                opacity="0.75"
              />
              <circle
                cx={lastPoint[0]}
                cy={lastPoint[1]}
                r="2.5"
                fill="#ffffff"
                stroke={c.stroke}
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            {description}
          </p>
        )}
      </div>

      {/* Progress bar or Footer with "Click to view" hover badge */}
      {(progress !== null || footerText || onClick) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
          {progress !== null && (
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 group-hover:brightness-110 ${c.progressBg}`}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>{Math.round(progress)}% reached</span>
                {footerText && <span>{footerText}</span>}
              </div>
            </div>
          )}

          {progress === null && (
            <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
              <span>{footerText || 'Telemetry active'}</span>
              {onClick && (
                <span className="text-sky-500 dark:text-sky-400 text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5">
                  Open →
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
