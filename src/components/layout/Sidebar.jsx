import React from 'react';
import { useTimer } from '../../context/TimerContext';
import { useStudy } from '../../context/StudyContext';
import { formatSeconds } from '../../utils/dateUtils';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Layers,
  FileText,
  Library,
  Timer,
  CalendarClock,
  CalendarDays,
  CalendarCheck,
  Target,
  Trophy,
  History,
  ChartNoAxesCombined,
  FileBarChart,
  Focus,
  Settings,
  Database,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckSquare,
} from 'lucide-react';

export default function Sidebar({ currentView, onNavigate, isCollapsed, setIsCollapsed }) {
  const { activeSession, elapsedActiveSeconds } = useTimer();
  const { courses, pendingTasks, revisions } = useStudy();

  const activePendingCount = pendingTasks ? pendingTasks.filter((t) => t.status === 'Pending').length : 0;
  const activeRevisionCount = revisions ? revisions.filter((r) => r.status !== 'Completed').length : 0;

  // Requirement 8: Exact Professional Icons
  const navSections = [
    {
      group: 'Core Study',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'courses', label: 'Courses', icon: BookOpen, badge: courses.length },
        { id: 'plans', label: 'Study Plans', icon: ClipboardList },
        { id: 'subjects', label: 'Subjects', icon: Layers },
        { id: 'topics', label: 'Topics', icon: FileText },
        {
          id: 'revision',
          label: 'Revision Control',
          icon: BookOpen,
          badge: activeRevisionCount > 0 ? activeRevisionCount : null,
          badgeColor: 'bg-purple-500 text-white',
        },
        {
          id: 'pending-tasks',
          label: 'Pending Tasks',
          icon: CheckSquare,
          badge: activePendingCount > 0 ? activePendingCount : null,
          badgeColor: 'bg-rose-500 text-white animate-pulse',
        },
        { id: 'resources', label: 'Resources', icon: Library },
      ],
    },
    {
      group: 'Focus & Scheduling',
      items: [
        {
          id: 'timer',
          label: 'Study Timer',
          icon: Timer,
          isTimerItem: true,
        },
        { id: 'timetable', label: 'Timetable', icon: CalendarClock },
        { id: 'calendar', label: 'Calendar', icon: CalendarDays },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
      ],
    },
    {
      group: 'Intelligence & Reports',
      items: [
        { id: 'targets', label: 'Targets', icon: Target },
        { id: 'goals', label: 'Goals', icon: Trophy },
        { id: 'history', label: 'History', icon: History },
        { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
        { id: 'reports', label: 'Reports', icon: FileBarChart },
      ],
    },
    {
      group: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'backup', label: 'Backup', icon: Database },
      ],
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white/80 dark:bg-[#070b16]/80 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/[0.08] transition-all duration-300 z-20 shrink-0 ${
        isCollapsed ? 'w-[72px]' : 'w-[250px]'
      }`}
    >
      {/* Collapse / Expand Toggle Button */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-white/[0.07]">
        {!isCollapsed && (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">
            Command Menu
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors ml-auto"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.group}>
            {!isCollapsed && (
              <div className="px-3 mb-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                {section.group}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                const isTimerRunning = item.isTimerItem && activeSession?.status === 'running';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`w-full group relative flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-md shadow-sky-500/30'
                        : isTimerRunning
                        ? 'bg-sky-500/15 text-sky-400 border border-sky-400/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Glowing Left Indicator on Active */}
                    {isActive && (
                      <span className="absolute left-1 w-1 h-3.5 rounded-full bg-white shadow-sm" />
                    )}

                    <div className="relative shrink-0 flex items-center justify-center">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isTimerRunning ? 'animate-spin' : ''
                        }`}
                      />
                      {isTimerRunning && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-white dark:ring-[#0c111d] animate-ping" />
                      )}
                    </div>

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!isCollapsed && isTimerRunning && (
                      <span className="font-mono text-[10px] font-bold text-sky-400">
                        {formatSeconds(elapsedActiveSeconds)}
                      </span>
                    )}

                    {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
