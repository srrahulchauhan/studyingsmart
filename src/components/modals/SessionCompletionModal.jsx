import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Coffee,
  Sparkles,
  BookOpen,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  Play,
  Save,
  ArrowRight,
} from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils';

export default function SessionCompletionModal({
  isOpen,
  sessionSummary,
  onSaveSession,
  onContinueStudy,
}) {
  const [markTopicCompleted, setMarkTopicCompleted] = useState(true);

  if (!isOpen || !sessionSummary) return null;

  const {
    courseName = 'General Course',
    subjectName = 'General Subject',
    topicName = 'Study Session',
    actualStudyMinutes = 0,
    breakMinutes = 0,
    totalSessionMinutes = 0,
    todaySubjectMinutes = 0,
    courseTotalMinutes = 0,
    topicProgressPercent = 100,
  } = sessionSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden command-card">
        {/* Glowing Top Banner */}
        <div className="relative p-6 text-center bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent border-b border-slate-100 dark:border-white/[0.06]">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Session Complete
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
            {subjectName}
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {topicName}
          </p>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            Course: {courseName}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-2.5 text-center">
            {/* Actual Study */}
            <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-500/20">
              <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-0.5 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Actual Study
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatDuration(actualStudyMinutes)}
              </div>
            </div>

            {/* Break Time */}
            <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-500/20">
              <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 mb-0.5 flex items-center justify-center gap-1">
                <Coffee className="w-3 h-3" />
                Break
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatDuration(breakMinutes)}
              </div>
            </div>

            {/* Total Session */}
            <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.06]">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                Total Elapsed
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {formatDuration(totalSessionMinutes)}
              </div>
            </div>
          </div>

          {/* Rollup Accumulations */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Today's {subjectName}:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatDuration(todaySubjectMinutes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Course Total Accumulation:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatDuration(courseTotalMinutes)}
              </span>
            </div>
            {topicProgressPercent !== null && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-slate-400">Topic Progress:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {topicProgressPercent}%
                </span>
              </div>
            )}
          </div>

          {/* Optional Mark Topic Complete toggle */}
          {topicName && (
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40 cursor-pointer">
              <input
                type="checkbox"
                checked={markTopicCompleted}
                onChange={(e) => setMarkTopicCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Mark topic as <span className="text-indigo-600 dark:text-indigo-400 font-bold">Completed</span> in curriculum
              </span>
            </label>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onContinueStudy()}
              className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              Continue Study
            </button>
            <button
              type="button"
              onClick={() => onSaveSession(markTopicCompleted)}
              className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <Save className="w-3.5 h-3.5" />
              Save Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
