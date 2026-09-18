import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, Search, BookOpen, Calendar, Plus, Sparkles } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function AddFromCompletedTasksModal({ isOpen, onClose, onSelectTopicForRevision }) {
  const { topics, pendingTasks, courses, subjects } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('all');

  // List of completed items
  const completedTopics = useMemo(() => {
    return topics.filter((t) => t.status === 'Completed');
  }, [topics]);

  const completedPending = useMemo(() => {
    return pendingTasks.filter((pt) => pt.status === 'Completed');
  }, [pendingTasks]);

  // Combined list with course/subject metadata
  const combinedCompletedList = useMemo(() => {
    const list = [];

    completedTopics.forEach((t) => {
      const course = courses.find((c) => c.id === t.courseId);
      const subject = subjects.find((s) => s.id === t.subjectId);
      list.push({
        id: `comp_topic_${t.id}`,
        topicId: t.id,
        name: t.name,
        type: 'Topic',
        courseId: t.courseId,
        courseName: course ? course.name : '',
        subjectId: t.subjectId,
        subjectName: subject ? subject.name : '',
        description: t.description,
        estimatedMinutes: t.estimatedMinutes || 45,
        priority: t.priority || 'Medium',
        completionDate: t.completedDate || (t.createdAt ? t.createdAt.split('T')[0] : 'Completed'),
        sourceUrl: t.sourceUrl || t.videoUrl || '',
        rawItem: t,
      });
    });

    completedPending.forEach((pt) => {
      // Avoid duplicate if topic already in topics
      if (pt.topicId && completedTopics.some((ct) => ct.id === pt.topicId)) return;

      const course = courses.find((c) => c.id === pt.courseId);
      const subject = subjects.find((s) => s.id === pt.subjectId);
      list.push({
        id: `comp_pt_${pt.id}`,
        topicId: pt.topicId || null,
        name: pt.title,
        type: 'Task',
        courseId: pt.courseId,
        courseName: course ? course.name : '',
        subjectId: pt.subjectId,
        subjectName: subject ? subject.name : '',
        description: pt.notes || '',
        estimatedMinutes: pt.estimatedMinutes || 30,
        priority: pt.priority || 'Medium',
        completionDate: pt.completedDate || (pt.completedAt ? pt.completedAt.split('T')[0] : 'Completed'),
        sourceUrl: pt.sourceUrl || pt.videoUrl || '',
        rawItem: pt,
      });
    });

    return list;
  }, [completedTopics, completedPending, courses, subjects]);

  // Filtered
  const filteredList = useMemo(() => {
    return combinedCompletedList.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = selectedCourseId === 'all' || item.courseId === selectedCourseId;
      return matchesSearch && matchesCourse;
    });
  }, [combinedCompletedList, searchQuery, selectedCourseId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-[#090e1a] border-2 border-emerald-400/40 dark:border-emerald-500/30 rounded-3xl shadow-[0_20px_60px_rgba(16,185,129,0.2)] p-6 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl font-black shadow-xs">
              📋
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Add from Completed Tasks
              </h3>
              <p className="text-[10px] text-slate-400">
                Select any completed topic/task to schedule a revision. Original task status remains ✅ Completed.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-white/[0.08]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Course Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-3 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search completed topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* List of Completed Items */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <div className="text-3xl mb-1">🎉</div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No completed topics found matching filters.
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Complete topics in your study plan to see them listed here for spaced revision.
              </p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.08] hover:border-emerald-400/50 flex items-center justify-between gap-3 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-400/30 shrink-0">
                      ✅ Completed
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-slate-400 mt-1">
                    {item.courseName && (
                      <span className="text-sky-500 dark:text-sky-400 font-bold flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {item.courseName}
                      </span>
                    )}
                    {item.subjectName && <span>• {item.subjectName}</span>}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Completed: {item.completionDate}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTopicForRevision(item.rawItem);
                    onClose();
                  }}
                  className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1 shrink-0 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Revision</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
