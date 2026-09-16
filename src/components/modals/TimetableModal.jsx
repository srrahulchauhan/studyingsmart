import React, { useState, useEffect } from 'react';
import { X, CalendarRange } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export default function TimetableModal({ isOpen, slotToEdit, courseId, onSave, onClose }) {
  const { courses, subjects, topics, studyPlans } = useStudy();

  const [formData, setFormData] = useState({
    courseId: courseId || '',
    studyPlanId: '',
    subjectId: '',
    topicId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    targetDuration: 90,
    repeat: 'None', // 'None' | '1 Day' | '3 Days' | '7 Days' | '15 Days' | '30 Days'
    priority: 'Medium',
  });

  const availableSubjects = subjects.filter(s => !formData.courseId || s.courseId === formData.courseId);
  const availableTopics = topics.filter(t => !formData.subjectId || t.subjectId === formData.subjectId);
  const availablePlans = studyPlans.filter(p => !formData.courseId || p.courseId === formData.courseId);

  useEffect(() => {
    if (slotToEdit) {
      setFormData({
        courseId: slotToEdit.courseId || courseId || '',
        studyPlanId: slotToEdit.studyPlanId || '',
        subjectId: slotToEdit.subjectId || '',
        topicId: slotToEdit.topicId || '',
        day: slotToEdit.day || 'Monday',
        startTime: slotToEdit.startTime || '09:00',
        endTime: slotToEdit.endTime || '10:30',
        targetDuration: slotToEdit.targetDuration ?? 90,
        repeat: slotToEdit.repeat || 'None',
        priority: slotToEdit.priority || 'Medium',
      });
    } else {
      setFormData({
        courseId: courseId || (courses.length > 0 ? courses[0].id : ''),
        studyPlanId: '',
        subjectId: '',
        topicId: '',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        targetDuration: 90,
        repeat: 'None',
        priority: 'Medium',
      });
    }
  }, [slotToEdit, courseId, courses, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.courseId) return;
    onSave(formData);
    onClose();
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {slotToEdit ? 'Edit Timetable Slot' : 'Schedule Study Slot'}
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
          {/* Day of Week */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Scheduled Day <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {daysOfWeek.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Times: Start & End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Target Duration & Repeat */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Target Minutes
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={formData.targetDuration}
                onChange={(e) => setFormData({ ...formData, targetDuration: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Recurring Study
              </label>
              <select
                value={formData.repeat}
                onChange={(e) => setFormData({ ...formData, repeat: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="None">None (Single slot)</option>
                <option value="3 Days">Next 3 Days</option>
                <option value="7 Days">Next 7 Days</option>
                <option value="15 Days">Next 15 Days</option>
                <option value="30 Days">Next 30 Days</option>
              </select>
            </div>
          </div>

          {/* Relational Course, Subject, Topic */}
          <div className="space-y-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course <span className="text-rose-500">*</span>
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Choose Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject (Optional)
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Select Subject --</option>
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {availableTopics.length > 0 && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic (Optional)
                </label>
                <select
                  value={formData.topicId}
                  onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Select Topic --</option>
                  {availableTopics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
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
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/25"
            >
              {slotToEdit ? 'Save Slot' : 'Add to Timetable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
