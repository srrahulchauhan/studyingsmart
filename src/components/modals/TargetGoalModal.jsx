import React, { useState, useEffect } from 'react';
import { X, Target, Trophy } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { getTodayDateString } from '../../utils/dateUtils';

export default function TargetGoalModal({
  isOpen,
  mode = 'target', // 'target' | 'goal' | 'tomorrow'
  courseId,
  onSave,
  onClose,
}) {
  const { courses, subjects, topics } = useStudy();

  const [targetForm, setTargetForm] = useState({
    courseId: courseId || '',
    name: 'Daily Target',
    period: mode === 'tomorrow' ? 'Tomorrow' : 'Daily',
    targetHours: 4,
    date: getTodayDateString(),
    subjectId: '',
    topicId: '',
  });

  const [goalForm, setGoalForm] = useState({
    courseId: courseId || '',
    name: '',
    targetDate: '',
    targetHours: 100,
  });

  useEffect(() => {
    setTargetForm(prev => ({
      ...prev,
      courseId: courseId || (courses.length > 0 ? courses[0].id : ''),
      period: mode === 'tomorrow' ? 'Tomorrow' : 'Daily',
    }));
    setGoalForm(prev => ({
      ...prev,
      courseId: courseId || (courses.length > 0 ? courses[0].id : ''),
    }));
  }, [courseId, courses, mode, isOpen]);

  if (!isOpen) return null;

  const isGoal = mode === 'goal';
  const availableSubjects = subjects.filter(s => !targetForm.courseId || s.courseId === targetForm.courseId);
  const availableTopics = topics.filter(t => !targetForm.subjectId || t.subjectId === targetForm.subjectId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isGoal) {
      if (!goalForm.name.trim() || !goalForm.courseId) return;
      onSave(goalForm, 'goal');
    } else {
      if (!targetForm.courseId) return;
      onSave(targetForm, 'target');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {isGoal ? (
              <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <Target className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isGoal ? 'Create Course Goal' : mode === 'tomorrow' ? "Set Tomorrow's Target" : 'Set Study Target'}
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
              value={isGoal ? goalForm.courseId : targetForm.courseId}
              onChange={(e) => {
                if (isGoal) setGoalForm({ ...goalForm, courseId: e.target.value });
                else setTargetForm({ ...targetForm, courseId: e.target.value, subjectId: '', topicId: '' });
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {isGoal ? (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  placeholder="e.g. Complete 150 Hours & Build 5 MERN Projects"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={goalForm.targetHours}
                    onChange={(e) => setGoalForm({ ...goalForm, targetHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Label / Description
                </label>
                <input
                  type="text"
                  value={targetForm.name}
                  onChange={(e) => setTargetForm({ ...targetForm, name: e.target.value })}
                  placeholder="e.g. Daily Study Target, Tomorrow's Goal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Period
                  </label>
                  <select
                    value={targetForm.period}
                    onChange={(e) => setTargetForm({ ...targetForm, period: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Daily">Today's Target</option>
                    <option value="Tomorrow">Tomorrow's Target</option>
                    <option value="Weekly">Weekly Target</option>
                    <option value="Monthly">Monthly Target</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={targetForm.targetHours}
                    onChange={(e) => setTargetForm({ ...targetForm, targetHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {availableSubjects.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Subject (Optional)
                  </label>
                  <select
                    value={targetForm.subjectId}
                    onChange={(e) => setTargetForm({ ...targetForm, subjectId: e.target.value, topicId: '' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">-- All Subjects --</option>
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {availableTopics.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Topic (Optional)
                  </label>
                  <select
                    value={targetForm.topicId}
                    onChange={(e) => setTargetForm({ ...targetForm, topicId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">-- General Subject Target --</option>
                    {availableTopics.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

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
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-md ${
                isGoal ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
              }`}
            >
              {isGoal ? 'Save Goal' : 'Save Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
