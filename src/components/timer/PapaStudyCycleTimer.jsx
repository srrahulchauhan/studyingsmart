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
  Bell,
  Check,
} from 'lucide-react';
import ProgressRing from '../common/ProgressRing';

export default function PapaStudyCycleTimer() {
  const {
    courses,
    subjects,
    topics,
    pendingTasks,
    activeCourseId,
    addStudySession,
    addNotification,
    completePendingTask,
    toggleTopicComplete,
  } = useStudy();

  // Durations (in seconds)
  const STUDY_TARGET_SECONDS = 30 * 60; // 30 minutes base target
  const BREAK_SECONDS = 15 * 60; // 15 minutes rest

  // Core Timer State
  const [phase, setPhase] = useState('study'); // 'study' | 'break'
  const [elapsedStudySeconds, setElapsedStudySeconds] = useState(0); // Actual seconds studied in current session
  const [breakRemainingSeconds, setBreakRemainingSeconds] = useState(BREAK_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);
  const [completedStudySessions, setCompletedStudySessions] = useState(0);

  // Time Over & Overtime Flags
  const [targetTimeAlertPlayed, setTargetTimeAlertPlayed] = useState(false);
  const [showTimeOverBanner, setShowTimeOverBanner] = useState(false);
  const [showPapaBreakModal, setShowPapaBreakModal] = useState(false);
  const [showBreakEndBanner, setShowBreakEndBanner] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Session start timestamp
  const sessionStartTimeRef = useRef(new Date().toISOString());

  // Subject / Course tagging for real history accumulation
  const [selectedCourseId, setSelectedCourseId] = useState(
    activeCourseId || (courses.length > 0 ? courses[0].id : '')
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedPendingTaskId, setSelectedPendingTaskId] = useState('');

  const availableSubjects = subjects.filter(
    (s) => !selectedCourseId || s.courseId === selectedCourseId
  );
  const availableTopics = topics.filter(
    (t) => !selectedSubjectId || t.subjectId === selectedSubjectId
  );
  const coursePendingTasks = pendingTasks.filter(
    (pt) => pt.status === 'Pending' && (!selectedCourseId || pt.courseId === selectedCourseId)
  );

  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentTopic = topics.find((t) => t.id === selectedTopicId);
  const currentPendingTask = pendingTasks.find((pt) => pt.id === selectedPendingTaskId);

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

  // Main 1-second interval ticker
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (phase === 'study') {
        setElapsedStudySeconds((prevSec) => {
          const nextSec = prevSec + 1;

          // TARGET TIME (30 MIN) REACHED!
          if (nextSec === STUDY_TARGET_SECONDS && !targetTimeAlertPlayed) {
            setTargetTimeAlertPlayed(true);
            setShowTimeOverBanner(true);

            if (soundEnabled) {
              sounds.playBreakAlert();
              speakText('Time Over! Target 30 minutes study completed. You can complete your subject now or continue extra study.');
            }

            addNotification({
              title: '⏰ Time Over! (Target 30m Reached)',
              message: 'Target study time reached! Click "Complete Subject" to save your progress, or continue extra study.',
              type: 'info',
            });
          }

          return nextSec;
        });
      } else {
        // BREAK PHASE
        setBreakRemainingSeconds((prev) => {
          if (prev > 1) return prev - 1;

          // BREAK FINISHED!
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

          // Switch back to 30 min Study
          setPhase('study');
          setElapsedStudySeconds(0);
          setTargetTimeAlertPlayed(false);
          setShowTimeOverBanner(false);
          sessionStartTimeRef.current = new Date().toISOString();
          return BREAK_SECONDS;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    phase,
    targetTimeAlertPlayed,
    soundEnabled,
    addNotification,
  ]);

  // Handler: COMPLETE SUBJECT & SAVE EXACT TIME STUDIED
  const handleCompleteSubjectAndSave = () => {
    sounds.playClick();

    // 1. Calculate actual study minutes (at least 1 minute if any seconds passed)
    const actualMinutes = Math.max(
      elapsedStudySeconds > 0 ? 1 : 0,
      Math.round(elapsedStudySeconds / 60)
    );

    // Target name for notification
    const targetName =
      currentPendingTask?.title ||
      currentTopic?.name ||
      currentSubject?.name ||
      currentCourse?.name ||
      'Subject';

    // 2. Add session to history if course selected and time spent
    if (selectedCourseId && actualMinutes > 0) {
      const isOver = elapsedStudySeconds > STUDY_TARGET_SECONDS;
      addStudySession({
        courseId: selectedCourseId,
        subjectId: selectedSubjectId || null,
        topicId: selectedTopicId || null,
        sessionDuration: actualMinutes,
        actualStudyDuration: actualMinutes,
        breakDuration: 0,
        startTime: sessionStartTimeRef.current,
        endTime: new Date().toISOString(),
        notes: `Completed "${targetName}" (${actualMinutes} min studied${isOver ? ' incl. Overtime' : ''})`,
      });
      setCompletedStudySessions((c) => c + 1);
    }

    // 3. Complete pending task / topic
    if (selectedPendingTaskId) {
      completePendingTask(selectedPendingTaskId);
      setSelectedPendingTaskId('');
    } else if (selectedTopicId) {
      toggleTopicComplete(selectedTopicId);
      const matchingPt = pendingTasks.find(
        (pt) => pt.topicId === selectedTopicId && pt.status === 'Pending'
      );
      if (matchingPt) completePendingTask(matchingPt.id);
    } else if (selectedSubjectId) {
      const matchingPt = pendingTasks.find(
        (pt) => pt.subjectId === selectedSubjectId && pt.status === 'Pending'
      );
      if (matchingPt) completePendingTask(matchingPt.id);
    } else if (coursePendingTasks.length > 0) {
      completePendingTask(coursePendingTasks[0].id);
    }

    // 4. Voice & Toast notification
    if (soundEnabled) {
      sounds.playTimerCompletion();
      speakText(`Great job! ${targetName} completed and ${actualMinutes} minutes recorded.`);
    }

    addNotification({
      title: 'Subject Completed! ✅',
      message: `${actualMinutes} minutes saved to "${targetName}". Task marked completed!`,
      type: 'success',
    });

    // 5. Reset timer for next topic / subject session
    setElapsedStudySeconds(0);
    setTargetTimeAlertPlayed(false);
    setShowTimeOverBanner(false);
    sessionStartTimeRef.current = new Date().toISOString();
  };

  // Handler: Start / Resume
  const handleStart = () => {
    sounds.playClick();
    if (elapsedStudySeconds === 0) {
      sessionStartTimeRef.current = new Date().toISOString();
    }
    setIsRunning(true);
    setShowBreakEndBanner(false);
  };

  // Handler: Pause
  const handlePause = () => {
    sounds.playClick();
    setIsRunning(false);
  };

  // Handler: Reset Timer
  const handleReset = () => {
    sounds.playClick();
    setIsRunning(false);
    setPhase('study');
    setElapsedStudySeconds(0);
    setBreakRemainingSeconds(BREAK_SECONDS);
    setTargetTimeAlertPlayed(false);
    setShowTimeOverBanner(false);
    setShowPapaBreakModal(false);
    setShowBreakEndBanner(false);
    sessionStartTimeRef.current = new Date().toISOString();
  };

  // Handler: Switch to Break
  const handleStartBreak = () => {
    sounds.playClick();
    setPhase('break');
    setBreakRemainingSeconds(BREAK_SECONDS);
    setShowPapaBreakModal(true);
    setShowTimeOverBanner(false);
  };

  // Handler: Skip Phase
  const handleSkipPhase = () => {
    sounds.playClick();
    if (phase === 'study') {
      handleStartBreak();
    } else {
      setPhase('study');
      setElapsedStudySeconds(0);
      setTargetTimeAlertPlayed(false);
      setShowTimeOverBanner(false);
      setShowPapaBreakModal(false);
      setShowBreakEndBanner(true);
      setCycleCount((c) => c + 1);
      sessionStartTimeRef.current = new Date().toISOString();
    }
  };

  // Computed Values
  const isOvertime = phase === 'study' && elapsedStudySeconds > STUDY_TARGET_SECONDS;
  const remainingTargetSeconds = Math.max(0, STUDY_TARGET_SECONDS - elapsedStudySeconds);
  const overtimeSeconds = Math.max(0, elapsedStudySeconds - STUDY_TARGET_SECONDS);
  const studiedMinutes = Math.round(elapsedStudySeconds / 60);

  // Progress percent for ring
  const progressPercent =
    phase === 'study'
      ? Math.min(100, Math.round((elapsedStudySeconds / STUDY_TARGET_SECONDS) * 100))
      : Math.min(100, Math.round(((BREAK_SECONDS - breakRemainingSeconds) / BREAK_SECONDS) * 100));

  return (
    <div className="space-y-3.5 animate-fadeIn max-w-3xl mx-auto">
      {/* TIME OVER BANNER (Triggered when 30m target reached) */}
      {showTimeOverBanner && phase === 'study' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border-2 border-amber-400 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-bounce-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-amber-500/30">
              ⏰
            </div>
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span>Time Over! (Target 30 Minutes Reached)</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                You can complete your subject now, or continue studying extra time!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCompleteSubjectAndSave}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete & Save ({studiedMinutes}m)
            </button>
            <button
              type="button"
              onClick={() => setShowTimeOverBanner(false)}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              Continue Overtime
            </button>
          </div>
        </div>
      )}

      {/* PAPA BREAK MODAL */}
      {showPapaBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0a0f1d] border-2 border-pink-400 dark:border-pink-500/60 p-5 sm:p-6 shadow-[0_20px_70px_rgba(236,72,153,0.35)] text-center relative overflow-hidden animate-scaleIn">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-yellow-400 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-pink-500/30 animate-bounce">
              👨‍👦
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-pink-500/15 text-pink-500 dark:text-pink-400 border border-pink-400/30 text-xs font-black uppercase tracking-widest mb-2">
              <Coffee className="w-3.5 h-3.5" />
              Break Time – 15 Minutes
            </div>

            <div className="p-4 rounded-2xl bg-pink-500/10 dark:bg-white/[0.04] border border-pink-500/25 my-2 text-left">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pink-500 dark:text-pink-400 mb-1">
                <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                Papa Message
              </div>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-relaxed font-sans">
                “Dear, take a 15-minute rest now, then continue studying.”
              </p>
            </div>

            <div className="my-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Break Remaining
              </div>
              <div className="digital-timer text-3xl sm:text-4xl font-black text-pink-500 dark:text-pink-400 mt-0.5">
                {formatSeconds(breakRemainingSeconds)}
              </div>
            </div>

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
        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-sky-500/15 to-emerald-500/15 border border-emerald-400/50 shadow-md flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-emerald-500/30">
              🔔
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Break Complete!
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                “Break is finished — Time to continue studying now.”
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowBreakEndBanner(false)}
            className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-transform active:scale-95 shrink-0"
          >
            Got it!
          </button>
        </div>
      )}

      {/* UNIFIED COMPACT GLASS CONTROL CENTER PANEL */}
      <div
        className={`relative overflow-hidden rounded-3xl p-3.5 sm:p-4 text-center backdrop-blur-2xl transition-all duration-500 border shadow-xl ${
          isOvertime
            ? 'bg-amber-500/[0.03] dark:bg-[#120d05]/90 border-amber-500/40 shadow-amber-500/20'
            : phase === 'study'
            ? 'bg-white/90 dark:bg-[#070c18]/90 border-sky-400/30 dark:border-sky-400/20 shadow-sky-500/10'
            : 'bg-white/90 dark:bg-[#070c18]/90 border-pink-400/40 dark:border-pink-500/30 shadow-pink-500/15'
        }`}
      >
        {/* Dynamic Glow Background Orbs */}
        <div
          className={`absolute top-0 right-1/4 w-48 h-48 rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-700 ${
            isOvertime
              ? 'bg-amber-500/[0.15]'
              : phase === 'study'
              ? 'bg-sky-500/[0.08]'
              : 'bg-pink-500/[0.12]'
          }`}
        />

        {/* TOP BAR INSIDE PANEL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-2 text-left">
            <span className="text-xl">👨‍👦</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Study Timer
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-amber-500/20 text-pink-500 dark:text-pink-400 border border-pink-400/30 text-[9px] font-extrabold">
                  Papa Special Mode
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                30m Target Study <span className="text-sky-400 font-bold">➔</span> Overtime Supported <span className="text-pink-400 font-bold">➔</span> Exact Time Recorded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-500 dark:text-amber-400 text-xs font-bold backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 animate-pulse" />
              <span className="text-slate-400 uppercase text-[9px]">Cycle</span>
              <span className="text-slate-900 dark:text-white font-mono font-black text-xs">#{cycleCount}</span>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs ${
                soundEnabled
                  ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white border-sky-400 shadow-sky-500/25'
                  : 'bg-slate-100 dark:bg-white/[0.05] border-slate-200 dark:border-white/10 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{soundEnabled ? 'Audio On' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* TARGET CURRICULUM & PENDING TASK SELECTION INLINE BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 my-2.5 p-2 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] text-left">
          <div>
            <label className="text-[9px] font-extrabold text-slate-400 uppercase block px-1 mb-0.5">
              Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedSubjectId('');
                setSelectedTopicId('');
                setSelectedPendingTaskId('');
              }}
              className="w-full text-xs font-semibold p-1.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 truncate"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] font-extrabold text-slate-400 uppercase block px-1 mb-0.5">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId('');
                setSelectedPendingTaskId('');
              }}
              className="w-full text-xs font-semibold p-1.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 truncate"
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
            <label className="text-[9px] font-extrabold text-slate-400 uppercase block px-1 mb-0.5">
              Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => {
                setSelectedTopicId(e.target.value);
                setSelectedPendingTaskId('');
              }}
              className="w-full text-xs font-semibold p-1.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 truncate"
            >
              <option value="">All Topics</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[9px] font-extrabold text-rose-500 dark:text-rose-400 uppercase block px-1 mb-0.5 flex items-center justify-between">
              <span>Pending Task</span>
              <span className="text-[8px] font-mono font-bold px-1 rounded bg-rose-500/15 text-rose-500">
                {coursePendingTasks.length}
              </span>
            </label>
            <select
              value={selectedPendingTaskId}
              onChange={(e) => {
                const ptId = e.target.value;
                setSelectedPendingTaskId(ptId);
                const targetPt = coursePendingTasks.find((t) => t.id === ptId);
                if (targetPt) {
                  if (targetPt.subjectId) setSelectedSubjectId(targetPt.subjectId);
                  if (targetPt.topicId) setSelectedTopicId(targetPt.topicId);
                }
              }}
              className="w-full text-xs font-semibold p-1.5 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 truncate"
            >
              <option value="">-- Direct Pending Item --</option>
              {coursePendingTasks.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  📌 {pt.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LIVE STATUS BADGE */}
        <div className="my-2">
          {phase === 'study' ? (
            isOvertime ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-500 dark:text-amber-400 font-extrabold text-[11px] shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>🔥 OVERTIME MODE (+{formatSeconds(overtimeSeconds)} EXTRA FOCUS)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/40 text-sky-500 dark:text-sky-400 font-extrabold text-[11px] shadow-[0_0_20px_rgba(14,165,233,0.25)]">
                <span className="relative flex h-2 w-2">
                  {isRunning && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-80" />
                  )}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
                </span>
                <span>• STUDY STATUS: FOCUSING ({studiedMinutes} MIN STUDIED)</span>
              </div>
            )
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-pink-500/15 border border-pink-400/50 text-pink-500 dark:text-pink-400 font-extrabold text-[11px] shadow-[0_0_20px_rgba(236,72,153,0.3)] animate-pulse">
              <Coffee className="w-3.5 h-3.5" />
              <span>☕ BREAK TIME – 15 MINUTES</span>
            </div>
          )}
        </div>

        {/* PROGRESS RING & DIGITAL DISPLAY */}
        <div className="flex flex-col items-center justify-center my-1.5">
          <div className="relative">
            <ProgressRing
              progress={progressPercent}
              size={155}
              strokeWidth={9}
              variant={isOvertime ? 'amber' : phase === 'study' ? 'sky' : 'pink'}
            >
              <div className="flex flex-col items-center justify-center select-none">
                <div className={`digital-timer text-3xl font-black tracking-tight ${
                  isOvertime ? 'text-amber-500 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                }`}>
                  {phase === 'study'
                    ? isOvertime
                      ? `+${formatSeconds(overtimeSeconds)}`
                      : formatSeconds(remainingTargetSeconds)
                    : formatSeconds(breakRemainingSeconds)}
                </div>
                <div className="text-[8px] uppercase font-black tracking-widest mt-0.5 text-slate-400">
                  {phase === 'study'
                    ? isOvertime
                      ? 'Extra Overtime Studied'
                      : 'Target Study Time Left'
                    : 'Break Time Left'}
                </div>
                <div className="text-[9px] font-mono font-bold mt-1 px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-200">
                  {studiedMinutes} Min Total Studied
                </div>
              </div>
            </ProgressRing>
          </div>

          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            {phase === 'study'
              ? isOvertime
                ? 'Overtime active! Click "Complete Pending" anytime to save all elapsed study time.'
                : 'Target: 30 Min. Whenever you hit "Complete Pending", your exact study time gets recorded.'
              : 'When 15:00 reaches zero, the next 30-minute study session starts automatically.'}
          </p>
        </div>

        {/* PAPA'S REMINDER STRIP */}
        <div className="max-w-md mx-auto my-2 p-2 px-3 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 backdrop-blur-md text-left flex items-center gap-2.5 shadow-xs">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-pink-500 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
            👨‍👧
          </div>
          <div>
            <div className="text-[8px] font-black uppercase tracking-wider text-pink-500 dark:text-pink-400">
              Papa's Reminder
            </div>
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
              {phase === 'study'
                ? '“Study at your own pace. Click complete anytime, and your exact studied time will be saved!”'
                : '“Dear, take a 15-minute rest now, then continue studying.”'}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStart}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-xs shadow-lg shadow-sky-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              ▶ START {phase === 'study' ? 'STUDY' : 'BREAK'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="py-2.5 px-5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-yellow-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              ⏸ PAUSE
            </button>
          )}

          {/* COMPLETE PENDING & SAVE TIME BUTTON */}
          <button
            type="button"
            onClick={handleCompleteSubjectAndSave}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            title="Mark selected task completed and save exact study time"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>COMPLETE & SAVE ({studiedMinutes}M)</span>
          </button>

          {/* RESET BUTTON */}
          <button
            type="button"
            onClick={handleReset}
            className="py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.08] hover:bg-rose-500/15 hover:text-rose-500 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET
          </button>

          {/* SKIP PHASE BUTTON */}
          <button
            type="button"
            onClick={handleSkipPhase}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
            title="Skip to break or next phase"
          >
            <FastForward className="w-3.5 h-3.5" />
            Skip Phase
          </button>
        </div>

        {/* METRICS INLINE FOOTER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.08] text-xs">
          <div className="p-1.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[8px] text-slate-400 uppercase font-bold block">
              Current Session
            </span>
            <span className="font-extrabold text-sky-500 dark:text-sky-400 font-mono text-xs">
              {studiedMinutes} Minutes
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[8px] text-slate-400 uppercase font-bold block">
              Break Interval
            </span>
            <span className="font-extrabold text-pink-500 dark:text-pink-400 font-mono text-xs">
              15 Minutes
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[8px] text-slate-400 uppercase font-bold block">
              Current Cycle
            </span>
            <span className="font-extrabold text-amber-500 dark:text-amber-400 font-mono text-xs">
              #{cycleCount}
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[8px] text-slate-400 uppercase font-bold block">
              Completed Tasks
            </span>
            <span className="font-extrabold text-emerald-500 dark:text-emerald-400 font-mono text-xs">
              {completedStudySessions} Done
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
