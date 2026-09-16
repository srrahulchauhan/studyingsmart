import React, { useState, useEffect } from 'react';
import { X, Link2 } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function ResourceModal({ isOpen, resourceToEdit, courseId, subjectId, topicId, onSave, onClose }) {
  const { courses, subjects, topics } = useStudy();

  const [formData, setFormData] = useState({
    courseId: courseId || '',
    subjectId: subjectId || '',
    topicId: topicId || '',
    name: '',
    url: '',
    type: 'Documentation',
    description: '',
    tagsInput: '',
    priority: 'Medium',
    status: 'Not Started',
  });

  const availableSubjects = subjects.filter(s => !formData.courseId || s.courseId === formData.courseId);
  const availableTopics = topics.filter(t => !formData.subjectId || t.subjectId === formData.subjectId);

  useEffect(() => {
    if (resourceToEdit) {
      setFormData({
        courseId: resourceToEdit.courseId || courseId || '',
        subjectId: resourceToEdit.subjectId || subjectId || '',
        topicId: resourceToEdit.topicId || topicId || '',
        name: resourceToEdit.name || '',
        url: resourceToEdit.url || '',
        type: resourceToEdit.type || 'Documentation',
        description: resourceToEdit.description || '',
        tagsInput: Array.isArray(resourceToEdit.tags) ? resourceToEdit.tags.join(', ') : (resourceToEdit.tags || ''),
        priority: resourceToEdit.priority || 'Medium',
        status: resourceToEdit.status || 'Not Started',
      });
    } else {
      setFormData({
        courseId: courseId || (courses.length > 0 ? courses[0].id : ''),
        subjectId: subjectId || '',
        topicId: topicId || '',
        name: '',
        url: '',
        type: 'Documentation',
        description: '',
        tagsInput: '',
        priority: 'Medium',
        status: 'Not Started',
      });
    }
  }, [resourceToEdit, courseId, subjectId, topicId, courses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.courseId) return;

    const tags = formData.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      ...formData,
      tags,
    });
    onClose();
  };

  const resourceTypes = [
    'YouTube',
    'Website',
    'Documentation',
    'PDF',
    'Article',
    'Course',
    'ChatGPT',
    'GitHub',
    'Notes',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {resourceToEdit ? 'Edit Resource' : 'Save Study Resource'}
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
          {/* Resource Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resource Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Official React Beta Docs, Codecademy Lab, GitHub Repo"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resource Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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

          {/* URL */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link / URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://react.dev/learn"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Course, Subject, Topic Selectors */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Attach to Course <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    courseId: e.target.value,
                    subjectId: '',
                    topicId: '',
                  });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Attach to Subject (Optional)
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    subjectId: e.target.value,
                    topicId: '',
                  });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Entire Course --</option>
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {availableTopics.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Attach to Topic (Optional)
                </label>
                <select
                  value={formData.topicId}
                  onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- General Subject Resource --</option>
                  {availableTopics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tagsInput}
              onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
              placeholder="e.g. react, hooks, official, beginner"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
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
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/25"
            >
              {resourceToEdit ? 'Save Resource' : 'Save Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
