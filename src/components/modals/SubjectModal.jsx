import React, { useState, useEffect } from 'react';
import { X, CalendarDays } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function SubjectModal({ isOpen, subjectToEdit, courseId, planId, onSave, onClose }) {
  const { courses, studyPlans } = useStudy();

  const [formData, setFormData] = useState({
    courseId: courseId || '',
    studyPlanId: planId || '',
    name: '',
    description: '',
    purpose: '',
    targetDate: '',
    targetHours: 30,
    dailyTargetHours: 1.5,
    priority: 'Medium',
    status: 'In Progress',
  });

  const availablePlans = studyPlans.filter(p => !formData.courseId || p.courseId === formData.courseId);

  useEffect(() => {
    if (subjectToEdit) {
      setFormData({
        courseId: subjectToEdit.courseId || courseId || '',
        studyPlanId: subjectToEdit.studyPlanId || planId || '',
        name: subjectToEdit.name || '',
        description: subjectToEdit.description || '',
        purpose: subjectToEdit.purpose || '',
        targetDate: subjectToEdit.targetDate || '',
        targetHours: subjectToEdit.targetHours ?? 30,
        dailyTargetHours: subjectToEdit.dailyTargetHours ?? 1.5,
        priority: subjectToEdit.priority || 'Medium',
        status: subjectToEdit.status || 'In Progress',
      });
    } else {
      setFormData({
        courseId: courseId || (courses.length > 0 ? courses[0].id : ''),
        studyPlanId: planId || '',
        name: '',
        description: '',
        purpose: '',
        targetDate: '',
        targetHours: 30,
        dailyTargetHours: 1.5,
        priority: 'Medium',
        status: 'In Progress',
      });
    }
  }, [subjectToEdit, courseId, planId, courses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.courseId) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
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
          {/* Course Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value, studyPlanId: '' })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Optional Study Plan */}
          {availablePlans.length > 0 && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Attach to Study Plan (Optional)
              </label>
              <select
                value={formData.studyPlanId}
                onChange={(e) => setFormData({ ...formData, studyPlanId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- None (Direct Course Subject) --</option>
                {availablePlans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. React.js, Node.js, DSA, Grammar"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject Objective / Purpose
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. Master modern frontend hooks and state management"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Target Hours & Daily Target */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Target Hours
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.targetHours}
                onChange={(e) => setFormData({ ...formData, targetHours: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Daily Target (Hours)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.dailyTargetHours}
                onChange={(e) => setFormData({ ...formData, dailyTargetHours: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="In Progress">In Progress</option>
                <option value="Not Started">Not Started</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Completion Date
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
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/25"
            >
              {subjectToEdit ? 'Save Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
