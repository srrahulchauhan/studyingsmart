import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Plus,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Link2,
  CalendarRange,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Search,
  Command,
  ArrowRight,
  Sparkles,
  Maximize2,
  Target,
  Trophy,
} from 'lucide-react';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onStartStudy,
  onOpenNewCourse,
  onOpenNewSubject,
  onOpenNewTopic,
  onOpenNewResource,
  onOpenNewTimetable,
  onNavigate,
}) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const commands = [
    {
      id: 'start-study',
      title: 'Start Study Session',
      category: 'Focus',
      icon: Play,
      shortcut: 'S',
      action: () => {
        onClose();
        if (onStartStudy) onStartStudy();
        else onNavigate('timer');
      },
    },
    {
      id: 'focus-mode',
      title: 'Launch Distraction-Free Focus Mode',
      category: 'Focus',
      icon: Maximize2,
      shortcut: 'F',
      action: () => {
        onClose();
        onNavigate('focus');
      },
    },
    {
      id: 'new-course',
      title: 'Create New Course',
      category: 'Workspace',
      icon: Plus,
      shortcut: 'C',
      action: () => {
        onClose();
        if (onOpenNewCourse) onOpenNewCourse();
      },
    },
    {
      id: 'new-subject',
      title: 'Add New Subject',
      category: 'Workspace',
      icon: CalendarDays,
      shortcut: 'B',
      action: () => {
        onClose();
        if (onOpenNewSubject) onOpenNewSubject();
      },
    },
    {
      id: 'new-topic',
      title: 'Add New Topic',
      category: 'Workspace',
      icon: CheckSquare,
      shortcut: 'T',
      action: () => {
        onClose();
        if (onOpenNewTopic) onOpenNewTopic();
      },
    },
    {
      id: 'new-resource',
      title: 'Add New Resource Link',
      category: 'Workspace',
      icon: Link2,
      shortcut: 'R',
      action: () => {
        onClose();
        if (onOpenNewResource) onOpenNewResource();
      },
    },
    {
      id: 'open-timetable',
      title: 'Open Timetable Builder',
      category: 'Navigation',
      icon: CalendarRange,
      action: () => {
        onClose();
        onNavigate('timetable');
      },
    },
    {
      id: 'open-analytics',
      title: 'Open Analytics Dashboard',
      category: 'Navigation',
      icon: BarChart3,
      action: () => {
        onClose();
        onNavigate('analytics');
      },
    },
    {
      id: 'open-reports',
      title: 'Open Reports & Export',
      category: 'Navigation',
      icon: FileSpreadsheet,
      action: () => {
        onClose();
        onNavigate('reports');
      },
    },
    {
      id: 'open-targets',
      title: 'Open Targets & Goals',
      category: 'Navigation',
      icon: Target,
      action: () => {
        onClose();
        onNavigate('targets');
      },
    },
    {
      id: 'open-settings',
      title: 'Open System Settings',
      category: 'Navigation',
      icon: Settings,
      action: () => {
        onClose();
        onNavigate('settings');
      },
    },
  ];

  const filtered = commands.filter((cmd) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden command-card"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <Command className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="What do you want to do? (Type to filter...)"
            className="flex-1 bg-transparent text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <span className="hidden sm:inline-flex text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-400">
            ESC to close
          </span>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2.5 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching command found for "{search}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-white/[0.05] text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{cmd.title}</div>
                      <div
                        className={`text-[10px] ${
                          isSelected ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {cmd.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmd.shortcut && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400'
                        }`}
                      >
                        {cmd.shortcut}
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'opacity-100' : 'opacity-30'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span className="font-semibold text-indigo-500 dark:text-indigo-400">
            StudyFlow Command Center
          </span>
        </div>
      </div>
    </div>
  );
}
