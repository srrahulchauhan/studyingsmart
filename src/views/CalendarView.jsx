import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration, formatDate, formatTime, getTodayDateString } from '../utils/dateUtils';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  CalendarRange,
  X,
  Target,
  Sparkles,
} from 'lucide-react';

export default function CalendarView() {
  const {
    courses,
    subjects,
    topics,
    activeCourseId,
    studySessions,
    attendance,
    timetable,
  } = useStudy();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const pad = (n) => String(n).padStart(2, '0');
    const dateKey = `${year}-${pad(month + 1)}-${pad(d)}`;

    // Filter sessions on this day
    const daySessions = studySessions.filter(s => s.date === dateKey && (!activeCourseId || s.courseId === activeCourseId));
    const dayStudyMins = daySessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
    const dayAttendance = attendance.find(a => a.date === dateKey && (!activeCourseId || a.courseId === activeCourseId));

    calendarCells.push({
      dayNumber: d,
      dateKey,
      sessions: daySessions,
      totalStudyMins: dayStudyMins,
      attendance: dayAttendance,
    });
  }

  const handleOpenDayModal = (cell) => {
    if (!cell) return;
    setSelectedDateDetails(cell);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <CalendarCheck className="w-4 h-4" />
            Productivity Timeline
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Study Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any date to inspect full study sessions, timetable slots, and attendance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <span>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase text-slate-400 mb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="min-h-[90px] rounded-2xl"></div>;
            }

            const isToday = cell.dateKey === getTodayDateString();
            const hasStudy = cell.totalStudyMins > 0;

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => handleOpenDayModal(cell)}
                className={`min-h-[90px] p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between hover:scale-[1.01] ${
                  isToday
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : hasStudy
                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {cell.dayNumber}
                  </span>
                  {cell.attendance && (
                    <span className={`w-2 h-2 rounded-full ${
                      cell.attendance.status === 'Present' ? 'bg-emerald-500' : cell.attendance.status === 'Partial' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}></span>
                  )}
                </div>

                <div className="mt-1">
                  {hasStudy ? (
                    <div>
                      <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatDuration(cell.totalStudyMins)}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {cell.sessions.length} {cell.sessions.length === 1 ? 'session' : 'sessions'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-300 dark:text-slate-700">No study</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Detail Modal */}
      {selectedDateDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Study Log: {formatDate(selectedDateDetails.dateKey)}
                </h3>
                <span className="text-xs text-slate-400">
                  Total Active Study: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatDuration(selectedDateDetails.totalStudyMins)}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDateDetails(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sessions List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recorded Sessions ({selectedDateDetails.sessions.length})
              </h4>
              {selectedDateDetails.sessions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  No study sessions recorded on this date.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateDetails.sessions.map((s) => {
                    const c = courses.find(item => item.id === s.courseId);
                    const subj = subjects.find(item => item.id === s.subjectId);
                    const topic = topics.find(item => item.id === s.topicId);

                    return (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-100 mb-1">
                          <span>{topic ? topic.name : subj ? subj.name : 'Study Session'}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            {formatDuration(s.actualStudyDuration)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span>{c ? c.name : 'Course'} • {formatTime(s.startTime)} – {formatTime(s.endTime)}</span>
                          {s.breakDuration > 0 && <span>Break: {formatDuration(s.breakDuration)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
