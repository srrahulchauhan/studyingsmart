import React, { useState } from 'react';
import { Copy, X, CheckSquare } from 'lucide-react';

export default function DuplicateCourseModal({ isOpen, course, onDuplicate, onClose }) {
  const [copySubjects, setCopySubjects] = useState(true);
  const [copyTopics, setCopyTopics] = useState(true);
  const [copyResources, setCopyResources] = useState(true);
  const [copyTimetable, setCopyTimetable] = useState(true);
  const [copyTargets, setCopyTargets] = useState(true);

  if (!isOpen || !course) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onDuplicate(course.id, {
      copySubjects,
      copyTopics,
      copyResources,
      copyTimetable,
      copyTargets,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Duplicate Course
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4">
          Creating a new revision or variant of <span className="font-semibold text-slate-800 dark:text-slate-200">{course.name}</span>. Historical sessions and attendance records are never copied.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={copySubjects}
                onChange={(e) => setCopySubjects(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Include Subjects</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                disabled={!copySubjects}
                checked={copyTopics && copySubjects}
                onChange={(e) => setCopyTopics(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
              />
              <span>Include Topics (reset to Pending)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                disabled={!copyTopics || !copySubjects}
                checked={copyResources && copyTopics && copySubjects}
                onChange={(e) => setCopyResources(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
              />
              <span>Include Resources</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={copyTimetable}
                onChange={(e) => setCopyTimetable(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Include Timetable Schedule</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={copyTargets}
                onChange={(e) => setCopyTargets(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Include Target Durations</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25"
            >
              Duplicate Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
