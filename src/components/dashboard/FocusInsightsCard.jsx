import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatDuration } from '../../utils/dateUtils';
import { Sparkles, Clock, Coffee, TrendingUp, CheckCircle2, Flame, Award } from 'lucide-react';

export default function FocusInsightsCard({ onNavigate }) {
  const { studySessions, activeCourseId } = useStudy();

  const filteredSessions = studySessions.filter(
    (s) => !activeCourseId || s.courseId === activeCourseId
  );

  if (filteredSessions.length === 0) {
    return (
      <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card flex flex-col justify-between">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Focus Insights
            </h3>
            <p className="text-[11px] text-slate-400">
              Verified behavioral metrics
            </p>
          </div>
        </div>

        <div className="py-8 text-center text-slate-400 text-xs">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Focus insights will appear after your first study session.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            No synthetic algorithms. Genuine metrics calculated strictly from your active sessions.
          </p>
        </div>
      </div>
    );
  }

  // Real calculations
  const totalFocusMinutes = filteredSessions.reduce(
    (sum, s) => sum + (s.actualStudyDuration || 0),
    0
  );
  const totalBreakMinutes = filteredSessions.reduce(
    (sum, s) => sum + (s.breakDuration || 0),
    0
  );
  const avgSessionMinutes = Math.round(totalFocusMinutes / filteredSessions.length);
  const longestSessionMinutes = filteredSessions.reduce(
    (max, s) => Math.max(max, s.actualStudyDuration || 0),
    0
  );

  // Group by date for consistency
  const uniqueDates = new Set(filteredSessions.map((s) => s.date).filter(Boolean));
  const dailyConsistencyCount = uniqueDates.size;

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Focus Insights
            </h3>
            <p className="text-[11px] text-slate-400">
              Verified behavioral metrics
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Real Data
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
        {/* Total Focus Time */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-indigo-500" />
            Total Focus Time
          </span>
          <div className="text-base font-black text-slate-900 dark:text-white">
            {formatDuration(totalFocusMinutes)}
          </div>
        </div>

        {/* Average Session */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Average Session
          </span>
          <div className="text-base font-black text-slate-900 dark:text-white">
            {formatDuration(avgSessionMinutes)}
          </div>
        </div>

        {/* Longest Session */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
            <Award className="w-3 h-3 text-amber-500" />
            Longest Session
          </span>
          <div className="text-base font-black text-slate-900 dark:text-white">
            {formatDuration(longestSessionMinutes)}
          </div>
        </div>

        {/* Break Time */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
            <Coffee className="w-3 h-3 text-cyan-500" />
            Break Time
          </span>
          <div className="text-base font-black text-slate-900 dark:text-white">
            {formatDuration(totalBreakMinutes)}
          </div>
        </div>

        {/* Sessions Completed */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
            <CheckCircle2 className="w-3 h-3 text-teal-500" />
            Sessions Completed
          </span>
          <div className="text-base font-black text-slate-900 dark:text-white">
            {filteredSessions.length}
          </div>
        </div>

        {/* Daily Consistency */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
            <Flame className="w-3 h-3 text-rose-500" />
            Active Days
          </span>
          <div className="text-base font-black text-slate-900 dark:text-white">
            {dailyConsistencyCount} days
          </div>
        </div>
      </div>
    </div>
  );
}
