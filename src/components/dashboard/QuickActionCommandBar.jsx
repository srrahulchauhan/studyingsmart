import React from 'react';
import {
  Play,
  Plus,
  BookOpen,
  FolderKanban,
  CalendarDays,
  CheckSquare,
  Link2,
  CalendarRange,
  Zap,
} from 'lucide-react';

export default function QuickActionCommandBar({
  onStartStudy,
  onOpenNewCourse,
  onOpenNewPlan,
  onOpenNewSubject,
  onOpenNewTopic,
  onOpenNewResource,
  onOpenNewTimetable,
}) {
  const actions = [
    {
      id: 'start',
      label: 'Start Study',
      shortcut: '⌘+S',
      icon: Play,
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25',
      action: onStartStudy,
    },
    {
      id: 'course',
      label: 'New Course',
      shortcut: 'Alt+C',
      icon: BookOpen,
      color: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25',
      action: onOpenNewCourse,
    },
    {
      id: 'plan',
      label: 'Study Plan',
      shortcut: 'Alt+P',
      icon: FolderKanban,
      color: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/25',
      action: onOpenNewPlan,
    },
    {
      id: 'subject',
      label: 'Subject',
      shortcut: 'Alt+B',
      icon: CalendarDays,
      color: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/25',
      action: onOpenNewSubject,
    },
    {
      id: 'topic',
      label: 'Topic',
      shortcut: 'Alt+T',
      icon: CheckSquare,
      color: 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/25',
      action: onOpenNewTopic,
    },
    {
      id: 'resource',
      label: 'Resource',
      shortcut: 'Alt+R',
      icon: Link2,
      color: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25',
      action: onOpenNewResource,
    },
    {
      id: 'timetable',
      label: 'Timetable',
      shortcut: 'Alt+M',
      icon: CalendarRange,
      color: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25',
      action: onOpenNewTimetable,
    },
  ];

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-4 sm:p-5 shadow-sm backdrop-blur-xl command-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
          Command Quick Actions
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.action}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md transition-all hover:scale-105 active:scale-95 group ${act.color}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-bold leading-tight">{act.label}</span>
              <span className="text-[9px] font-mono opacity-70 group-hover:opacity-100">
                {act.shortcut}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
