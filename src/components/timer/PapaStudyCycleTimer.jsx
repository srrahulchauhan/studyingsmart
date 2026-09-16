import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatSeconds, formatDuration } from '../../utils/dateUtils';
import { sounds } from '../../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  FastForward,
  CheckCircle2,
  Heart,
  Smile,
  ShieldCheck,
  Flame,
  Clock,
  Layers,
} from 'lucide-react';
import ProgressRing from '../common/ProgressRing';
import GlassIcon from '../common/GlassIcon';

export default function PapaStudyCycleTimer() {
  const {
    courses,
    subjects,
    topics,
    activeCourseId,
    addStudySession,
    addNotification,
  } = useStudy();

  // Study & Break Durations (in seconds)
  const STUDY_SECONDS = 30 * 60; // 30 minutes
  const BREAK_SECONDS = 15 * 60; // 15 minutes

  // Core Timer State
  const [phase, setPhase] = useState('study'); // 'study' | 'break'
  const [remainingSeconds, setRemainingSeconds] = useState(STUDY_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);
  const [completedStudySessions, setCompletedStudySessions] = useState(0);

  // Reminders & Banners
  const [showPapaBreakModal, setShowPapaBreakModal] = useState(false);
  const [showBreakEndBanner, setShowBreakEndBanner] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Subject / Course tagging for real history accumulation
  const [selectedCourseId, setSelectedCourseId] = useState(
    activeCourseId || (courses.length > 0 ? courses[0].id : '')
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const availableSubjects = subjects.filter(
    (s) => !selectedCourseId || s.courseId === selectedCourseId
  );
  const availableTopics = topics.filter(
    (t) => !selectedSubjectId || t.subjectId === selectedSubjectId
  );

  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentTopic = topics.find((t) => t.id === selectedTopicId);

  // Voice Speech Synthesizer Helper
  const speakText = (text) => {
    if (!soundEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  };

  // Main 1-second countdown ticker
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // TRANSITION TIME! (00:00 reached)
        if (phase === 'study') {
          // 30 MIN STUDY COMPLETED!
          if (soundEnabled) {
            sounds.playBreakAlert();
            speakText('Dear, take a 15-minute rest now, then continue studying.');
          }

          // Save completed 30-minute session to real history
          if (selectedCourseId) {
            addStudySession({
              courseId: selectedCourseId,
              subjectId: selectedSubjectId || null,
              topicId: selectedTopicId || null,
              durationMinutes: 30,
              breakMinutes: 0,
              startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              endTime: new Date().toISOString(),
              notes: `Papa Cycle #${cycleCount} (30 Min Focus)`,
            });
          }

          addNotification({
            title: 'Break Time – 15 Minutes ☕',
            message: 'Papa Message: Dear, take a 15-minute rest now, then continue studying.',
            type: 'info',
          });

          // Show prominent Papa Break Modal
          setShowPapaBreakModal(true);
          setShowBreakEndBanner(false);
          setCompletedStudySessions((c) => c + 1);

          // Switch to 15 min Break and keep running automatically
          setPhase('break');
          return BREAK_SECONDS;
        } else {
          // 15 MIN BREAK COMPLETED!
          if (soundEnabled) {
            sounds.playTimerCompletion();
            speakText('Break is finished. Time to continue studying now.');
          }

          addNotification({
            title: 'Break Finished! 🔔',
            message: 'Break is finished — Time to continue studying now.',
            type: 'success',
          });

          setShowPapaBreakModal(false);
          setShowBreakEndBanner(true);
          setCycleCount((c) => c + 1);

          // Switch to 30 min Study and keep running automatically
          setPhase('study');
          return STUDY_SECONDS;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    phase,
    selectedCourseId,
    selectedSubjectId,
    selectedTopicId,
    cycleCount,
    soundEnabled,
    addStudySession,
    addNotification,
  ]);

  // Handler: Start / Resume
  const handleStart = () => {
    sounds.playClick();
    setIsRunning(true);
    setShowBreakEndBanner(false);
  };

  // Handler: Pause
  const handlePause = () => {
    sounds.playClick();
    setIsRunning(false);
  };

  // Handler: Reset (Reset entire timer back to 30:00 Study)
  const handleReset = () => {
    sounds.playClick();
    setIsRunning(false);
    setPhase('study');
    setRemainingSeconds(STUDY_SECONDS);
    setShowPapaBreakModal(false);
    setShowBreakEndBanner(false);
  };

  // Handler: Skip to Next Phase manually
  const handleSkipPhase = () => {
    sounds.playClick();
    if (phase === 'study') {
      setPhase('break');
      setRemainingSeconds(BREAK_SECONDS);
      setShowPapaBreakModal(true);
      setShowBreakEndBanner(false);
    } else {
      setPhase('study');
      setRemainingSeconds(STUDY_SECONDS);
      setShowPapaBreakModal(false);
      setShowBreakEndBanner(true);
      setCycleCount((c) => c + 1);
    }
  };

  // Percent calculation for progress ring
  const currentTotal = phase === 'study' ? STUDY_SECONDS : BREAK_SECONDS;
  const elapsedInPhase = currentTotal - remainingSeconds;
  const progressPercent = Math.min(100, Math.round((elapsedInPhase / currentTotal) * 100));

  return (
    <div className="space-y-4 sm:space-y-5 animate-fadeIn max-w-3xl mx-auto">
      {/* PAPA BREAK MODAL */}
      {showPapaBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0a0f1d] border-2 border-pink-400 dark:border-pink-500/60 p-5 sm:p-6 shadow-[0_20px_70px_rgba(236,72,153,0.35)] text-center relative overflow-hidden animate-scaleIn">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Papa Avatar & Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-yellow-400 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-pink-500/30 animate-bounce">
              👨‍👦
            </div>

            {/* Title */}
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-pink-500/15 text-pink-500 dark:text-pink-400 border border-pink-400/30 text-xs font-black uppercase tracking-widest mb-2">
              <Coffee className="w-3.5 h-3.5" />
              Break Time – 15 Minutes
            </div>

            {/* The Heartwarming Papa Message */}
            <div className="p-4 rounded-2xl bg-pink-500/10 dark:bg-white/[0.04] border border-pink-500/25 my-2 text-left">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-500 dark:text-pink-400 mb-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                Papa Message
              </div>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-relaxed font-sans">
                “Dear, take a 15-minute rest now, then continue studying.”
              </p>
            </div>

            {/* Live Break Countdown inside modal */}
            <div className="my-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Break Remaining
              </div>
              <div className="digital-timer text-3xl sm:text-4xl font-black text-pink-500 dark:text-pink-400 mt-0.5">
                {formatSeconds(remainingSeconds)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                The next 30-minute study session will begin automatically when break ends.
              </p>
            </div>

            {/* Relax suggestions */}
            <div className="grid grid-cols-3 gap-1.5 my-3 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
                💧 Drink Water
              </div>
              <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
                👀 Rest Eyes
              </div>
              <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
                🚶 Take a Walk
              </div>
            </div>

            {/* Close / Dismiss Dialog */}
            <button
              type="button"
              onClick={() => setShowPapaBreakModal(false)}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-400 hover:to-pink-300 text-white font-extrabold text-xs shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Got it Papa, resting now 👍
            </button>
          </div>
        </div>
      )}

      {/* BREAK END REMINDER BANNER */}
      {showBreakEndBanner && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-sky-500/15 to-emerald-500/15 border border-emerald-400/50 shadow-md flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md shadow-emerald-500/30">
              🔔
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Break Complete!
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                “Break is finished — Time to continue studying now.”
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBreakEndBanner(false)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-transform active:scale-95 shrink-0"
          >
            Got it!
          </button>
        </div>
      )}

      {/* TOP HEADER & INFO CARD - Premium Glassmorphic Design */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-[#070c18]/90 border border-slate-200/80 dark:border-white/[0.10] backdrop-blur-2xl shadow-xl transition-all duration-300 hover:border-sky-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Subtle Ambient Background Glow Orbs */}
        <div className="absolute top-0 right-10 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-500 dark:text-sky-400 border border-sky-400/30 text-[10px] font-black uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Special 30m Study → 15m Break Loop
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-2">
            Study Timer
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-amber-500/20 text-pink-500 dark:text-pink-400 border border-pink-400/40 text-[11px] font-extrabold shadow-xs">
              <span>👨‍👦</span>
              <span>Papa Special Mode</span>
            </span>
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-300 font-medium leading-relaxed">
            30 Minutes Continuous Study <span className="text-sky-400 font-bold">➔</span> 15 Minutes Rest <span className="text-pink-400 font-bold">➔</span> Automatic Next Study Session.
          </p>
        </div>

        {/* Audio Toggle & Cycle Counter */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-500 dark:text-amber-400 text-xs font-bold backdrop-blur-md shadow-xs">
            <Flame className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-pulse" />
            <span className="text-slate-400 uppercase text-[9px] tracking-wider">Cycle</span>
            <span className="text-slate-900 dark:text-white font-mono font-black text-xs">#{cycleCount}</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md ${
              soundEnabled
                ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white border-sky-400 shadow-sky-500/25'
                : 'bg-slate-100 dark:bg-white/[0.05] border-slate-200 dark:border-white/10 text-slate-400'
            }`}
            title={soundEnabled ? 'Voice & Chimes Enabled' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* MAIN TIMER DISPLAY CARD */}
      <div
        className={`relative overflow-hidden rounded-3xl p-4 sm:p-6 text-center backdrop-blur-2xl transition-all duration-500 border shadow-xl ${
          phase === 'study'
            ? 'bg-white/90 dark:bg-[#070c18]/90 border-sky-400/30 dark:border-sky-400/20 shadow-sky-500/10'
            : 'bg-white/90 dark:bg-[#070c18]/90 border-pink-400/40 dark:border-pink-500/30 shadow-pink-500/15'
        }`}
      >
        {/* Dynamic Glow Background Orbs */}
        <div
          className={`absolute top-0 right-1/4 w-60 h-60 rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-700 ${
            phase === 'study' ? 'bg-sky-500/[0.08]' : 'bg-pink-500/[0.12]'
          }`}
        />
        <div
          className={`absolute bottom-0 left-1/4 w-60 h-60 rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-700 ${
            phase === 'study' ? 'bg-yellow-500/[0.05]' : 'bg-yellow-500/[0.08]'
          }`}
        />

        {/* Current Course & Topic context tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200">
            {currentCourse ? currentCourse.name : 'General Curriculum'}
          </span>
          {currentSubject && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-400/25">
              {currentSubject.name}
            </span>
          )}
          {currentTopic && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-yellow-500/15 text-yellow-400 border border-yellow-400/25">
              {currentTopic.name}
            </span>
          )}
        </div>

        {/* CURRENT STATUS BADGE (STUDY / BREAK) */}
        <div className="mb-4">
          {phase === 'study' ? (
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-500/15 border border-sky-400/40 text-sky-500 dark:text-sky-400 font-extrabold text-xs shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              <span className="relative flex h-2 w-2">
                {isRunning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-80" />
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
              </span>
              <span>● STUDY STATUS: FOCUSING (30 MIN)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-pink-500/15 border border-pink-400/50 text-pink-500 dark:text-pink-400 font-extrabold text-xs shadow-[0_0_24px_rgba(236,72,153,0.35)] animate-pulse">
              <Coffee className="w-3.5 h-3.5" />
              <span>☕ BREAK TIME – 15 MINUTES</span>
            </div>
          )}
        </div>

        {/* COMPACT DIGITAL COUNTDOWN & PROGRESS RING */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative mb-2">
            <ProgressRing
              progress={progressPercent}
              size={190}
              strokeWidth={10}
              variant={phase === 'study' ? 'sky' : 'pink'}
            >
              <div className="flex flex-col items-center justify-center select-none">
                <div className="digital-timer text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatSeconds(remainingSeconds)}
                </div>
                <div className="text-[10px] uppercase font-black tracking-widest mt-0.5 text-slate-400">
                  {phase === 'study' ? 'Study Time Left' : 'Break Time Left'}
                </div>
                <div className="text-[10px] font-mono font-bold mt-0.5 text-slate-500 dark:text-slate-300">
                  {progressPercent}% Complete
                </div>
              </div>
            </ProgressRing>
          </div>

          {/* Subtitle Countdown Notice */}
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {phase === 'study'
              ? 'When 30:00 reaches zero, a 15-minute break begins automatically.'
              : 'When 15:00 reaches zero, the next 30-minute study session starts automatically.'}
          </p>
        </div>

        {/* PAPA'S REMINDER QUOTE CARD */}
        <div className="max-w-lg mx-auto my-3 p-3 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 backdrop-blur-md text-left flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-pink-500 text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
            👨‍👧
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-wider text-pink-500 dark:text-pink-400">
              Papa's Reminder
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {phase === 'study'
                ? '“Focus deeply for 30 minutes. You will get a 15-minute break right after.”'
                : '“Dear, take a 15-minute rest now, then continue studying.”'}
            </div>
          </div>
        </div>

        {/* PRIMARY CONTROLS: START, PAUSE, RESET */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStart}
              className="py-4 px-8 sm:px-10 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-sm sm:text-base shadow-xl shadow-sky-500/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              ▶ START {phase === 'study' ? 'STUDY (30M)' : 'BREAK (15M)'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="py-4 px-8 sm:px-10 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-yellow-500/25 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
            >
              <Pause className="w-5 h-5 fill-current" />
              ⏸ PAUSE
            </button>
          )}

          {/* RESET BUTTON (Always resets back to 30:00 Study) */}
          <button
            type="button"
            onClick={handleReset}
            className="py-4 px-6 rounded-2xl bg-slate-100 dark:bg-white/[0.08] hover:bg-rose-500/15 hover:text-rose-500 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            title="Reset timer to 30:00 Study"
          >
            <RotateCcw className="w-4 h-4" />
            RESET
          </button>

          {/* SKIP BUTTON */}
          <button
            type="button"
            onClick={handleSkipPhase}
            className="py-4 px-5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all"
            title="Skip to next phase"
          >
            <FastForward className="w-4 h-4" />
            Skip Phase
          </button>
        </div>

        {/* CYCLE METRICS FOOTER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.08] text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
              Study Interval
            </span>
            <span className="font-extrabold text-sky-500 dark:text-sky-400 font-mono text-sm">
              30 Minutes
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
              Break Interval
            </span>
            <span className="font-extrabold text-pink-500 dark:text-pink-400 font-mono text-sm">
              15 Minutes
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
              Completed Loops
            </span>
            <span className="font-extrabold text-yellow-500 dark:text-yellow-400 font-mono text-sm">
              {completedStudySessions} Sessions
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
              Total Verified Study
            </span>
            <span className="font-extrabold text-emerald-500 dark:text-emerald-400 font-mono text-sm">
              {formatDuration(completedStudySessions * 30)}
            </span>
          </div>
        </div>
      </div>

      {/* CURRICULUM CONTEXT ACCORDION (Optional Tagging) */}
      <div className="p-5 rounded-3xl bg-white/80 dark:bg-[#070c18]/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          Assign Study Session to Course & Subject
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedSubjectId('');
                setSelectedTopicId('');
              }}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId('');
              }}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">All Subjects</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">All Topics</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
