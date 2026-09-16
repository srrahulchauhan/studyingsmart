import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';
import { formatSeconds, formatDuration } from '../../utils/dateUtils';
import StudyVisualizer from '../common/StudyVisualizer';
import GlassIcon from '../common/GlassIcon';
import {
  Play,
  Pause,
  Coffee,
  Square,
  Sparkles,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Clock,
  Layers,
  CheckCircle2,
  Timer,
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
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySubjectMinutes = effectiveSubjectId
    ? studySessions
        .filter((s) => s.subjectId === effectiveSubjectId && s.date === todayStr)
        .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0)
    : 0;

  const todayCourseMinutes = effectiveCourseId
    ? studySessions
        .filter((s) => s.courseId === effectiveCourseId && s.date === todayStr)
        .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0)
    : 0;

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

  // Dual Ring animation calculations (Requirement 6: Sky-blue + pink secondary ring)
  const secondsMod = elapsedActiveSeconds % 60;
  const strokeDashoffsetPrimary = 754 - (secondsMod / 60) * 754;

  const breakSecondsMod = elapsedBreakSeconds % 60;
  const strokeDashoffsetSecondary = 628 - (breakSecondsMod / 60) * 628;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.10] shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] p-6 sm:p-8 backdrop-blur-2xl transition-all command-card hover:border-sky-400/30">
      {/* Subtle Sky-blue + Pink Glow Orbs behind card (Requirement 6) */}
      <div className="absolute top-1/4 -right-10 w-96 h-96 bg-sky-500/[0.09] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle"></div>
      <div className="absolute bottom-1/4 -left-10 w-96 h-96 bg-pink-500/[0.07] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle"></div>

      {/* Top Header: LIVE STUDY / Status & Curriculum Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-white/[0.07]">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Timer} variant="sky" size="md" />
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
              <span>LIVE STUDY</span>
              <span className="text-slate-400 text-[10px]">•</span>
              <span className="text-slate-300 font-medium">CONTROL CENTER</span>
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {currentCourse ? currentCourse.name : 'Select or Start Any Course'}
            </div>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isRunning && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-400/30 text-xs font-bold shadow-[0_0_16px_rgba(14,165,233,0.3)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              ● STUDYING
            </span>
          )}
          {isPaused && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-400/30 text-xs font-bold shadow-[0_0_16px_rgba(234,179,8,0.25)]">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              ● PAUSED
            </span>
          )}
          {isBreak && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/15 text-pink-400 border border-pink-400/30 text-xs font-bold shadow-[0_0_16px_rgba(236,72,153,0.25)] animate-pulse">
              <Coffee className="w-3.5 h-3.5 text-pink-400" />
              ☕ ON BREAK
            </span>
          )}
          {isIdle && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              ○ IDLE READY
            </span>
          )}
        </div>
      </div>

      {/* Center: Concentric Animated Rings + Huge White Timer */}
      <div className="my-6 flex flex-col items-center justify-center text-center">
        <div className="relative w-64 h-64 sm:w-76 sm:h-76 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 origin-center overflow-visible" viewBox="0 0 270 270">
            <defs>
              <linearGradient id="sky-timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="pink-timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>

            {/* Primary Track Ring */}
            <circle
              cx="135"
              cy="135"
              r="120"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-100 dark:text-white/[0.05]"
              fill="transparent"
            />

            {/* Primary Sky-Blue Animated Progress Ring (Requirement 6) */}
            <circle
              cx="135"
              cy="135"
              r="120"
              stroke={isBreak ? 'url(#pink-timer-gradient)' : isPaused ? '#facc15' : 'url(#sky-timer-gradient)'}
              strokeWidth="8"
              strokeDasharray="754"
              strokeDashoffset={isIdle ? 754 : strokeDashoffsetPrimary}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: isRunning ? 'stroke-dashoffset 1s linear' : 'all 0.5s ease',
                filter: isRunning ? 'drop-shadow(0 0 10px rgba(14, 165, 233, 0.5))' : 'none',
              }}
            />

            {/* Secondary Pink Ring (Requirement 6) */}
            <circle
              cx="135"
              cy="135"
              r="100"
              stroke="currentColor"
              strokeWidth="3"
              className="text-slate-100 dark:text-white/[0.03]"
              fill="transparent"
            />
            <circle
              cx="135"
              cy="135"
              r="100"
              stroke="url(#pink-timer-gradient)"
              strokeWidth="4"
              strokeDasharray="628"
              strokeDashoffset={isIdle ? 628 : strokeDashoffsetSecondary}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'all 0.5s ease',
                filter: 'drop-shadow(0 0 6px rgba(236, 72, 153, 0.4))',
              }}
            />
          </svg>

          {/* Central Timer Typography Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              {isBreak ? 'Break Elapsed' : isPaused ? 'Study Paused' : 'Live Focus Time'}
            </span>

            {/* Very large white timer typography (Requirement 6) */}
            <div className="digital-timer text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white my-1 select-none drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
              {isBreak
                ? formatSeconds(elapsedBreakSeconds)
                : formatSeconds(elapsedActiveSeconds)}
            </div>

            {/* Micro Waveform Visualizer */}
            <StudyVisualizer status={currentStatus} className="mt-2" />
          </div>
        </div>

        {/* Below: Subject & Topic Indicator (Requirement 6) */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {currentSubject ? (
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-400/25">
              {currentSubject.name}
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400">
              General Session
            </span>
          )}

          {currentTopic && (
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-400/25">
              {currentTopic.name}
            </span>
          )}
        </div>

        {/* Quick Subject & Topic Pickers when Idle */}
        {isIdle && (
          <div className="mt-4 max-w-md w-full flex flex-wrap items-center justify-center gap-2 text-xs">
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId('');
              }}
              className="py-2 px-3 rounded-xl bg-white/50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-sky-400"
            >
              <option value="">Choose Subject (Optional)</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={!selectedSubjectId}
              className="py-2 px-3 rounded-xl bg-white/50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-medium disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-sky-400"
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

      {/* Button Controls strictly matching Section 6 & 18 Colors */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 pb-5">
        {isIdle && (
          <button
            type="button"
            onClick={handleStart}
            className="py-3.5 px-9 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-sm shadow-[0_4px_24px_rgba(14,165,233,0.45)] hover:shadow-[0_6px_30px_rgba(14,165,233,0.6)] flex items-center gap-2.5 btn-premium hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            ▶ START
          </button>
        )}

        {isRunning && (
          <>
            {/* PAUSE: White/transparent */}
            <button
              type="button"
              onClick={pauseStudy}
              className="py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-md backdrop-blur-md flex items-center gap-2 btn-premium hover:scale-105 active:scale-95 transition-all"
            >
              <Pause className="w-4 h-4" />
              ⏸ PAUSE
            </button>

            {/* BREAK: Yellow */}
            <button
              type="button"
              onClick={() => takeBreak('Rest')}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-xs shadow-[0_4px_20px_rgba(234,179,8,0.35)] flex items-center gap-2 btn-premium hover:scale-105 active:scale-95 transition-all"
            >
              <Coffee className="w-4 h-4" />
              ☕ BREAK
            </button>

            {/* STOP: Red */}
            <button
              type="button"
              onClick={handleStop}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-black text-xs shadow-[0_4px_20px_rgba(239,68,68,0.35)] flex items-center gap-2 btn-premium hover:scale-105 active:scale-95 transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              ■ STOP
            </button>
          </>
        )}

        {isPaused && (
          <>
            {/* RESUME / START: Sky Blue */}
            <button
              type="button"
              onClick={resumeStudy}
              className="py-3 px-7 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-xs shadow-[0_4px_20px_rgba(14,165,233,0.45)] flex items-center gap-2 btn-premium hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              ▶ RESUME
            </button>

            {/* BREAK: Yellow */}
            <button
              type="button"
              onClick={() => takeBreak('Rest')}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-xs shadow-[0_4px_20px_rgba(234,179,8,0.35)] flex items-center gap-2 btn-premium hover:scale-105 active:scale-95 transition-all"
            >
              <Coffee className="w-4 h-4" />
              ☕ BREAK
            </button>

            {/* STOP: Red */}
            <button
              type="button"
              onClick={handleStop}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-black text-xs shadow-[0_4px_20px_rgba(239,68,68,0.35)] flex items-center gap-2 btn-premium hover:scale-105 active:scale-95 transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              ■ STOP
            </button>
          </>
        )}

        {isBreak && (
          <>
            {/* END BREAK & RESUME: Sky Blue */}
            <button
              type="button"
              onClick={resumeStudy}
              className="py-3 px-7 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-xs shadow-[0_4px_20px_rgba(14,165,233,0.45)] flex items-center gap-2 btn-premium hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              ▶ END BREAK & RESUME
            </button>

            {/* STOP: Red */}
            <button
              type="button"
              onClick={handleStop}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-black text-xs shadow-[0_4px_20px_rgba(239,68,68,0.35)] flex items-center gap-2 btn-premium hover:scale-105 active:scale-95 transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              ■ STOP
            </button>
          </>
        )}
      </div>

      {/* Real Stored Session Rollup Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-100 dark:border-white/[0.07] text-center text-xs">
        <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.025] border border-slate-100 dark:border-white/[0.05]">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            Today's {currentSubject ? currentSubject.name : 'Subject'}:
          </span>
          <span className="text-sm sm:text-base font-black text-slate-800 dark:text-white font-mono">
            {formatDuration(todaySubjectMinutes)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.025] border border-slate-100 dark:border-white/[0.05]">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            Today's Course Total:
          </span>
          <span className="text-sm sm:text-base font-black text-sky-400 font-mono">
            {formatDuration(todayCourseMinutes)}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.025] border border-slate-100 dark:border-white/[0.05]">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            Total {currentSubject ? currentSubject.name : 'Subject'} Hours:
          </span>
          <span className="text-sm sm:text-base font-black text-slate-800 dark:text-white font-mono">
            {formatDuration(totalSubjectMinutes)}
          </span>
        </div>
      </div>
    </div>
  );
}
