import React, { useState } from 'react';
import { useTimer } from '../../context/TimerContext';
import { formatSeconds } from '../../utils/dateUtils';
import {
  LayoutDashboard,
  GraduationCap,
  Timer,
  CalendarRange,
  Menu,
  X,
  Target,
  Trophy,
  History,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Database,
  FolderKanban,
  CalendarDays,
  CheckSquare,
  Link2,
  Maximize2,
  UserCheck,
} from 'lucide-react';

export default function MobileNav({ currentView, onNavigate }) {
  const { activeSession, elapsedActiveSeconds } = useTimer();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'timer', label: 'Timer', icon: Timer, isTimer: true },
    { id: 'timetable', label: 'Schedule', icon: CalendarRange },
    { id: 'more', label: 'More', icon: Menu, isMenu: true },
  ];

  const drawerItems = [
    { id: 'plans', label: 'Study Plans', icon: FolderKanban },
    { id: 'subjects', label: 'Subjects', icon: CalendarDays },
    { id: 'topics', label: 'Topics', icon: CheckSquare },
    { id: 'resources', label: 'Resources', icon: Link2 },
    { id: 'focus', label: 'Focus Mode', icon: Maximize2 },
    { id: 'calendar', label: 'Study Calendar', icon: CalendarRange },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'targets', label: 'Daily Targets', icon: Target },
    { id: 'goals', label: 'Course Goals', icon: Trophy },
    { id: 'history', label: 'Study History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          const isTimerActive = tab.isTimer && activeSession;

          if (tab.isMenu) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="flex flex-col items-center justify-center p-1.5 text-slate-500 dark:text-slate-400"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center p-1.5 relative transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isTimerActive ? 'animate-pulse text-emerald-500' : ''}`} />
                {isTimerActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">
                {isTimerActive ? formatSeconds(elapsedActiveSeconds) : tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* More Items Drawer */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-100">
                All Navigation Modules
              </span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate(item.id);
                      setIsDrawerOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-medium text-left transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
