import React from 'react';
import {
  Plus,
  Play,
  BookOpen,
  CalendarClock,
  Layers,
  FileText,
  Library,
  CalendarDays,
  Target,
  Trophy,
  X,
  Sparkles,
} from 'lucide-react';
import GlassIcon from './GlassIcon';

export default function QuickActionsModal({
  isOpen,
  onClose,
  onOpenNewCourse,
  onOpenNewPlan,
  onOpenNewSubject,
  onOpenNewTopic,
  onOpenNewResource,
  onOpenNewTimetable,
  onOpenNewTarget,
  onOpenNewGoal,
  onStartStudy,
}) {
  if (!isOpen) return null;

  const actions = [
    {
      title: 'Start Study Session',
      desc: 'Launch focus timer on any topic',
      icon: Play,
      variant: 'sky',
      handler: () => {
        onClose();
        onStartStudy();
      },
    },
    {
      title: 'New Course',
      desc: 'Define curriculum or exam track',
      icon: BookOpen,
      variant: 'sky',
      handler: () => {
        onClose();
        onOpenNewCourse();
      },
    },
    {
      title: 'New Study Plan',
      desc: 'Create 30-day or milestone plan',
      icon: CalendarClock,
      variant: 'pink',
      handler: () => {
        onClose();
        onOpenNewPlan();
      },
    },
    {
      title: 'Add Subject',
      desc: 'Add a subject to your course',
      icon: Layers,
      variant: 'white',
      handler: () => {
        onClose();
        onOpenNewSubject();
      },
    },
    {
      title: 'Add Topic',
      desc: 'Break subjects into discrete topics',
      icon: FileText,
      variant: 'yellow',
      handler: () => {
        onClose();
        onOpenNewTopic();
      },
    },
    {
      title: 'Add Resource',
      desc: 'Save YouTube, Docs, GitHub or Notes',
      icon: Library,
      variant: 'sky',
      handler: () => {
        onClose();
        onOpenNewResource();
      },
    },
    {
      title: 'Schedule Timetable',
      desc: 'Set recurring study slots for the week',
      icon: CalendarDays,
      variant: 'pink',
      handler: () => {
        onClose();
        onOpenNewTimetable();
      },
    },
    {
      title: 'Set Target',
      desc: 'Configure daily or weekly study hours',
      icon: Target,
      variant: 'yellow',
      handler: () => {
        onClose();
        onOpenNewTarget();
      },
    },
    {
      title: 'Create Goal',
      desc: 'Set long-term learning goals',
      icon: Trophy,
      variant: 'pink',
      handler: () => {
        onClose();
        onOpenNewGoal();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white/95 dark:bg-[#080d1a]/95 border border-slate-200/90 dark:border-white/15 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl p-6 transition-all animate-scaleIn">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Quick Actions & Feature Add
              </h2>
              <p className="text-xs text-slate-400">
                Create an item or launch your study timer instantly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 max-h-[70vh] overflow-y-auto pr-1">
          {actions.map((act) => (
            <button
              key={act.title}
              type="button"
              onClick={act.handler}
              className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.035] hover:bg-sky-500/10 dark:hover:bg-sky-500/15 border border-slate-200/80 dark:border-white/[0.08] hover:border-sky-400/50 dark:hover:border-sky-400/50 text-left transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md"
            >
              <GlassIcon icon={act.icon} variant={act.variant} size="sm" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                  {act.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{act.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
