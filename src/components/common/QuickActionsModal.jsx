import React from 'react';
import {
  Plus,
  Play,
  GraduationCap,
  FolderKanban,
  CalendarDays,
  CheckSquare,
  Link2,
  CalendarRange,
  Target,
  Trophy,
  X,
} from 'lucide-react';

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
      color: 'bg-emerald-500 text-white',
      handler: () => {
        onClose();
        onStartStudy();
      },
    },
    {
      title: 'New Course',
      desc: 'Define a new curriculum or exam',
      icon: GraduationCap,
      color: 'bg-indigo-500 text-white',
      handler: () => {
        onClose();
        onOpenNewCourse();
      },
    },
    {
      title: 'New Study Plan',
      desc: 'Create a 30-day or milestone plan',
      icon: FolderKanban,
      color: 'bg-blue-500 text-white',
      handler: () => {
        onClose();
        onOpenNewPlan();
      },
    },
    {
      title: 'Add Subject',
      desc: 'Add a subject to your course',
      icon: CalendarDays,
      color: 'bg-violet-500 text-white',
      handler: () => {
        onClose();
        onOpenNewSubject();
      },
    },
    {
      title: 'Add Topic',
      desc: 'Break subjects into discrete topics',
      icon: CheckSquare,
      color: 'bg-sky-500 text-white',
      handler: () => {
        onClose();
        onOpenNewTopic();
      },
    },
    {
      title: 'Add Resource',
      desc: 'Save YouTube, Docs, GitHub or Notes',
      icon: Link2,
      color: 'bg-teal-500 text-white',
      handler: () => {
        onClose();
        onOpenNewResource();
      },
    },
    {
      title: 'Schedule Timetable',
      desc: 'Set recurring study slots for the week',
      icon: CalendarRange,
      color: 'bg-amber-500 text-white',
      handler: () => {
        onClose();
        onOpenNewTimetable();
      },
    },
    {
      title: 'Set Target',
      desc: 'Configure daily or weekly study hours',
      icon: Target,
      color: 'bg-rose-500 text-white',
      handler: () => {
        onClose();
        onOpenNewTarget();
      },
    },
    {
      title: 'Create Goal',
      desc: 'Set long-term learning goals',
      icon: Trophy,
      color: 'bg-purple-500 text-white',
      handler: () => {
        onClose();
        onOpenNewGoal();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              ⚡ Quick Actions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create an item or launch your study timer instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl bg-slate-100 dark:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 max-h-[70vh] overflow-y-auto">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                type="button"
                onClick={act.handler}
                className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 text-left transition-all group"
              >
                <div
                  className={`w-9 h-9 rounded-xl ${act.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {act.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{act.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
