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
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* PAPA BREAK MODAL (High-Visibility Heartwarming Alert - Pops up when 30m Study Finishes) */}
      {showPapaBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0a0f1d] border-2 border-pink-400 dark:border-pink-500/60 p-6 sm:p-8 shadow-[0_20px_70px_rgba(236,72,153,0.35)] text-center relative overflow-hidden animate-scaleIn">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Papa Avatar & Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-pink-500 to-yellow-400 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-pink-500/30 animate-bounce">
              👨‍👦
            </div>

            {/* Title */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/15 text-pink-500 dark:text-pink-400 border border-pink-400/30 text-xs font-black uppercase tracking-widest mb-3">
              <Coffee className="w-3.5 h-3.5" />
              Break Time – 15 Minutes
            </div>

            {/* The Heartwarming Papa Message */}
            <div className="p-5 sm:p-6 rounded-2xl bg-pink-500/10 dark:bg-white/[0.04] border border-pink-500/25 my-3 text-left">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-500 dark:text-pink-400 mb-1.5">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                Papa Message
              </div>
              <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-relaxed font-sans">
                “बेटा, 15 मिनट आराम कर लो, फिर पढ़ाई Continue करना।”
              </p>
            </div>

            {/* Live Break Countdown inside modal */}
            <div className="my-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Break Remaining
              </div>
              <div className="digital-timer text-4xl sm:text-5xl font-black text-pink-500 dark:text-pink-400 mt-1">
                {formatSeconds(remainingSeconds)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                15 मिनट पूरे होते ही अगला Study Session अपने-आप शुरू होगा।
              </p>
            </div>

            {/* Relax suggestions */}
            <div className="grid grid-cols-3 gap-2 my-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
                💧 पानी पियो
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
                👀 आँखें आराम दो
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
                🚶 थोड़ा टहलो
              </div>
            </div>

            {/* Close / Dismiss Dialog (Timer continues in background) */}
            <button
              type="button"
              onClick={() => setShowPapaBreakModal(false)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-400 hover:to-pink-300 text-white font-extrabold text-sm shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              ठीक है पापा, आराम कर रहा हूँ 👍
            </button>
          </div>
        </div>
      )}

      {/* BREAK END REMINDER BANNER */}
      {showBreakEndBanner && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-sky-500/15 to-emerald-500/15 border-2 border-emerald-400/50 shadow-lg flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md shadow-emerald-500/30">
              🔔
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Break Complete!
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                “Break खत्म हो गया — अब Study Continue करें।”
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBreakEndBanner(false)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-transform active:scale-95 shrink-0"
          >
            Got it!
          </button>
        </div>
      )}

      {/* TOP HEADER & INFO CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#070c18]/90 border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400 mb-1">
            <Sparkles className="w-4 h-4" />
            Special 30m Study → 15m Break Loop
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Study Timer
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-500 border border-pink-400/30">
              Papa Special Mode
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
            30 मिनट लगातार Study ➔ 15 मिनट आराम ➔ अपने-आप अगला 30 मिनट Study (Continuous Cycle).
          </p>
        </div>

        {/* Audio Toggle & Cycle Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-xs font-bold">
            <Flame className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-slate-400 uppercase text-[10px]">Cycle</span>
            <span className="text-slate-900 dark:text-white font-mono font-black">#{cycleCount}</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2.5 rounded-2xl border transition-all ${
              soundEnabled
                ? 'bg-sky-500/15 border-sky-400/30 text-sky-500 dark:text-sky-400'
                : 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-400'
            }`}
            title={soundEnabled ? 'Voice & Chimes Enabled' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAIN TIMER DISPLAY CARD */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 text-center backdrop-blur-2xl transition-all duration-500 border shadow-xl ${
          phase === 'study'
            ? 'bg-white/90 dark:bg-[#070c18]/90 border-sky-400/30 dark:border-sky-400/20 shadow-sky-500/10'
            : 'bg-white/90 dark:bg-[#070c18]/90 border-pink-400/40 dark:border-pink-500/30 shadow-pink-500/15'
        }`}
      >
        {/* Dynamic Glow Background Orbs */}
        <div
          className={`absolute top-0 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-700 ${
            phase === 'study' ? 'bg-sky-500/[0.08]' : 'bg-pink-500/[0.12]'
          }`}
        />
        <div
          className={`absolute bottom-0 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-700 ${
            phase === 'study' ? 'bg-yellow-500/[0.05]' : 'bg-yellow-500/[0.08]'
          }`}
        />

        {/* Current Course & Topic context tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200">
            {currentCourse ? currentCourse.name : 'General Curriculum'}
          </span>
          {currentSubject && (
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-400/25">
              {currentSubject.name}
            </span>
          )}
          {currentTopic && (
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-yellow-500/15 text-yellow-400 border border-yellow-400/25">
              {currentTopic.name}
            </span>
          )}
        </div>

        {/* CURRENT STATUS BADGE (STUDY / BREAK) */}
        <div className="mb-6">
          {phase === 'study' ? (
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-sky-500/15 border border-sky-400/40 text-sky-500 dark:text-sky-400 font-extrabold text-sm shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              <span className="relative flex h-2.5 w-2.5">
                {isRunning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-80" />
                )}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400" />
              </span>
              <span>● STUDY STATUS: FOCUSING (30 MIN)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-pink-500/15 border border-pink-400/50 text-pink-500 dark:text-pink-400 font-extrabold text-sm shadow-[0_0_24px_rgba(236,72,153,0.35)] animate-pulse">
              <Coffee className="w-4 h-4" />
              <span>☕ BREAK TIME – 15 MINUTES</span>
            </div>
          )}
        </div>

        {/* BIG DIGITAL COUNTDOWN & PROGRESS RING */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative mb-3">
            <ProgressRing
              progress={progressPercent}
              size={240}
              strokeWidth={12}
              variant={phase === 'study' ? 'sky' : 'pink'}
            >
              <div className="flex flex-col items-center justify-center select-none">
                <div className="digital-timer text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatSeconds(remainingSeconds)}
                </div>
                <div className="text-[11px] uppercase font-black tracking-widest mt-1 text-slate-400">
                  {phase === 'study' ? 'Study Time Left' : 'Break Time Left'}
                </div>
                <div className="text-[10px] font-mono font-bold mt-1 text-slate-500 dark:text-slate-300">
                  {progressPercent}% Complete
                </div>
              </div>
            </ProgressRing>
          </div>

          {/* Subtitle Countdown Notice */}
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
            {phase === 'study'
              ? '30:00 पूरे होते ही 15 मिनट का Break Timer अपने-आप शुरू होगा।'
              : '15:00 पूरे होते ही अगला 30 मिनट Study Session अपने-आप शुरू होगा।'}
          </p>
        </div>

        {/* PAPA'S REMINDER QUOTE CARD */}
        <div className="max-w-xl mx-auto my-6 p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 backdrop-blur-md text-left flex items-start gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
            👨‍👧
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-pink-500 dark:text-pink-400">
              Papa's Reminder
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {phase === 'study'
                ? '“मेहनत से 30 मिनट पढ़ाई करो। 30 मिनट के बाद 15 मिनट आराम मिलेगा।”'
                : '“बेटा, 15 मिनट आराम कर लो, फिर पढ़ाई Continue करना।”'}
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
