import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { formatSeconds, formatDuration, formatTime } from '../utils/dateUtils';
import {
  Timer,
  Play,
  Pause,
  Coffee,
  Square,
  CheckCircle2,
  Maximize2,
  RotateCcw,
  Sparkles,
  Flame,
  Clock,
  BookOpen,
  CalendarDays,
  CheckSquare,
} from 'lucide-react';
import BreakModal from '../components/timer/BreakModal';

export default function StudyTimerView({ onNavigate }) {
  const { courses, subjects, topics, studyPlans, activeCourseId } = useStudy();
  const {
    activeSession,
    elapsedActiveSeconds,
    elapsedBreakSeconds,
    startStudy,
    pauseStudy,
    resumeStudy,
    takeBreak,
    stopStudy,
    completeTopicFromTimer,
    cancelStudy,
    pomodoroMode,
    setPomodoroMode,
    pomodoroPreset,
    setPomodoroPreset,
    pomodoroRemainingSeconds,
  } = useTimer();

  // Selection form for starting a session
  const [selectedCourseId, setSelectedCourseId] = useState(
    activeSession ? activeSession.courseId : (activeCourseId || (courses.length > 0 ? courses[0].id : ''))
  );
  const [selectedPlanId, setSelectedPlanId] = useState(
    activeSession ? activeSession.studyPlanId || '' : ''
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    activeSession ? activeSession.subjectId || '' : ''
  );
  const [selectedTopicId, setSelectedTopicId] = useState(
    activeSession ? activeSession.topicId || '' : ''
  );

  const availableSubjects = subjects.filter(s => !selectedCourseId || s.courseId === selectedCourseId);
  const availableTopics = topics.filter(t => !selectedSubjectId || t.subjectId === selectedSubjectId);
  const availablePlans = studyPlans.filter(p => !selectedCourseId || p.courseId === selectedCourseId);

  const currentCourse = courses.find(c => c.id === (activeSession ? activeSession.courseId : selectedCourseId));
  const currentSubject = subjects.find(s => s.id === (activeSession ? activeSession.subjectId : selectedSubjectId));
  const currentTopic = topics.find(t => t.id === (activeSession ? activeSession.topicId : selectedTopicId));

  const isRunning = activeSession?.status === 'running';
  const isPaused = activeSession?.status === 'paused';
  const isBreak = activeSession?.status === 'break';

  const handleStart = () => {
    if (!selectedCourseId) return;
    startStudy({
      courseId: selectedCourseId,
      studyPlanId: selectedPlanId || null,
      subjectId: selectedSubjectId || null,
      topicId: selectedTopicId || null,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      {/* Break Mode Modal */}
      <BreakModal />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Timer className="w-4 h-4" />
            Accurate Study Control
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Study Timer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Timestamp-based tracking. Break & pause intervals are completely excluded from actual study hours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Pomodoro Toggle */}
          <button
            type="button"
            onClick={() => setPomodoroMode(!pomodoroMode)}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              pomodoroMode
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            🍅 Pomodoro: {pomodoroMode ? 'ON' : 'OFF'}
          </button>

          {/* Focus Mode Button */}
          <button
            type="button"
            onClick={() => onNavigate('focus')}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Focus Mode
          </button>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-6 sm:p-10 text-center relative overflow-hidden">
        {/* Active Session Status Ring & Details */}
        <div className="max-w-xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800">
              {currentCourse ? currentCourse.name : 'Select Course'}
            </span>
            {currentSubject && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-800">
                {currentSubject.name}
              </span>
            )}
            {currentTopic && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800">
                {currentTopic.name}
              </span>
            )}
          </div>

          {/* Live Status Badge */}
          <div className="mb-4">
            {isRunning ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                ACTIVE STUDYING
              </span>
            ) : isPaused ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                STUDY PAUSED
              </span>
            ) : isBreak ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                ON BREAK
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold">
                READY TO STUDY
              </span>
            )}
          </div>

          {/* BIG DIGITAL CLOCK */}
          <div className="my-6">
            <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-slate-900 dark:text-white select-none">
              {pomodoroMode && activeSession
                ? formatSeconds(pomodoroRemainingSeconds)
                : formatSeconds(elapsedActiveSeconds)}
            </div>
            <div className="text-xs font-medium text-slate-400 mt-2 uppercase tracking-widest">
              {pomodoroMode && activeSession ? 'Pomodoro Remaining' : 'Actual Study Duration (Active Time Only)'}
            </div>
          </div>

          {/* Pomodoro Presets if Mode Enabled */}
          {pomodoroMode && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {['25/5', '50/10', '45/15'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPomodoroPreset(preset)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    pomodoroPreset === preset
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}

          {/* Session Metrics Bar (When session is active) */}
          {activeSession && (
            <div className="grid grid-cols-3 gap-3 my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Started At</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {formatTime(activeSession.startTime)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Total Break Time</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatSeconds(elapsedBreakSeconds)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Net Study Time</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatDuration(Math.floor(elapsedActiveSeconds / 60))}
                </span>
              </div>
            </div>
          )}

          {/* PRIMARY TIMER CONTROLS */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!activeSession ? (
              <button
                type="button"
                onClick={handleStart}
                disabled={!selectedCourseId}
                className="py-4 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-base shadow-xl shadow-emerald-600/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                START STUDY
              </button>
            ) : (
              <>
                {isRunning ? (
                  <button
                    type="button"
                    onClick={pauseStudy}
                    className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    PAUSE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resumeStudy}
                    className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    RESUME
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => takeBreak('Rest')}
                  className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
                >
                  <Coffee className="w-4 h-4 text-amber-500" />
                  TAKE BREAK
                </button>

                <button
                  type="button"
                  onClick={() => stopStudy(false)}
                  className="py-3 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  STOP & SAVE
                </button>

                {activeSession.topicId && (
                  <button
                    type="button"
                    onClick={completeTopicFromTimer}
                    className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    COMPLETE TOPIC
                  </button>
                )}

                <button
                  type="button"
                  onClick={cancelStudy}
                  className="py-3 px-3 rounded-2xl text-slate-400 hover:text-rose-500 text-xs transition-colors"
                  title="Discard Session"
                >
                  Discard
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Course / Subject / Topic Selection Card (When Idle) */}
      {!activeSession && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Select Study Target
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Course */}
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedSubjectId('');
                  setSelectedTopicId('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Subject (Optional)
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedTopicId('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- General Course Study --</option>
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Topic (Optional)
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- General Subject Study --</option>
                {availableTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
