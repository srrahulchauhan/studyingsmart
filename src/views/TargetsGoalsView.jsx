import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration, formatDate, getCurrentWeekDates, getTodayDateString } from '../utils/dateUtils';
import {
  Target,
  Trophy,
  Plus,
  Trash2,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import TargetGoalModal from '../components/modals/TargetGoalModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

export default function TargetsGoalsView() {
  const {
    courses,
    activeCourseId,
    activeCourse,
    targets,
    goals,
    studySessions,
    addTarget,
    deleteTarget,
    addGoal,
    updateGoal,
    deleteGoal,
    getTodayStudyTime,
    getWeeklyStudyTime,
    getMonthlyStudyTime,
    getCourseStudyTime,
    settings,
  } = useStudy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('target'); // 'target' | 'goal'
  const [itemToDelete, setItemToDelete] = useState(null);

  // Targets calculations
  const currentCourse = activeCourse;
  const currentCourseId = activeCourseId;

  // Daily target
  const dailyTargetHours = currentCourse?.dailyTarget || settings.dailyTargetHours || 4;
  const dailyTargetMins = dailyTargetHours * 60;
  const todayActualMins = getTodayStudyTime(currentCourseId);
  const dailyProgress = dailyTargetMins > 0 ? Math.min(100, Math.round((todayActualMins / dailyTargetMins) * 100)) : 0;
  const dailyRemainingMins = Math.max(0, dailyTargetMins - todayActualMins);

  // Weekly target
  const weeklyTargetHours = currentCourse?.weeklyTarget || settings.weeklyTargetHours || 25;
  const weeklyTargetMins = weeklyTargetHours * 60;
  const weeklyActualMins = getWeeklyStudyTime(currentCourseId);
  const weeklyProgress = weeklyTargetMins > 0 ? Math.min(100, Math.round((weeklyActualMins / weeklyTargetMins) * 100)) : 0;
  const weeklyRemainingMins = Math.max(0, weeklyTargetMins - weeklyActualMins);

  // Week days Planned vs Actual breakdown
  const currentWeekDates = getCurrentWeekDates(settings.weekStartDay);
  const dailyPlannedHours = dailyTargetHours; // standard per study day

  // Monthly target
  const monthlyTargetHours = (weeklyTargetHours * 4);
  const monthlyTargetMins = monthlyTargetHours * 60;
  const monthlyActualMins = getMonthlyStudyTime(currentCourseId);
  const monthlyProgress = monthlyTargetMins > 0 ? Math.min(100, Math.round((monthlyActualMins / monthlyTargetMins) * 100)) : 0;
  const monthlyRemainingMins = Math.max(0, monthlyTargetMins - monthlyActualMins);

  const filteredGoals = goals.filter(g => !activeCourseId || g.courseId === activeCourseId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
            <Target className="w-4 h-4" />
            Milestones & Goals
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Study Targets & Goals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor daily, weekly, and monthly Planned vs Actual study targets with long-term course goals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setModalMode('target');
              setIsModalOpen(true);
            }}
            className="py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Custom Target
          </button>
          <button
            type="button"
            onClick={() => {
              setModalMode('goal');
              setIsModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            + New Goal
          </button>
        </div>
      </div>

      {/* Target Progress Cards: Daily, Weekly, Monthly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Daily Target Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Today's Target</span>
              <Target className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatDuration(todayActualMins)} / {dailyTargetHours}h
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${dailyProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>Progress: <strong className="text-rose-600 dark:text-rose-400 font-bold">{dailyProgress}%</strong></span>
            <span>Remaining: <strong className="text-slate-700 dark:text-slate-300 font-medium">{formatDuration(dailyRemainingMins)}</strong></span>
          </div>
        </div>

        {/* Weekly Target Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Weekly Target</span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatDuration(weeklyActualMins)} / {weeklyTargetHours}h
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>Progress: <strong className="text-blue-600 dark:text-blue-400 font-bold">{weeklyProgress}%</strong></span>
            <span>Remaining: <strong className="text-slate-700 dark:text-slate-300 font-medium">{formatDuration(weeklyRemainingMins)}</strong></span>
          </div>
        </div>

        {/* Monthly Target Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Monthly Target</span>
              <Calendar className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatDuration(monthlyActualMins)} / {monthlyTargetHours}h
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-violet-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span>Progress: <strong className="text-violet-600 dark:text-violet-400 font-bold">{monthlyProgress}%</strong></span>
            <span>Remaining: <strong className="text-slate-700 dark:text-slate-300 font-medium">{formatDuration(monthlyRemainingMins)}</strong></span>
          </div>
        </div>
      </div>

      {/* Section 21: WEEKLY DAY-BY-DAY PLANNED VS ACTUAL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          Weekly Daily Breakdown: Planned vs Actual
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {currentWeekDates.map((dayItem) => {
            const daySessions = studySessions.filter(s => s.date === dayItem.dateString && (!currentCourseId || s.courseId === currentCourseId));
            const actualMins = daySessions.reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
            const plannedMins = dailyTargetHours * 60;
            const met = actualMins >= plannedMins;

            return (
              <div
                key={dayItem.dateString}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center flex flex-col justify-between"
              >
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {dayItem.name}
                </div>
                <div className="text-[10px] text-slate-400 mb-2">
                  {dayItem.displayDate}
                </div>

                <div className="my-1">
                  <div className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">
                    {formatDuration(actualMins)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Planned: {dailyTargetHours}h
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    met
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : actualMins > 0
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}>
                    {met ? 'Met Target' : actualMins > 0 ? 'Partial' : '0m'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 34: COURSE GOALS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Course Learning Goals
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setModalMode('goal');
              setIsModalOpen(true);
            }}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold"
          >
            + Add Goal
          </button>
        </div>

        {filteredGoals.length === 0 ? (
          <div className="py-10 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Trophy className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 mb-3">No long-term goals configured yet.</p>
            <button
              type="button"
              onClick={() => {
                setModalMode('goal');
                setIsModalOpen(true);
              }}
              className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
            >
              + Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGoals.map((goal) => {
              const course = courses.find(c => c.id === goal.courseId);
              const actualMins = course ? getCourseStudyTime(course.id) : 0;
              const targetMins = (goal.targetHours || 100) * 60;
              const progress = Math.min(100, Math.round((actualMins / targetMins) * 100));

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        {course ? course.name : 'Course'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setItemToDelete({ id: goal.id, type: 'goal', name: goal.name })}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {goal.name}
                    </h4>

                    {goal.targetDate && (
                      <div className="text-[11px] text-slate-400 mt-1">
                        Target Date: {formatDate(goal.targetDate)}
                      </div>
                    )}

                    <div className="mt-3">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-400 flex justify-between">
                    <span>Actual: {formatDuration(actualMins)}</span>
                    <span>Target: {goal.targetHours}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <TargetGoalModal
        isOpen={isModalOpen}
        mode={modalMode}
        courseId={activeCourseId}
        onSave={(data, type) => {
          if (type === 'goal') addGoal(data);
          else addTarget(data);
        }}
        onClose={() => setIsModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        title={`Delete Goal "${itemToDelete?.name}"?`}
        message="Are you sure you want to remove this learning goal?"
        onConfirm={() => {
          if (itemToDelete?.type === 'goal') deleteGoal(itemToDelete.id);
        }}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
}
