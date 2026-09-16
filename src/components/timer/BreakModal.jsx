import React from 'react';
import { useTimer } from '../../context/TimerContext';
import { formatSeconds } from '../../utils/dateUtils';
import { Coffee, Play, X, Utensils, Moon, Smartphone, User, Sparkles } from 'lucide-react';

export default function BreakModal() {
  const {
    activeSession,
    isBreakModalOpen,
    elapsedBreakSeconds,
    currentBreakReason,
    setCurrentBreakReason,
    endBreak,
    resumeStudy,
  } = useTimer();

  if (!isBreakModalOpen || !activeSession || activeSession.status !== 'break') {
    return null;
  }

  const reasons = [
    { label: 'Tea', icon: Coffee },
    { label: 'Food', icon: Utensils },
    { label: 'Rest', icon: Moon },
    { label: 'Phone', icon: Smartphone },
    { label: 'Personal', icon: User },
    { label: 'Other', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl animate-pulse">
          ☕
        </div>

        <span className="inline-block px-3 py-1 mb-2 text-xs font-semibold tracking-wider text-amber-700 dark:text-amber-300 uppercase bg-amber-50 dark:bg-amber-900/40 rounded-full border border-amber-200 dark:border-amber-800">
          Break Mode Active
        </span>

        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Resting & Recharging
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Break time is excluded and will never count towards your study hours.
        </p>

        {/* Live Break Duration */}
        <div className="my-6 py-4 px-6 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="text-xs font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
            Break Duration
          </div>
          <div className="text-4xl font-mono font-extrabold text-amber-600 dark:text-amber-400">
            {formatSeconds(elapsedBreakSeconds)}
          </div>
        </div>

        {/* Break Reasons */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
            Break Reason:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {reasons.map((r) => {
              const Icon = r.icon;
              const isSelected = currentBreakReason === r.label;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setCurrentBreakReason(r.label)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={resumeStudy}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-medium rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            Resume Study Now
          </button>
          <button
            type="button"
            onClick={endBreak}
            className="w-full py-2.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            End Break & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
