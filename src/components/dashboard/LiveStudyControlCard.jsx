import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';
import { formatSeconds, formatDuration } from '../../utils/dateUtils';
import StudyVisualizer from '../common/StudyVisualizer';
import {
  Play,
  Pause,
  Coffee,
  Square,
  Sparkles,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Flame,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function LiveStudyControlCard({
  onRequestStopSession,
  onNavigate,
}) {
  const {
    courses,
    subjects,
    topics,
    activeCourseId,
    getSubjectStudyTime,
    getCourseStudyTime,
    studySessions,
  } = useStudy();

  const {
    activeSession,
    elapsedActiveSeconds,
    elapsedBreakSeconds,
    startStudy,
    pauseStudy,
    resumeStudy,
    takeBreak,
    stopStudy,
  } = useTimer();

  // Selection state when timer is idle
  const [selectedCourseId, setSelectedCourseId] = useState(
    activeSession ? activeSession.courseId : (activeCourseId || (courses.length > 0 ? courses[0].id : ''))
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    activeSession ? activeSession.subjectId || '' : ''
  );
  const [selectedTopicId, setSelectedTopicId] = useState(
    activeSession ? activeSession.topicId || '' : ''
  );

  // Synchronize with activeSession if running
  const effectiveCourseId = activeSession ? activeSession.courseId : (selectedCourseId || activeCourseId);
  const effectiveSubjectId = activeSession ? activeSession.subjectId : selectedSubjectId;
  const effectiveTopicId = activeSession ? activeSession.topicId : selectedTopicId;

  const currentCourse = courses.find((c) => c.id === effectiveCourseId);
  const currentSubject = subjects.find((s) => s.id === effectiveSubjectId);
  const currentTopic = topics.find((t) => t.id === effectiveTopicId);

  const availableSubjects = subjects.filter((s) => !effectiveCourseId || s.courseId === effectiveCourseId);
  const availableTopics = topics.filter((t) => !effectiveSubjectId || t.subjectId === effectiveSubjectId);

  const isRunning = activeSession?.status === 'running';
  const isPaused = activeSession?.status === 'paused';
  const isBreak = activeSession?.status === 'break';
  const isIdle = !activeSession;

  const currentStatus = isRunning ? 'running' : isPaused ? 'paused' : isBreak ? 'break' : 'idle';

  // Compute REAL stored study session accumulations
  // 1. Today's Subject
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySubjectMinutes = effectiveSubjectId
    ? studySessions
        .filter((s) => s.subjectId === effectiveSubjectId && s.date === todayStr)
        .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0)
    : 0;

  // 2. Today's Course
  const todayCourseMinutes = effectiveCourseId
    ? studySessions
        .filter((s) => s.courseId === effectiveCourseId && s.date === todayStr)
        .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0)
    : 0;

  // 3. Total Subject
  const totalSubjectMinutes = effectiveSubjectId ? getSubjectStudyTime(effectiveSubjectId) : 0;

  const handleStart = () => {
    if (!effectiveCourseId) {
      if (courses.length > 0) {
        startStudy({ courseId: courses[0].id });
      }
      return;
    }
    startStudy({
      courseId: effectiveCourseId,
      studyPlanId: null,
      subjectId: effectiveSubjectId || null,
      topicId: effectiveTopicId || null,
    });
  };

  const handleStop = () => {
    if (onRequestStopSession) {
      onRequestStopSession();
    } else {
      stopStudy(false);
    }
  };

  // Ring animation calculations
  // Rotate smoothly based on elapsed seconds mod 60 for tick motion
  const secondsMod = elapsedActiveSeconds % 60;
  const strokeDashoffset = 754 - (secondsMod / 60) * 754;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-[#0c1222]/90 border border-slate-200/80 dark:border-white/[0.08] shadow-xl dark:shadow-glass p-6 sm:p-8 backdrop-blur-2xl transition-all command-card">
      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {currentCourse ? currentCourse.name : 'No Course Selected'}
          </span>
          {currentSubject && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              {currentSubject.name}
            </span>
          )}
          {currentTopic && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              {currentTopic.name}
            </span>
          )}
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              ● STUDYING
            </span>
          )}
          {isPaused && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              ● PAUSED
            </span>
          )}
          {isBreak && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              ☕ ON BREAK
            </span>
          )}
          {isIdle && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              ○ IDLE READY
            </span>
          )}
        </div>
      </div>

      {/* Main Timer Dial & Visualizer Center */}
      <div className="my-6 flex flex-col items-center justify-center text-center">
        {/* Circular Animated Ring Wrapper */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 origin-center" viewBox="0 0 260 260">
            <defs>
              <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            {/* Background Track */}
            <circle
              cx="130"
              cy="130"
              r="120"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-100 dark:text-white/[0.05]"
              fill="transparent"
            />
            {/* Animated Active Ring */}
            <circle
              cx="130"
              cy="130"
              r="120"
              stroke={isBreak ? '#06b6d4' : isPaused ? '#f59e0b' : 'url(#timer-gradient)'}
              strokeWidth="8"
              strokeDasharray="754"
              strokeDashoffset={isIdle ? 754 : strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: isRunning ? 'stroke-dashoffset 1s linear' : 'all 0.5s ease',
              }}
              className={isRunning ? 'glow-filter-emerald' : ''}
            />
          </svg>

          {/* Central Timer Display Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              {isBreak ? 'Break Elapsed' : 'Focus Duration'}
            </span>
            <div className="digital-timer text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white my-1">
              {isBreak
                ? formatSeconds(elapsedBreakSeconds)
                : formatSeconds(elapsedActiveSeconds)}
            </div>

            {/* Micro Waveform Visualizer */}
            <StudyVisualizer status={currentStatus} className="mt-2" />
          </div>
        </div>

        {/* Quick Target / Subject Picker when Idle */}
        {isIdle && (
          <div className="mt-4 max-w-md w-full flex flex-wrap items-center justify-center gap-2 text-xs">
            {/* Subject Selector */}
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId('');
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Choose Subject (Optional)</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Topic Selector */}
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={!selectedSubjectId}
              className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-medium disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Choose Topic (Optional)</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Control Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 pb-6">
        {isIdle && (
          <button
            type="button"
            onClick={handleStart}
            className="py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            START STUDY
          </button>
        )}

        {isRunning && (
          <>
            <button
              type="button"
              onClick={pauseStudy}
              className="py-2.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Pause className="w-4 h-4" />
              PAUSE
            </button>
            <button
              type="button"
              onClick={() => takeBreak('Rest')}
              className="py-2.5 px-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Coffee className="w-4 h-4" />
              BREAK
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="py-2.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              STOP
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              type="button"
              onClick={resumeStudy}
              className="py-2.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              RESUME
            </button>
            <button
              type="button"
              onClick={() => takeBreak('Rest')}
              className="py-2.5 px-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Coffee className="w-4 h-4" />
              BREAK
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="py-2.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              STOP
            </button>
          </>
        )}

        {isBreak && (
          <>
            <button
              type="button"
              onClick={resumeStudy}
              className="py-2.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              END BREAK & RESUME
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="py-2.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              STOP
            </button>
          </>
        )}
      </div>

      {/* Real Stored Session Rollup Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-100 dark:border-white/[0.06] text-center text-xs">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            Today's {currentSubject ? currentSubject.name : 'Subject'}:
          </span>
          <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
            {formatDuration(todaySubjectMinutes)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            Today's Course Total:
          </span>
          <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
            {formatDuration(todayCourseMinutes)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            Total {currentSubject ? currentSubject.name : 'Subject'} Hours:
          </span>
          <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
            {formatDuration(totalSubjectMinutes)}
          </span>
        </div>
      </div>
    </div>
  );
}
