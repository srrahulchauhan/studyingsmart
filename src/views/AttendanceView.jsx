import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration, formatDate, getTodayDateString } from '../utils/dateUtils';
import {
  UserCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Coffee,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings as SettingsIcon,
  Info,
} from 'lucide-react';

export default function AttendanceView() {
  const {
    courses,
    activeCourseId,
    attendance,
    settings,
    setManualAttendance,
    getAttendanceStats,
  } = useStudy();

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);

  const stats = getAttendanceStats(activeCourseId);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Calendar matrix calculation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create grid cells (Sun-Sat)
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    const record = attendance.find(a => a.date === dateStr && (!activeCourseId || a.courseId === activeCourseId));
    calendarDays.push({
      dayNumber: d,
      dateStr,
      record,
    });
  }

  const handleDayClick = (item) => {
    if (!item) return;
    setSelectedDayRecord(item);
  };

  const handleUpdateStatus = (status) => {
    if (!selectedDayRecord) return;
    setManualAttendance(
      activeCourseId || (courses.length > 0 ? courses[0].id : 'global'),
      selectedDayRecord.dateStr,
      status
    );
    setSelectedDayRecord(prev => ({
      ...prev,
      record: { ...(prev.record || {}), status },
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="w-2 h-2 rounded-full bg-emerald-500"></span>;
      case 'Partial':
        return <span className="w-2 h-2 rounded-full bg-amber-500"></span>;
      case 'Absent':
        return <span className="w-2 h-2 rounded-full bg-rose-500"></span>;
      case 'Holiday':
        return <span className="w-2 h-2 rounded-full bg-blue-500"></span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <UserCheck className="w-4 h-4" />
            Study Attendance
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Attendance Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-marked as Present when daily study reaches {settings.minStudyMinutesForAttendance || 30} minutes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-600 dark:text-slate-300">
            Min qualifying study time: <strong className="text-indigo-600 dark:text-indigo-400">{settings.minStudyMinutesForAttendance || 30}m</strong>
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Percentage */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Attendance Rate
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.percentage}%
          </div>
        </div>

        {/* Present */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Present
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {stats.present} Days
          </div>
        </div>

        {/* Partial */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Partial
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {stats.partial} Days
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-1">
            <XCircle className="w-3.5 h-3.5" />
            Absent
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {stats.absent} Days
          </div>
        </div>

        {/* Holiday */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Coffee className="w-3.5 h-3.5" />
            Holiday
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {stats.holiday} Days
          </div>
        </div>
      </div>

      {/* Monthly Attendance Calendar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6">
        {/* Month Navigator Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-slate-400 mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((item, idx) => {
            if (!item) {
              return <div key={`empty-${idx}`} className="h-16 rounded-2xl bg-transparent"></div>;
            }

            const isToday = item.dateStr === getTodayDateString();
            const status = item.record?.status;

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => handleDayClick(item)}
                className={`h-16 p-2 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isToday
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.dayNumber}
                  </span>
                  {status && getStatusBadge(status)}
                </div>

                {status ? (
                  <span className={`text-[9px] font-semibold truncate ${
                    status === 'Present' ? 'text-emerald-600' : status === 'Partial' ? 'text-amber-600' : status === 'Absent' ? 'text-rose-600' : 'text-blue-600'
                  }`}>
                    {status}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-300 dark:text-slate-700">—</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Present ({'>='}{settings.minStudyMinutesForAttendance || 30}m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Partial ({'<'}min threshold)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-600 dark:text-slate-400">Holiday</span>
          </div>
        </div>
      </div>

      {/* Date Detail / Manual Override Modal */}
      {selectedDayRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Attendance for {formatDate(selectedDayRecord.dateStr)}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDayRecord(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mb-4 text-xs">
              <div className="text-slate-500 mb-1">
                Current Status: <strong className="text-slate-800 dark:text-slate-100">{selectedDayRecord.record?.status || 'Not Tracked'}</strong>
              </div>
              <div className="text-slate-500">
                Recorded Study Time: <strong className="text-indigo-600 dark:text-indigo-400">{formatDuration(selectedDayRecord.record?.studyMinutes || 0)}</strong>
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Manual Override:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus('Present')}
                className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-colors"
              >
                Mark Present
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('Partial')}
                className="py-2 px-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-xs border border-amber-200 transition-colors"
              >
                Mark Partial
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('Absent')}
                className="py-2 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition-colors"
              >
                Mark Absent
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('Holiday')}
                className="py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs border border-blue-200 transition-colors"
              >
                Mark Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
