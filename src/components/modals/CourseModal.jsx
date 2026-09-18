import React, { useState, useEffect } from 'react';
import { X, GraduationCap } from 'lucide-react';
import { getTodayDateString } from '../../utils/dateUtils';

export default function CourseModal({ isOpen, courseToEdit, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    category: 'Full Stack',
    startDate: getTodayDateString(),
    targetDate: '',
    dailyTarget: 4,
    weeklyTarget: 25,
    totalTargetHours: 150,
    priority: 'Medium',
    status: 'In Progress',
  });

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        name: courseToEdit.name || '',
        description: courseToEdit.description || '',
        purpose: courseToEdit.purpose || '',
        category: courseToEdit.category || 'General',
        startDate: courseToEdit.startDate || getTodayDateString(),
        targetDate: courseToEdit.targetDate || '',
        dailyTarget: courseToEdit.dailyTarget ?? 4,
        weeklyTarget: courseToEdit.weeklyTarget ?? 25,
        totalTargetHours: courseToEdit.totalTargetHours ?? 100,
        priority: courseToEdit.priority || 'Medium',
        status: courseToEdit.status || 'In Progress',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        purpose: '',
        category: 'Development',
        startDate: getTodayDateString(),
        targetDate: '',
        dailyTarget: 4,
        weeklyTarget: 25,
        totalTargetHours: 100,
        priority: 'Medium',
        status: 'In Progress',
      });
    }
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {courseToEdit ? 'Edit Course' : 'Create New Course'}
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Course Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. MERN Full Stack, Data Structures, English Speaking"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Purpose / Why I am learning */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Purpose / Motivation (Why I am learning)
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. To land a Senior React Developer role in Q4"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
              placeholder="Comprehensive curriculum outline, milestones, and goals"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Development, Exam, Language..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  const daily = Number(formData.dailyTarget) || 0;
                  let newTotal = formData.totalTargetHours;
                  let newWeekly = formData.weeklyTarget;

                  if (newStart && formData.targetDate) {
                    const start = new Date(newStart);
                    const end = new Date(formData.targetDate);
                    const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                    if (daily > 0) {
                      newWeekly = Math.round(daily * 7);
                      newTotal = Math.round(daily * diffDays);
                    }
                  }
                  setFormData({
                    ...formData,
                    startDate: newStart,
                    weeklyTarget: newWeekly,
                    totalTargetHours: newTotal,
                  });
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => {
                  const newTarget = e.target.value;
                  const daily = Number(formData.dailyTarget) || 0;
                  let newTotal = formData.totalTargetHours;
                  let newWeekly = formData.weeklyTarget;

                  if (formData.startDate && newTarget) {
                    const start = new Date(formData.startDate);
                    const end = new Date(newTarget);
                    const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                    if (daily > 0) {
                      newWeekly = Math.round(daily * 7);
                      newTotal = Math.round(daily * diffDays);
                    }
                  }
                  setFormData({
                    ...formData,
                    targetDate: newTarget,
                    weeklyTarget: newWeekly,
                    totalTargetHours: newTotal,
                  });
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Duration Summary Helper Badge */}
          {formData.startDate && formData.targetDate && (
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-400/30 text-indigo-600 dark:text-indigo-400 font-medium text-[11px] flex items-center justify-between">
              <span>
                📅 Course Duration:{' '}
                <strong>
                  {Math.max(1, Math.ceil((new Date(formData.targetDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)))} Days
                </strong>{' '}
                (~{(Math.max(1, Math.ceil((new Date(formData.targetDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))) / 7).toFixed(1)} Weeks)
              </span>
              <span className="font-bold text-xs">
                Auto-calculated ✨
              </span>
            </div>
          )}

          {/* Targets: Daily, Weekly, Total */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Daily (Hours)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.dailyTarget}
                onChange={(e) => {
                  const val = e.target.value;
                  const daily = Number(val) || 0;
                  let newTotal = formData.totalTargetHours;
                  let newWeekly = formData.weeklyTarget;

                  if (daily > 0) {
                    newWeekly = Math.round(daily * 7);
                    if (formData.startDate && formData.targetDate) {
                      const start = new Date(formData.startDate);
                      const end = new Date(formData.targetDate);
                      const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                      newTotal = Math.round(daily * diffDays);
                    }
                  }
                  setFormData({
                    ...formData,
                    dailyTarget: val,
                    weeklyTarget: newWeekly,
                    totalTargetHours: newTotal,
                  });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Weekly (Hours)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.weeklyTarget}
                onChange={(e) => setFormData({ ...formData, weeklyTarget: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Total (Hours)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.totalTargetHours}
                onChange={(e) => setFormData({ ...formData, totalTargetHours: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
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
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25"
            >
              {courseToEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
