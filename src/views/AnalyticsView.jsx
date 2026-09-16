import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration, formatDate, getTodayDateString } from '../utils/dateUtils';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  PieChart,
  UserCheck,
  Coffee,
  Flame,
} from 'lucide-react';

export default function AnalyticsView({ onNavigate }) {
  const {
    courses,
    subjects,
    topics,
    activeCourseId,
    studySessions,
    attendance,
    streak,
    getAttendanceStats,
  } = useStudy();

  const [timeRange, setTimeRange] = useState('7days'); // '7days' | '30days' | 'all'

  // Filter sessions by course and time range
  const filteredSessions = studySessions.filter((s) => {
    if (activeCourseId && s.courseId !== activeCourseId) return false;
    if (timeRange === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(s.date) >= sevenDaysAgo;
    }
    if (timeRange === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(s.date) >= thirtyDaysAgo;
    }
    return true;
  });

  // Strict Zero-Data Rule: If there are 0 sessions, show real empty state.
  if (studySessions.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            Performance Insights
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Study Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real data charts and metrics derived from your actual focus sessions.
          </p>
        </div>

        <div className="py-20 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Analytics will appear after you complete your first study session.
          </h2>
          <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
            No synthetic or fake data is ever displayed. As soon as you log study time with the Study Timer, comprehensive breakdowns by day, subject, and course will render here.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('timer')}
            className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
          >
            Start Your First Study Session
          </button>
        </div>
      </div>
    );
  }

  // --- Real Metric Calculations ---
  const totalStudyMinutes = filteredSessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
  const totalBreakMinutes = filteredSessions.reduce((acc, s) => acc + (s.breakDuration || 0), 0);

  // Group study by unique dates
  const dailyStudyMap = {};
  filteredSessions.forEach((s) => {
    dailyStudyMap[s.date] = (dailyStudyMap[s.date] || 0) + (s.actualStudyDuration || 0);
  });
  const uniqueStudyDays = Object.keys(dailyStudyMap).length;
  const avgDailyMins = uniqueStudyDays > 0 ? Math.round(totalStudyMinutes / uniqueStudyDays) : 0;

  // Longest session
  const longestSessionMins = filteredSessions.reduce((max, s) => Math.max(max, s.actualStudyDuration || 0), 0);

  // Subject-wise hours
  const subjectHoursMap = {};
  filteredSessions.forEach((s) => {
    if (s.subjectId) {
      subjectHoursMap[s.subjectId] = (subjectHoursMap[s.subjectId] || 0) + (s.actualStudyDuration || 0);
    }
  });

  const subjectData = Object.entries(subjectHoursMap)
    .map(([subId, mins]) => {
      const subj = subjects.find((s) => s.id === subId);
      return {
        id: subId,
        name: subj ? subj.name : 'Other Subject',
        minutes: mins,
      };
    })
    .sort((a, b) => b.minutes - a.minutes);

  const maxSubjectMins = subjectData.length > 0 ? Math.max(...subjectData.map((s) => s.minutes), 1) : 1;

  // Daily Trend (Last 7 distinct dates with study)
  const sortedDates = Object.keys(dailyStudyMap).sort((a, b) => new Date(a) - new Date(b)).slice(-7);
  const maxDayMins = sortedDates.length > 0 ? Math.max(...sortedDates.map((d) => dailyStudyMap[d]), 1) : 1;

  // Topics completed vs pending
  const relevantTopics = topics.filter((t) => !activeCourseId || t.courseId === activeCourseId);
  const completedTopics = relevantTopics.filter((t) => t.status === 'Completed').length;
  const pendingTopics = relevantTopics.length - completedTopics;

  // Attendance stats
  const attStats = getAttendanceStats(activeCourseId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            Performance Insights
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Study Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real data charts derived strictly from your completed focus sessions.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              timeRange === '7days'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              timeRange === '30days'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              timeRange === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Study Hours
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatDuration(totalStudyMinutes)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{filteredSessions.length} total sessions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Daily Average
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatDuration(avgDailyMins)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">On active study days</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Longest Session
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatDuration(longestSessionMins)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Peak single focus duration</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Rest & Breaks
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatDuration(totalBreakMinutes)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Excluded from study time</span>
        </div>
      </div>

      {/* SVG Chart 1: Daily Study Trend */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Study Hours by Day
            </h2>
            <p className="text-xs text-slate-400">Chronological daily study volume</p>
          </div>
        </div>

        <div className="h-56 flex items-end justify-around gap-2 pt-4">
          {sortedDates.map((dateStr) => {
            const mins = dailyStudyMap[dateStr] || 0;
            const heightPercent = Math.max(10, Math.round((mins / maxDayMins) * 100));
            const formatted = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

            return (
              <div key={dateStr} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatDuration(mins)}
                </div>
                <div
                  className="w-full max-w-[48px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-sm"
                  style={{ height: `${heightPercent}%` }}
                ></div>
                <span className="text-[10px] text-slate-500 font-medium truncate w-full text-center">
                  {formatted}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Section: Subject-wise Breakdown & Topics Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise Bar Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-500" />
            Subject-wise Hours
          </h2>

          {subjectData.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No subject sessions logged yet.</p>
          ) : (
            <div className="space-y-3.5">
              {subjectData.map((subj) => {
                const widthPercent = Math.max(5, Math.round((subj.minutes / maxSubjectMins) * 100));
                return (
                  <div key={subj.id} className="text-xs">
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-800 dark:text-slate-200">{subj.name}</span>
                      <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                        {formatDuration(subj.minutes)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-violet-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Topics Completion & Attendance */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              Curriculum Mastery & Attendance
            </h2>

            {/* Topics Ratio */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Topics Mastered</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  {completedTopics} / {relevantTopics.length} ({relevantTopics.length > 0 ? Math.round((completedTopics / relevantTopics.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-teal-500 h-full transition-all duration-500"
                  style={{ width: `${relevantTopics.length > 0 ? (completedTopics / relevantTopics.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>{completedTopics} Completed</span>
                <span>{pendingTopics} Remaining</span>
              </div>
            </div>

            {/* Attendance Breakdown Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Attendance Distribution</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{attStats.percentage}% Rate</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
                  <div className="text-[10px] uppercase font-bold text-emerald-600">Present</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-100">{attStats.present}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
                  <div className="text-[10px] uppercase font-bold text-amber-600">Partial</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-100">{attStats.partial}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40">
                  <div className="text-[10px] uppercase font-bold text-rose-600">Absent</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-100">{attStats.absent}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
