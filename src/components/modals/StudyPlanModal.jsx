import React, { useState, useEffect } from 'react';
import { X, FolderKanban } from 'lucide-react';
import { getTodayDateString } from '../../utils/dateUtils';
import { useStudy } from '../../context/StudyContext';

export default function StudyPlanModal({ isOpen, planToEdit, courseId, onSave, onClose }) {
  const { courses } = useStudy();

  const [formData, setFormData] = useState({
    courseId: courseId || '',
    name: '',
    description: '',
    startDate: getTodayDateString(),
    endDate: '',
    dailyTarget: 4,
    weeklyTarget: 25,
    totalTargetHours: 60,
    studyDays: 'Monday to Saturday',
    priority: 'Medium',
    status: 'In Progress',
  });

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        courseId: planToEdit.courseId || courseId || '',
        name: planToEdit.name || '',
        description: planToEdit.description || '',
        startDate: planToEdit.startDate || getTodayDateString(),
        endDate: planToEdit.endDate || '',
        dailyTarget: planToEdit.dailyTarget ?? 4,
        weeklyTarget: planToEdit.weeklyTarget ?? 25,
        totalTargetHours: planToEdit.totalTargetHours ?? 60,
        studyDays: planToEdit.studyDays || 'All',
        priority: planToEdit.priority || 'Medium',
        status: planToEdit.status || 'In Progress',
      });
    } else {
      setFormData({
        courseId: courseId || (courses.length > 0 ? courses[0].id : ''),
        name: '',
        description: '',
        startDate: getTodayDateString(),
        endDate: '',
        dailyTarget: 4,
        weeklyTarget: 25,
        totalTargetHours: 60,
        studyDays: 'Monday to Saturday',
        priority: 'Medium',
        status: 'In Progress',
      });
    }
  }, [planToEdit, courseId, courses, isOpen]);

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
            <FolderKanban className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {planToEdit ? 'Edit Study Plan' : 'Create Study Plan'}
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

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
          {/* Target Course */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Course <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">-- Choose a Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Plan Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Plan Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. 30 Days MERN Sprint, React Revision Plan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Plan objectives and weekly strategy"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Targets: Daily, Weekly, Total */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Daily (Hours)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.dailyTarget}
                onChange={(e) => setFormData({ ...formData, dailyTarget: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Weekly (Hours)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.weeklyTarget}
                onChange={(e) => setFormData({ ...formData, weeklyTarget: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Total (Hours)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.totalTargetHours}
                onChange={(e) => setFormData({ ...formData, totalTargetHours: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Study Days & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Study Days
              </label>
              <input
                type="text"
                value={formData.studyDays}
                onChange={(e) => setFormData({ ...formData, studyDays: e.target.value })}
                placeholder="e.g. Mon-Fri, All days"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
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
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/25"
            >
              {planToEdit ? 'Save Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
