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
  Heart,
} from 'lucide-react';
import BreakModal from '../components/timer/BreakModal';
import PapaStudyCycleTimer from '../components/timer/PapaStudyCycleTimer';

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

  // Mode Selection: 'papa' (30m Study -> 15m Break) or 'standard' (Freeflow Stopwatch)
  const [timerMode, setTimerMode] = useState('papa'); // Default to Papa 30/15 Special

  // Selection form for starting a session in standard mode
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
    <div className="space-y-2.5 animate-fadeIn pb-4 max-w-3xl mx-auto">
      {/* Break Mode Modal for standard session */}
      <BreakModal />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 backdrop-blur-xl max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setTimerMode('papa')}
          className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-1.5 ${
            timerMode === 'papa'
              ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-md shadow-sky-500/25 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="text-sm">👨‍👦</span>
          <span>30m Study → 15m Break (Papa Cycle)</span>
          <span className="hidden sm:inline text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-white/20 text-white">
            AUTO-LOOP
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTimerMode('standard')}
          className={`flex-1 py-1.5 px-3 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-1.5 ${
            timerMode === 'standard'
              ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-md shadow-sky-500/25 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Standard Stopwatch & Pomodoro</span>
        </button>
      </div>

      {/* RENDER PAPA STUDY CYCLE TIMER (When active) */}
      {timerMode === 'papa' && <PapaStudyCycleTimer />}

      {/* RENDER STANDARD STOPWATCH / POMODORO TIMER */}
      {timerMode === 'standard' && (
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                <Timer className="w-3.5 h-3.5" />
                Accurate Study Control
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Standard Study Timer
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Timestamp-based tracking. Break & pause intervals excluded from active hours.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPomodoroMode(!pomodoroMode)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  pomodoroMode
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                🍅 Pomodoro: {pomodoroMode ? 'ON' : 'OFF'}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('focus')}
                className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Focus Mode
              </button>
            </div>
          </div>

          {/* Main Timer Display Card */}
          <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.09] shadow-xl p-5 sm:p-6 text-center backdrop-blur-2xl">
            <div className="absolute top-1/4 -right-10 w-60 h-60 bg-sky-500/[0.08] rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 -left-10 w-60 h-60 bg-pink-500/[0.06] rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-xl mx-auto">
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-400/25">
                  {currentCourse ? currentCourse.name : 'Select Course'}
                </span>
                {currentSubject && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-500/15 text-pink-400 border border-pink-400/25">
                    {currentSubject.name}
                  </span>
                )}
                {currentTopic && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400 border border-yellow-400/25">
                    {currentTopic.name}
                  </span>
                )}
              </div>

              {/* Live Status Badge */}
              <div className="mb-2">
                {isRunning ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-400/30 text-[11px] font-bold shadow-[0_0_16px_rgba(14,165,233,0.3)] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                    ● STUDYING
                  </span>
                ) : isPaused ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-400/30 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    ● PAUSED
                  </span>
                ) : isBreak ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-400/30 text-[11px] font-bold animate-pulse">
                    <Coffee className="w-3.5 h-3.5 text-pink-400" />
                    ☕ ON BREAK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 text-[11px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    ○ READY TO STUDY
                  </span>
                )}
              </div>

              {/* DIGITAL CLOCK */}
              <div className="my-4">
                <div className="digital-timer text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white select-none">
                  {pomodoroMode && activeSession
                    ? formatSeconds(pomodoroRemainingSeconds)
                    : formatSeconds(elapsedActiveSeconds)}
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest font-mono">
                  {pomodoroMode && activeSession ? 'Pomodoro Remaining' : 'Verified Focus Duration'}
                </div>
              </div>

              {/* Pomodoro Presets */}
              {pomodoroMode && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  {['25/5', '50/10', '45/15'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPomodoroPreset(preset)}
                      className={`py-1 px-2.5 rounded-xl text-xs font-bold transition-all ${
                        pomodoroPreset === preset
                          ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-md shadow-pink-500/25'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}

              {/* Session Metrics Bar */}
              {activeSession && (
                <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-2xl bg-white/40 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Started At</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 font-mono text-xs">
                      {formatTime(activeSession.startTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Break Time</span>
                    <span className="font-bold text-yellow-400 font-mono text-xs">
                      {formatSeconds(elapsedBreakSeconds)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Net Study Time</span>
                    <span className="font-bold text-sky-400 font-mono text-xs">
                      {formatDuration(Math.floor(elapsedActiveSeconds / 60))}
                    </span>
                  </div>
                </div>
              )}

              {/* PRIMARY TIMER CONTROLS */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                {!activeSession ? (
                  <button
                    type="button"
                    onClick={handleStart}
                    disabled={!selectedCourseId}
                    className="py-3 px-8 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    ▶ START STUDY
                  </button>
                ) : (
                  <>
                    {isRunning ? (
                      <button
                        type="button"
                        onClick={pauseStudy}
                        className="py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        ⏸ PAUSE
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={resumeStudy}
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 text-white font-black text-xs shadow-md shadow-sky-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        ▶ RESUME
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => takeBreak('Rest')}
                      className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-300 text-slate-950 font-black text-xs shadow-md shadow-yellow-400/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      ☕ BREAK
                    </button>

                    <button
                      type="button"
                      onClick={() => stopStudy(false)}
                      className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-black text-xs shadow-md shadow-red-500/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      ■ STOP & SAVE
                    </button>

                    {activeSession.topicId && (
                      <button
                        type="button"
                        onClick={completeTopicFromTimer}
                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 text-white font-black text-xs shadow-md shadow-pink-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        COMPLETE TOPIC
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={cancelStudy}
                      className="py-2.5 px-3 rounded-xl text-slate-400 hover:text-red-400 text-xs transition-colors"
                      title="Discard Session"
                    >
                      Discard
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Course / Subject / Topic Target Selection Card */}
          {!activeSession && (
            <div className="bg-white/80 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Select Study Target
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">
                    Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setSelectedSubjectId('');
                      setSelectedTopicId('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">
                    Subject (Optional)
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedTopicId('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">-- General Course Study --</option>
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1 text-[10px]">
                    Topic (Optional)
                  </label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
      )}
    </div>
  );
}

);
}
