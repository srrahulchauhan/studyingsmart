import React, { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, Clock, AlertCircle, Sparkles, Link, ExternalLink } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function RevisionModal({ isOpen, revisionToEdit, initialTopic, onClose }) {
  const { courses, subjects, topics, addRevision, updateRevision, activeCourseId } = useStudy();

  const [formData, setFormData] = useState({
    courseId: activeCourseId || (courses[0]?.id || ''),
    subjectId: '',
    subjectName: '',
    topicName: '',
    topicId: null,
    subTopic: '',
    revisionDate: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    durationMinutes: 30,
    priority: 'Medium',
    notes: '',
    revisionType: 'New Topic', // 'New Topic' | 'Completed Task' | 'Previous Revision'
    repeatPattern: 'One Time', // 'One Time' | 'Daily' | 'Weekly' | 'Custom'
    sourceUrl: '',
  });

  const availableSubjects = subjects.filter((s) => !formData.courseId || s.courseId === formData.courseId);
  const availableTopics = topics.filter((t) => !formData.subjectId || t.subjectId === formData.subjectId);

  useEffect(() => {
    if (revisionToEdit) {
      setFormData({
        courseId: revisionToEdit.courseId || activeCourseId || '',
        subjectId: revisionToEdit.subjectId || '',
        subjectName: revisionToEdit.subjectName || '',
        topicName: revisionToEdit.topicName || revisionToEdit.title || '',
        topicId: revisionToEdit.topicId || null,
        subTopic: revisionToEdit.subTopic || '',
        revisionDate: revisionToEdit.revisionDate || new Date().toISOString().split('T')[0],
        startTime: revisionToEdit.startTime || '19:00',
        durationMinutes: revisionToEdit.durationMinutes || 30,
        priority: revisionToEdit.priority || 'Medium',
        notes: revisionToEdit.notes || '',
        revisionType: revisionToEdit.revisionType || 'New Topic',
        repeatPattern: revisionToEdit.repeatPattern || 'One Time',
        sourceUrl: revisionToEdit.sourceUrl || revisionToEdit.videoUrl || '',
      });
    } else if (initialTopic) {
      const parentSubject = subjects.find((s) => s.id === initialTopic.subjectId);
      setFormData({
        courseId: initialTopic.courseId || activeCourseId || '',
        subjectId: initialTopic.subjectId || '',
        subjectName: parentSubject ? parentSubject.name : '',
        topicName: initialTopic.name || '',
        topicId: initialTopic.id,
        subTopic: '',
        revisionDate: new Date().toISOString().split('T')[0],
        startTime: '19:00',
        durationMinutes: 30,
        priority: initialTopic.priority || 'Medium',
        notes: initialTopic.description || '',
        revisionType: 'Completed Task',
        repeatPattern: 'One Time',
        sourceUrl: initialTopic.sourceUrl || initialTopic.videoUrl || '',
      });
    } else {
      setFormData({
        courseId: activeCourseId || (courses[0]?.id || ''),
        subjectId: availableSubjects[0]?.id || '',
        subjectName: availableSubjects[0]?.name || '',
        topicName: '',
        topicId: null,
        subTopic: '',
        revisionDate: new Date().toISOString().split('T')[0],
        startTime: '19:00',
        durationMinutes: 30,
        priority: 'Medium',
        notes: '',
        revisionType: 'New Topic',
        repeatPattern: 'One Time',
        sourceUrl: '',
      });
    }
  }, [revisionToEdit, initialTopic, isOpen, activeCourseId, courses]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.topicName.trim() && !formData.subjectName.trim()) return;

    const selectedSubjectObj = subjects.find((s) => s.id === formData.subjectId);
    const finalSubjectName = selectedSubjectObj ? selectedSubjectObj.name : formData.subjectName;

    if (revisionToEdit) {
      updateRevision(revisionToEdit.id, {
        ...formData,
        subjectName: finalSubjectName,
        title: `${formData.topicName || finalSubjectName} Revision`,
      });
    } else {
      addRevision({
        ...formData,
        subjectName: finalSubjectName,
        title: `${formData.topicName || finalSubjectName} Revision`,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#090e1a] border-2 border-purple-400/40 dark:border-purple-500/30 rounded-3xl shadow-[0_20px_60px_rgba(168,85,247,0.25)] p-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 dark:text-purple-400 flex items-center justify-center text-lg font-black shadow-xs">
              📚
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {revisionToEdit ? 'Edit Revision Task' : '+ Schedule New Revision'}
              </h3>
              <p className="text-[10px] text-slate-400">
                Independent Revision schedule. Does not affect main Study Task status.
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

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
          {/* Select Course & Subject */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Course
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => {
                  const cId = e.target.value;
                  const nextSubjs = subjects.filter((s) => s.courseId === cId);
                  setFormData({
                    ...formData,
                    courseId: cId,
                    subjectId: nextSubjs[0]?.id || '',
                    subjectName: nextSubjs[0]?.name || '',
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => {
                  const sId = e.target.value;
                  const subjObj = subjects.find((s) => s.id === sId);
                  setFormData({
                    ...formData,
                    subjectId: sId,
                    subjectName: subjObj ? subjObj.name : formData.subjectName,
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Or type subject below...</option>
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Name fallback if not selected */}
          {!formData.subjectId && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject Name
              </label>
              <input
                type="text"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                placeholder="e.g. Computer, JavaScript, Maths"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Topic Name & Sub-topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Topic Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.topicName}
                onChange={(e) => setFormData({ ...formData, topicName: e.target.value })}
                placeholder="e.g. MS Excel Formulas, Async/Await"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sub-topic <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.subTopic}
                onChange={(e) => setFormData({ ...formData, subTopic: e.target.value })}
                placeholder="e.g. VLOOKUP & INDEX MATCH"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Video Link */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Video Link (Optional)</span>
              <span className="text-[10px] text-slate-400 font-normal">Hidden behind Source button</span>
            </label>
            <input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              placeholder="Paste YouTube or drive link (will display as a clean button)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Schedule Date, Start Time & Duration */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Revision Date
              </label>
              <input
                type="date"
                required
                value={formData.revisionDate}
                onChange={(e) => setFormData({ ...formData, revisionDate: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Priority, Revision Type & Repeat Pattern */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={formData.revisionType}
                onChange={(e) => setFormData({ ...formData, revisionType: e.target.value })}
                className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white"
              >
                <option value="New Topic">New Topic</option>
                <option value="Completed Task">Completed Task</option>
                <option value="Previous Revision">Previous Revision</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Repeat
              </label>
              <select
                value={formData.repeatPattern}
                onChange={(e) => setFormData({ ...formData, repeatPattern: e.target.value })}
                className="w-full px-2 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white"
              >
                <option value="One Time">One Time</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Revision Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Revision Notes & Focus Points
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Important formulas, key definitions, or weak areas to revise..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1527] text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95"
            >
              {revisionToEdit ? 'Save Changes' : 'Schedule Revision 📚'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
