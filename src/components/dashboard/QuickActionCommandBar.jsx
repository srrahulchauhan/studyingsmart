import React from 'react';
import {
  Play,
  BookOpen,
  FolderKanban,
  CalendarDays,
  CheckSquare,
  Link2,
  CalendarRange,
  Zap,
} from 'lucide-react';
import GlassIcon from '../common/GlassIcon';

export default function QuickActionCommandBar({
  onStartStudy,
  onOpenNewCourse,
  onOpenNewPlan,
  onOpenNewSubject,
  onOpenNewTopic,
  onOpenNewResource,
  onOpenNewTimetable,
}) {
  // Requirement 20:
  // Course → Sky Blue, Study Plan → Pink, Subject → White, Topic → Yellow, Resource → Sky Blue, Timetable → Pink, Start Study → Yellow/Sky Blue
  const actions = [
    {
      id: 'start',
      label: '▶ Start Study',
      shortcut: '⌘+S',
      icon: Play,
      accent: 'border-yellow-400/40 bg-gradient-to-r from-sky-500/20 to-yellow-500/15 hover:border-yellow-400 text-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.25)]',
      iconVariant: 'yellow',
      action: onStartStudy,
    },
    {
      id: 'course',
      label: 'Course',
      shortcut: 'Alt+C',
      icon: BookOpen,
      accent: 'border-sky-400/30 bg-sky-500/[0.08] hover:border-sky-400 text-sky-300 hover:shadow-[0_0_20px_rgba(14,165,233,0.25)]',
      iconVariant: 'sky',
      action: onOpenNewCourse,
    },
    {
      id: 'plan',
      label: 'Study Plan',
      shortcut: 'Alt+P',
      icon: FolderKanban,
      accent: 'border-pink-400/30 bg-pink-500/[0.08] hover:border-pink-400 text-pink-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.25)]',
      iconVariant: 'pink',
      action: onOpenNewPlan,
    },
    {
      id: 'subject',
      label: 'Subject',
      shortcut: 'Alt+B',
      icon: CalendarDays,
      accent: 'border-white/20 bg-white/[0.06] hover:border-white/40 text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]',
      iconVariant: 'white',
      action: onOpenNewSubject,
    },
    {
      id: 'topic',
      label: 'Topic',
      shortcut: 'Alt+T',
      icon: CheckSquare,
      accent: 'border-yellow-400/30 bg-yellow-500/[0.08] hover:border-yellow-400 text-yellow-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.22)]',
      iconVariant: 'yellow',
      action: onOpenNewTopic,
    },
    {
      id: 'resource',
      label: 'Resource',
      shortcut: 'Alt+R',
      icon: Link2,
      accent: 'border-sky-400/30 bg-sky-500/[0.08] hover:border-sky-400 text-sky-300 hover:shadow-[0_0_20px_rgba(14,165,233,0.25)]',
      iconVariant: 'sky',
      action: onOpenNewResource,
    },
    {
      id: 'timetable',
      label: 'Timetable',
      shortcut: 'Alt+M',
      icon: CalendarRange,
      accent: 'border-pink-400/30 bg-pink-500/[0.08] hover:border-pink-400 text-pink-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.25)]',
      iconVariant: 'pink',
      action: onOpenNewTimetable,
    },
  ];

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.09] p-4 sm:p-5 shadow-sm backdrop-blur-2xl command-card">
      <div className="flex items-center gap-2 mb-3.5">
        <GlassIcon icon={Zap} variant="sky" size="sm" />
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Command Quick Actions
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.action}
              className={`p-3 rounded-2xl border backdrop-blur-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-1 active:scale-95 group ${act.accent}`}
            >
              <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black tracking-tight leading-tight">{act.label}</span>
              <span className="text-[9px] font-mono opacity-60 group-hover:opacity-100">
                {act.shortcut}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
