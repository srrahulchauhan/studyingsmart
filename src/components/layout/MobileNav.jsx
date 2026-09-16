import React, { useState } from 'react';
import { useTimer } from '../../context/TimerContext';
import { formatSeconds } from '../../utils/dateUtils';
import {
  LayoutDashboard,
  BookOpen,
  Timer,
  CalendarClock,
  Menu,
  X,
  Target,
  Trophy,
  History,
  ChartNoAxesCombined,
  FileBarChart,
  Settings,
  Database,
  ClipboardList,
  Layers,
  FileText,
  Library,
  Focus,
  CalendarDays,
  CalendarCheck,
} from 'lucide-react';

export default function MobileNav({ currentView, onNavigate }) {
  const { activeSession, elapsedActiveSeconds } = useTimer();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'timer', label: 'Timer', icon: Timer, isTimer: true },
    { id: 'timetable', label: 'Schedule', icon: CalendarClock },
    { id: 'more', label: 'More', icon: Menu, isMenu: true },
  ];

  const drawerItems = [
    { id: 'plans', label: 'Study Plans', icon: ClipboardList },
    { id: 'subjects', label: 'Subjects', icon: Layers },
    { id: 'topics', label: 'Topics', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Library },
    { id: 'focus', label: 'Focus Mode', icon: Focus },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'targets', label: 'Daily Targets', icon: Target },
    { id: 'goals', label: 'Course Goals', icon: Trophy },
    { id: 'history', label: 'Study History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
    { id: 'reports', label: 'Reports & Export', icon: FileBarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#070b16]/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/[0.08] px-2 py-1.5 flex items-center justify-around shadow-2xl">
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
                className="flex flex-col items-center justify-center p-1.5 text-slate-400 hover:text-white transition-colors"
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
                  ? 'text-sky-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isTimerActive ? 'animate-pulse text-sky-400' : ''}`} />
                {isTimerActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
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
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#090d18] rounded-t-3xl border-t border-slate-200 dark:border-white/10 p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.07]">
              <span className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                All Navigation Modules
              </span>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-100 dark:bg-white/[0.06]"
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
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold text-left transition-all ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-400 border border-sky-400/30'
                        : 'bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent'
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
