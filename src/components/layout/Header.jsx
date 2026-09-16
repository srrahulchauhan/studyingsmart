import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';
import { formatSeconds, formatDate } from '../../utils/dateUtils';
import {
  BookOpen,
  ChevronDown,
  Plus,
  Flame,
  Search,
  Bell,
  Sun,
  Moon,
  Settings as SettingsIcon,
  Play,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Command,
  User,
  Coffee,
} from 'lucide-react';

export default function Header({
  onOpenQuickActions,
  onOpenSearch,
  onOpenCommandPalette,
  onNavigate,
  onOpenNewCourseModal,
}) {
  const {
    courses,
    activeCourseId,
    setActiveCourseId,
    streak,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    settings,
    updateSettings,
  } = useStudy();

  const { activeSession, elapsedActiveSeconds } = useTimer();

  // Time & Date live ticker
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dropdown states
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const courseDropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setIsCourseDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCourse = courses.find((c) => c.id === activeCourseId);
  const unreadNotifs = notifications.filter((n) => !n.read);

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
  };

  // Status indicator
  const isStudying = activeSession?.status === 'running';
  const isBreak = activeSession?.status === 'break';
  const isPaused = activeSession?.status === 'paused';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
      {/* Left: Breadcrumbs & Currently Learning Course Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="hidden xl:block">
            <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              StudyFlow
              <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                OS
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Command Center
            </div>
          </div>
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-white/10" />

        {/* "Currently Learning" Course Dropdown */}
        <div className="relative" ref={courseDropdownRef}>
          <button
            type="button"
            onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 text-xs transition-all shadow-sm max-w-[200px] sm:max-w-[280px]"
          >
            <div className="text-left truncate">
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">
                Currently Learning
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">
                {courses.length === 0
                  ? 'No Courses Created'
                  : activeCourse
                  ? activeCourse.name
                  : 'All Courses Overview'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
          </button>

          {isCourseDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 sm:w-72 bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-fadeIn command-card">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Course Context
              </div>

              {courses.length === 0 ? (
                <div className="px-4 py-3 text-slate-500 dark:text-slate-400 text-center">
                  <p>No courses created yet.</p>
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCourseId(null);
                      setIsCourseDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.04] ${
                      activeCourseId === null
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">🌐 All Courses Overview</span>
                    {activeCourseId === null && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  </button>

                  {courses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        setActiveCourseId(course.id);
                        setIsCourseDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.04] ${
                        activeCourseId === course.id
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{course.name}</span>
                      {activeCourseId === course.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 dark:border-white/[0.06] mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCourseDropdownOpen(false);
                    if (onOpenNewCourseModal) onOpenNewCourseModal();
                  }}
                  className="w-full text-left px-3 py-2 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Create New Course
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search & Command Palette Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
        <button
          type="button"
          onClick={onOpenCommandPalette || onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 text-xs text-slate-400 transition-all shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search or type a command...</span>
          </div>
          <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-white/[0.08] text-slate-500 dark:text-slate-300">
            <Command className="w-3 h-3" />K
          </span>
        </button>
      </div>

      {/* Right: Live Status Indicator, Time, Streak, Notifs, Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Special Live Status Indicator (Requirement 47) */}
        <div className="hidden lg:flex items-center">
          {isStudying && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>● STUDYING</span>
              <span className="text-emerald-500 font-mono">
                {formatSeconds(elapsedActiveSeconds)}
              </span>
            </div>
          )}

          {isBreak && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold shadow-sm animate-pulse">
              <Coffee className="w-3 h-3 text-cyan-500" />
              <span>● ON BREAK</span>
            </div>
          )}

          {isPaused && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>● PAUSED</span>
            </div>
          )}

          {!activeSession && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>○ IDLE</span>
            </div>
          )}
        </div>

        {/* Live Date & Time Clock */}
        <div className="hidden xl:flex flex-col items-end text-right px-1">
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100">
            {currentTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: settings.timeFormat === '12h',
            })}
          </span>
          <span className="text-[10px] text-slate-400">
            {formatDate(currentTime)}
          </span>
        </div>

        {/* Current Streak */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold"
          title={`Current Study Streak: ${streak.current} Days`}
        >
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{streak.current}d</span>
        </div>

        {/* Command Palette Mobile Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette || onOpenSearch}
          className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          title="Command Palette (Ctrl + K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Drawer Trigger */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#090d16]"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-3 z-50 text-xs animate-fadeIn command-card">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Notification Center
                </span>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
                {notifications.length === 0 ? (
                  <div className="py-6 px-4 text-center text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors ${
                        !n.read ? 'bg-indigo-500/[0.05]' : ''
                      }`}
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {n.type === 'success' && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        )}
                        {n.type === 'info' && (
                          <Info className="w-3 h-3 text-indigo-500 shrink-0" />
                        )}
                        {n.type === 'warning' && (
                          <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                        <span className="truncate">{n.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-slate-400 mt-1 block font-mono">
                        {new Date(n.time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {settings.darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Profile Avatar / Settings */}
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm hover:scale-105 transition-transform"
          title="Profile & Settings"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
