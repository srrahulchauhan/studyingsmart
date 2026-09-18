import React, { useState, useEffect } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function TopicModal({ isOpen, topicToEdit, subjectId, courseId, onSave, onClose }) {
  const { courses, subjects } = useStudy();

  const [formData, setFormData] = useState({
    courseId: courseId || '',
    subjectId: subjectId || '',
    name: '',
    description: '',
    sourceUrl: '',
    estimatedMinutes: 60,
    targetDate: '',
    priority: 'Medium',
    lectureStatus: 'Pending',
    notesStatus: 'Pending',
    revisionStatus: 'Pending',
    revisionRequired: true,
  });

  const availableSubjects = subjects.filter(s => !formData.courseId || s.courseId === formData.courseId);

  useEffect(() => {
    if (topicToEdit) {
      setFormData({
        courseId: topicToEdit.courseId || courseId || '',
        subjectId: topicToEdit.subjectId || subjectId || '',
        name: topicToEdit.name || '',
        description: topicToEdit.description || '',
        sourceUrl: topicToEdit.sourceUrl || topicToEdit.videoUrl || '',
        estimatedMinutes: topicToEdit.estimatedMinutes ?? 60,
        targetDate: topicToEdit.targetDate || '',
        priority: topicToEdit.priority || 'Medium',
        lectureStatus: topicToEdit.lectureStatus || 'Pending',
        notesStatus: topicToEdit.notesStatus || 'Pending',
        revisionStatus: topicToEdit.revisionStatus || 'Pending',
        revisionRequired: topicToEdit.revisionRequired ?? true,
      });
    } else {
      setFormData({
        courseId: courseId || (courses.length > 0 ? courses[0].id : ''),
        subjectId: subjectId || (availableSubjects.length > 0 ? availableSubjects[0].id : ''),
        name: '',
        description: '',
        sourceUrl: '',
        estimatedMinutes: 60,
        targetDate: '',
        priority: 'Medium',
        lectureStatus: 'Pending',
        notesStatus: 'Pending',
        revisionStatus: 'Pending',
        revisionRequired: true,
      });
    }
  }, [topicToEdit, subjectId, courseId, courses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subjectId) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {topicToEdit ? 'Edit Topic' : 'Add New Topic'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          {/* Select Course */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => {
                const cId = e.target.value;
                const nextSubjs = subjects.filter(s => s.courseId === cId);
                setFormData({
                  ...formData,
                  courseId: cId,
                  subjectId: nextSubjs.length > 0 ? nextSubjs[0].id : '',
                });
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Select Subject */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">-- Choose Subject --</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Topic Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. useState Hook, Array Methods, Async/Await"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Topic Notes / Scope
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key concepts to master and practice questions"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
            />
          </div>

          {/* Estimated Study Time & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Time (Minutes)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Sub-Tasks Pre-Config: Lecture & Notes */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                🎥 Lecture Status
              </label>
              <select
                value={formData.lectureStatus}
                onChange={(e) => setFormData({ ...formData, lectureStatus: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              >
                <option value="Pending">🔴 Pending</option>
                <option value="Completed">✅ Completed</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                📝 Notes Status
              </label>
              <select
                value={formData.notesStatus}
                onChange={(e) => setFormData({ ...formData, notesStatus: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              >
                <option value="Pending">🔴 Pending</option>
                <option value="Completed">✅ Completed</option>
              </select>
            </div>
          </div>

          {/* Revision Control (Required Toggle & Status) */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                🔄 Revision Required?
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, revisionRequired: true })}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    formData.revisionRequired
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ✅ Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, revisionRequired: false })}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    !formData.revisionRequired
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ⭕ No
                </button>
              </div>
            </div>

            {formData.revisionRequired && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Revision Status
                </label>
                <select
                  value={formData.revisionStatus}
                  onChange={(e) => setFormData({ ...formData, revisionStatus: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                >
                  <option value="Pending">🔴 Pending</option>
                  <option value="Completed">✅ Completed</option>
                </select>
              </div>
            )}
          </div>

          {/* Target Date */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Form Actions */}
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
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/25"
            >
              {topicToEdit ? 'Save Topic' : 'Add Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
