import React from 'react';

export default function StudyVisualizer({ status = 'idle', className = '' }) {
  // status: 'running' | 'paused' | 'break' | 'idle'

  return (
    <div className={`flex flex-col items-center justify-center py-2 ${className}`}>
      {/* Waveform Bars */}
      <div className="flex items-center gap-1.5 h-7 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06]">
        {status === 'running' && (
          <>
            <span className="w-1 bg-emerald-500 rounded-full h-full wave-bar"></span>
            <span className="w-1 bg-emerald-500 rounded-full h-full wave-bar"></span>
            <span className="w-1 bg-teal-400 rounded-full h-full wave-bar"></span>
            <span className="w-1 bg-cyan-400 rounded-full h-full wave-bar"></span>
            <span className="w-1 bg-indigo-500 rounded-full h-full wave-bar"></span>
            <span className="w-1 bg-teal-400 rounded-full h-full wave-bar"></span>
            <span className="w-1 bg-emerald-500 rounded-full h-full wave-bar"></span>
            <span className="w-1 bg-emerald-500 rounded-full h-full wave-bar"></span>
          </>
        )}

        {status === 'paused' && (
          <div className="flex items-center gap-1 px-1">
            <span className="w-1 h-3 bg-amber-400/80 rounded-full"></span>
            <span className="w-1 h-4 bg-amber-400/80 rounded-full"></span>
            <span className="w-1 h-3 bg-amber-400/80 rounded-full"></span>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider ml-1">
              Study Paused
            </span>
          </div>
        )}

        {status === 'break' && (
          <div className="flex items-center gap-1 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-[10px] font-bold text-cyan-500 dark:text-cyan-400 uppercase tracking-wider ml-1">
              Break In Progress
            </span>
          </div>
        )}

        {status === 'idle' && (
          <div className="flex items-center gap-1 px-2 text-[10px] font-medium text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span>Focus Engine Ready</span>
          </div>
        )}
      </div>
    </div>
  );
}
