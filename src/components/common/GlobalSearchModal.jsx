import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  Search,
  X,
  GraduationCap,
  FolderKanban,
  CalendarDays,
  CheckSquare,
  Link2,
  History,
  ArrowRight,
} from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const { courses, studyPlans, subjects, topics, resources, studySessions } = useStudy();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate(null, 'search');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingCourses = q ? courses.filter(c => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)) : [];
  const matchingPlans = q ? studyPlans.filter(p => p.name.toLowerCase().includes(q)) : [];
  const matchingSubjects = q ? subjects.filter(s => s.name.toLowerCase().includes(q)) : [];
  const matchingTopics = q ? topics.filter(t => t.name.toLowerCase().includes(q)) : [];
  const matchingResources = q ? resources.filter(r => r.name.toLowerCase().includes(q) || r.url?.toLowerCase().includes(q)) : [];

  const totalResults =
    matchingCourses.length +
    matchingPlans.length +
    matchingSubjects.length +
    matchingTopics.length +
    matchingResources.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, subjects, topics, resources..."
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 text-xs">
          {!q ? (
            <div className="py-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Type to search anything across your study workspace.</p>
              <span className="text-[11px] text-slate-500 mt-1 inline-block">
                Press ESC to close
              </span>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p>No results found for "{query}".</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Courses */}
              {matchingCourses.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Courses ({matchingCourses.length})
                  </div>
                  <div className="space-y-1">
                    {matchingCourses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onNavigate('courses');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-slate-400">{c.category || 'General'}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects */}
              {matchingSubjects.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Subjects ({matchingSubjects.length})
                  </div>
                  <div className="space-y-1">
                    {matchingSubjects.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          onNavigate('subjects');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.name}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {matchingTopics.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    Topics ({matchingTopics.length})
                  </div>
                  <div className="space-y-1">
                    {matchingTopics.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          onNavigate('topics');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {t.name}
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {t.status}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {matchingResources.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" />
                    Resources ({matchingResources.length})
                  </div>
                  <div className="space-y-1">
                    {matchingResources.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          onNavigate('resources');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {r.name}
                          </div>
                          <span className="text-[10px] text-slate-400">{r.type}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
