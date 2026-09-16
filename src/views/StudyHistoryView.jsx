import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration, formatDate, formatTime } from '../utils/dateUtils';
import {
  History,
  Search,
  Filter,
  Trash2,
  Calendar,
  Clock,
  Coffee,
  CheckCircle2,
  ArrowUpDown,
} from 'lucide-react';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

export default function StudyHistoryView({ onNavigate }) {
  const {
    courses,
    subjects,
    topics,
    activeCourseId,
    studySessions,
    deleteStudySession,
  } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourseId, setFilterCourseId] = useState(activeCourseId || 'All');
  const [filterSubjectId, setFilterSubjectId] = useState('All');
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const availableSubjects = subjects.filter(s => filterCourseId === 'All' || s.courseId === filterCourseId);

  const filteredSessions = studySessions.filter((s) => {
    if (filterCourseId !== 'All' && s.courseId !== filterCourseId) return false;
    if (filterSubjectId !== 'All' && s.subjectId !== filterSubjectId) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const c = courses.find(item => item.id === s.courseId)?.name?.toLowerCase() || '';
      const subj = subjects.find(item => item.id === s.subjectId)?.name?.toLowerCase() || '';
      const top = topics.find(item => item.id === s.topicId)?.name?.toLowerCase() || '';
      if (!c.includes(q) && !subj.includes(q) && !top.includes(q)) return false;
    }

    return true;
  });

  const totalStudyMinutes = filteredSessions.reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
  const totalBreakMinutes = filteredSessions.reduce((sum, s) => sum + (s.breakDuration || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <History className="w-4 h-4" />
            Audit & Timeline
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Study Session History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every focus session is logged with exact active study duration, start/end timestamps, and rest periods.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 block">Total Filtered Study</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {formatDuration(totalStudyMinutes)}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div>
            <span className="text-[10px] text-slate-400 block">Sessions Count</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {filteredSessions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, subject, or course..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
          />
        </div>

        {/* Filter Course */}
        <select
          value={filterCourseId}
          onChange={(e) => {
            setFilterCourseId(e.target.value);
            setFilterSubjectId('All');
          }}
          className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full sm:w-auto"
        >
          <option value="All">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Filter Subject */}
        <select
          value={filterSubjectId}
          onChange={(e) => setFilterSubjectId(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full sm:w-auto"
        >
          <option value="All">All Subjects</option>
          {availableSubjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Sessions Table or Empty State */}
      {filteredSessions.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
          <History className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No study sessions recorded yet.
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
            Start a timer in Study Timer or Focus Mode. Completed and stopped sessions will automatically appear here.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('timer')}
            className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25"
          >
            Start Your First Study Session
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Course / Subject</th>
                  <th className="p-3.5">Topic</th>
                  <th className="p-3.5">Total Elapsed</th>
                  <th className="p-3.5">Break Time</th>
                  <th className="p-3.5">Actual Study</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSessions.map((session) => {
                  const course = courses.find(c => c.id === session.courseId);
                  const subj = subjects.find(s => s.id === session.subjectId);
                  const topic = topics.find(t => t.id === session.topicId);

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(session.date)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatTime(session.startTime)} – {formatTime(session.endTime)}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {course ? course.name : '—'}
                        </div>
                        <div className="text-[10px] text-slate-400">{subj ? subj.name : 'General'}</div>
                      </td>

                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {topic ? topic.name : '—'}
                      </td>

                      <td className="p-3.5 font-mono text-slate-500">
                        {formatDuration(session.sessionDuration)}
                      </td>

                      <td className="p-3.5 font-mono text-amber-600 dark:text-amber-400">
                        {session.breakDuration > 0 ? formatDuration(session.breakDuration) : '0m'}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatDuration(session.actualStudyDuration)}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {session.status || 'Completed'}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSessionToDelete(session)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDeleteModal
        isOpen={!!sessionToDelete}
        title="Delete Study Session?"
        message="Deleting this session will automatically recalculate topic, subject, and course study hours."
        onConfirm={() => {
          if (sessionToDelete) deleteStudySession(sessionToDelete.id);
        }}
        onClose={() => setSessionToDelete(null)}
      />
    </div>
  );
}
