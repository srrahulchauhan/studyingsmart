import React, { useState, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  Bell,
  Clock,
  ArrowRight,
  X,
  AlertCircle,
  Calendar,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import GlassIcon from '../common/GlassIcon';

export default function PendingTasksPopupModal({ onNavigate }) {
  const { pendingTasks, courses, subjects } = useStudy();
  const [isOpen, setIsOpen] = useState(false);

  const activePendingList = pendingTasks.filter((t) => t.status === 'Pending');

  useEffect(() => {
    // Only check if there are pending tasks and it wasn't dismissed this session
    const isDismissed = sessionStorage.getItem('studyflow_pending_tasks_dismissed');
    if (!isDismissed && activePendingList.length > 0) {
      // Gentle 1s delay so the dashboard renders smoothly first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activePendingList.length]);

  const handleDismiss = () => {
    sessionStorage.setItem('studyflow_pending_tasks_dismissed', 'true');
    setIsOpen(false);
  };

  const handleContinue = () => {
    sessionStorage.setItem('studyflow_pending_tasks_dismissed', 'true');
    setIsOpen(false);
    if (onNavigate) {
      onNavigate('pending-tasks');
    }
  };

  if (!isOpen || activePendingList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white/95 dark:bg-[#090e1c]/95 border-2 border-amber-400/50 dark:border-amber-500/40 p-6 sm:p-7 shadow-[0_20px_60px_rgba(234,179,8,0.25)] text-left relative overflow-hidden animate-scaleIn">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-500 dark:text-amber-400 flex items-center justify-center text-2xl shadow-sm animate-bounce">
              🔔
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Pending Tasks Available
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                Some tasks from yesterday are still pending.
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 my-3">
          Incomplete tasks automatically carry forward until you mark them completed. You can continue them now or catch up later.
        </p>

        {/* Pending Tasks Quick Preview List */}
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 my-3">
          {activePendingList.slice(0, 4).map((task) => {
            const course = courses.find((c) => c.id === task.courseId);
            const subject = subjects.find((s) => s.id === task.subjectId);
            return (
              <div
                key={task.id}
                className="p-3 rounded-2xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    {course && <span className="text-sky-500 dark:text-sky-400 font-bold truncate">{course.name}</span>}
                    {task.originalDate && <span>📅 {task.originalDate}</span>}
                    {task.estimatedMinutes && <span>⏱️ {task.estimatedMinutes}m</span>}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/25 shrink-0">
                  Pending
                </span>
              </div>
            );
          })}
          {activePendingList.length > 4 && (
            <div className="text-[11px] text-center text-slate-400 font-bold py-1">
              + {activePendingList.length - 4} more tasks in backlog
            </div>
          )}
        </div>

        {/* Action Buttons: Continue Pending & Later */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.08] mt-4">
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>▶ Continue Pending</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="py-3.5 px-6 rounded-2xl bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all active:scale-[0.98]"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
