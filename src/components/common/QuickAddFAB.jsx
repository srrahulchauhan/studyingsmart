import React, { useState, useEffect } from 'react';
import {
  Plus,
  BookOpen,
  Layers,
  FileText,
  Target,
  CalendarClock,
  Library,
  CalendarDays,
  Play,
  X,
  Sparkles,
  Command,
} from 'lucide-react';
import GlassIcon from './GlassIcon';
import { useTimer } from '../../context/TimerContext';

export default function QuickAddFAB({
  onOpenNewCourse,
  onOpenNewPlan,
  onOpenNewSubject,
  onOpenNewTopic,
  onOpenNewResource,
  onOpenNewTimetable,
  onOpenNewTarget,
  onStartStudy,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { activeSession } = useTimer();

  // Keyboard shortcut '+' or 'Alt+A' to toggle Quick Add menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle on '+' when not typing in an input
      if (
        (e.key === '+' || (e.altKey && e.key.toLowerCase() === 'a')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const featureActions = [
    {
      title: 'New Course',
      desc: 'Define curriculum or exam track',
      icon: BookOpen,
      variant: 'sky',
      shortcut: 'Alt+C',
      handler: () => {
        setIsOpen(false);
        onOpenNewCourse();
      },
    },
    {
      title: 'New Subject',
      desc: 'Add module to active course',
      icon: Layers,
      variant: 'sky',
      shortcut: 'Alt+B',
      handler: () => {
        setIsOpen(false);
        onOpenNewSubject();
      },
    },
    {
      title: 'New Topic',
      desc: 'Add chapter or study unit',
      icon: FileText,
      variant: 'yellow',
      shortcut: 'Alt+T',
      handler: () => {
        setIsOpen(false);
        onOpenNewTopic();
      },
    },
    {
      title: 'Set Target / Goal',
      desc: 'Configure daily study milestone',
      icon: Target,
      variant: 'yellow',
      shortcut: 'Target',
      handler: () => {
        setIsOpen(false);
        onOpenNewTarget();
      },
    },
    {
      title: 'New Study Plan',
      desc: 'Create multi-day roadmap',
      icon: CalendarClock,
      variant: 'pink',
      shortcut: 'Plan',
      handler: () => {
        setIsOpen(false);
        onOpenNewPlan();
      },
    },
    {
      title: 'Add Resource',
      desc: 'Save PDF, video lecture or link',
      icon: Library,
      variant: 'sky',
      shortcut: 'Alt+R',
      handler: () => {
        setIsOpen(false);
        onOpenNewResource();
      },
    },
    {
      title: 'Schedule Timetable',
      desc: 'Add recurring routine slot',
      icon: CalendarDays,
      variant: 'pink',
      shortcut: 'Alt+M',
      handler: () => {
        setIsOpen(false);
        onOpenNewTimetable();
      },
    },
    {
      title: 'Launch Focus Timer',
      desc: 'Instant study countdown mode',
      icon: Play,
      variant: 'white',
      shortcut: 'Timer',
      handler: () => {
        setIsOpen(false);
        onStartStudy();
      },
    },
  ];

  return (
    <>
      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md animate-fadeIn transition-opacity"
        />
      )}

      {/* Floating Action Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
        {/* Expanded Speed-Dial Menu Panel */}
        {isOpen && (
          <div className="w-[320px] sm:w-[400px] mb-2 p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-[#090e1c]/95 border border-slate-200/90 dark:border-white/15 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] animate-scaleIn origin-bottom-right transition-all">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    Add New Feature
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Quickly add curriculum items or launch timer
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Action Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {featureActions.map((action, idx) => (
                <button
                  key={action.title}
                  type="button"
                  onClick={action.handler}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.04] hover:bg-sky-500/10 dark:hover:bg-sky-500/15 border border-slate-200/80 dark:border-white/[0.08] hover:border-sky-400/50 text-left transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <GlassIcon icon={action.icon} variant={action.variant} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 truncate">
                        {action.title}
                      </span>
                      {action.shortcut && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-white/[0.08] text-slate-500 dark:text-slate-300 shrink-0">
                          {action.shortcut}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom Keyboard Tip */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3" /> Press <kbd className="font-mono font-bold text-sky-400">+</kbd> anywhere to toggle
              </span>
              <span className="font-bold text-sky-500 dark:text-sky-400 hover:underline cursor-pointer" onClick={() => setIsOpen(false)}>
                Close
              </span>
            </div>
          </div>
        )}

        {/* The Animated Plus (+) Floating Action Button */}
        <div className="flex items-center gap-3">
          {/* Quick Start Study Button (Visible alongside Plus button on desktop) */}
          <button
            type="button"
            onClick={onStartStudy}
            className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-full bg-white/90 dark:bg-[#070c18]/90 border border-slate-200 dark:border-white/15 backdrop-blur-xl shadow-lg hover:shadow-sky-500/20 text-slate-800 dark:text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all duration-200 group"
            title="Start Study Session"
          >
            <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </div>
            <span>{activeSession ? 'LIVE TIMER' : 'START STUDY'}</span>
            {activeSession?.status === 'running' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
          </button>

          {/* Primary Animated Plus Button */}
          <div className="relative group">
            {/* Ambient Spinning Iridescent Halo */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-sky-400 via-pink-400 to-yellow-400 opacity-70 group-hover:opacity-100 blur-md animate-spin-slow transition-opacity duration-500 pointer-events-none" />

            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900/95 dark:bg-[#070c18]/95 border-2 border-white/30 text-white flex items-center justify-center shadow-[0_10px_35px_rgba(14,165,233,0.45)] hover:shadow-[0_12px_45px_rgba(14,165,233,0.7)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none ${
                isOpen ? 'rotate-45 bg-pink-600/90 border-pink-400' : ''
              }`}
              title={isOpen ? 'Close Menu' : 'Add New Feature (+)'}
              aria-label="Add Feature"
            >
              <Plus
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 ${
                  isOpen ? 'text-white' : 'text-sky-300 group-hover:text-white group-hover:rotate-90'
                }`}
              />

              {/* Pulsing Dot Ring when closed and idle */}
              {!isOpen && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="animate-sonar absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-400 border border-white/60" />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
