import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatSeconds } from '../../utils/dateUtils';
import { sounds } from '../../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Volume2,
  VolumeX,
  FastForward,
  CheckCircle2,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Sparkles,
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

  const sessionStartTimeRef = useRef(new Date().toISOString());

  const [selectedCourseId, setSelectedCourseId] = useState(
    activeCourseId || (courses.length > 0 ? courses[0].id : '')
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedPendingTaskId, setSelectedPendingTaskId] = useState('');

  const availableSubjects = subjects.filter(
    (s) => !selectedCourseId || s.courseId === selectedCourseId
  );
  const availableTopics = topics.filter((t) => {
    if (selectedSubjectId) return t.subjectId === selectedSubjectId;
    if (selectedCourseId) return t.courseId === selectedCourseId;
    return true;
  });
  const coursePendingTasks = pendingTasks.filter(
    (pt) => pt.status === 'Pending' && (!selectedCourseId || pt.courseId === selectedCourseId)
  );

  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentTopic = topics.find((t) => t.id === selectedTopicId);
  const currentPendingTask = pendingTasks.find((pt) => pt.id === selectedPendingTaskId);

  // Core Timer State
  const [phase, setPhase] = useState('study'); // 'study' or 'break'
  const [elapsedStudySeconds, setElapsedStudySeconds] = useState(0); 
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);
  const [completedStudySessions, setCompletedStudySessions] = useState(0);

  // New Feature States
  const [ambientMode, setAmbientMode] = useState(false);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(15);
  const [manualTimeAdjustment, setManualTimeAdjustment] = useState(0); 
  const [earnedXP, setEarnedXP] = useState(null); 

  const calculateTargetMinutes = () => {
    if (currentPendingTask) {
      if (currentPendingTask.topicId) {
        const linkedTopic = topics.find(t => t.id === currentPendingTask.topicId);
        if (linkedTopic && linkedTopic.estimatedMinutes) return linkedTopic.estimatedMinutes;
      }
      if (currentPendingTask.subjectId) {
        const subjectTopics = topics.filter(t => t.subjectId === currentPendingTask.subjectId);
        const subjectTotal = subjectTopics.reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 0), 0);
        if (subjectTotal > 0) return subjectTotal;
      }
      return currentPendingTask.estimatedMinutes || 30;
    }
    
    if (currentTopic) {
      return currentTopic.estimatedMinutes || 30;
    }
    
    if (currentSubject) {
      const subjectTopics = topics.filter(t => t.subjectId === currentSubject.id);
      const subjectTotal = subjectTopics.reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 0), 0);
      if (subjectTotal > 0) return subjectTotal;
    }
    
    if (currentCourse) {
      const courseTopics = topics.filter(t => t.courseId === currentCourse.id);
      const courseTotal = courseTopics.reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 0), 0);
      if (courseTotal > 0) return courseTotal;
    }
    
    return 30;
  };

  const baseTargetMinutes = calculateTargetMinutes();
  const targetStudyMinutes = Math.max(1, baseTargetMinutes + manualTimeAdjustment);
  
  const STUDY_TARGET_SECONDS = Number(targetStudyMinutes) * 60;
  const BREAK_SECONDS = breakDurationMinutes * 60;

  // Time Over & Overtime Flags
  const [targetTimeAlertPlayed, setTargetTimeAlertPlayed] = useState(false);
  const [showTimeOverBanner, setShowTimeOverBanner] = useState(false);
  const [showConfirmCompleteModal, setShowConfirmCompleteModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [breakRemainingSeconds, setBreakRemainingSeconds] = useState(BREAK_SECONDS);
  const [showPapaBreakModal, setShowPapaBreakModal] = useState(false);
  const [showBreakEndBanner, setShowBreakEndBanner] = useState(false);

  // Sync break remaining if duration is changed while not running break
  useEffect(() => {
    if (phase === 'study') {
      setBreakRemainingSeconds(BREAK_SECONDS);
    }
  }, [BREAK_SECONDS, phase]);

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

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (phase === 'study') {
        setElapsedStudySeconds((prevSec) => {
          const nextSec = prevSec + 1;

          if (nextSec === STUDY_TARGET_SECONDS && !targetTimeAlertPlayed) {
            setTargetTimeAlertPlayed(true);
            setShowTimeOverBanner(true);

            if (soundEnabled) {
              sounds.playBreakAlert();
              speakText(`Time Over! Target ${targetStudyMinutes} minutes study completed. You can complete your task now or continue extra study.`);
            }

            addNotification({
              title: `⏰ Time Over! (Target ${targetStudyMinutes}m Reached)`,
              message: 'Target study time reached! Click "Complete Subject" to save your progress, or continue extra study.',
              type: 'info',
            });
          }
          return nextSec;
        });
      } else {
        setBreakRemainingSeconds((prev) => {
          if (prev > 1) return prev - 1;

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
    isRunning, phase, targetTimeAlertPlayed, soundEnabled, addNotification, 
    STUDY_TARGET_SECONDS, targetStudyMinutes, BREAK_SECONDS
  ]);

  const adjustTime = (mins) => {
    sounds.playClick();
    setManualTimeAdjustment(prev => prev + mins);
  };

  const handleCompleteSubjectAndSave = () => {
    sounds.playClick();

    const actualMinutes = Math.max(
      elapsedStudySeconds > 0 ? 1 : 0,
      Math.round(elapsedStudySeconds / 60)
    );

    const targetName =
      currentPendingTask?.title ||
      currentTopic?.name ||
      currentSubject?.name ||
      currentCourse?.name ||
      'Subject';

    const isOver = elapsedStudySeconds > STUDY_TARGET_SECONDS;

    if (selectedCourseId && actualMinutes > 0) {
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

    const xpGained = actualMinutes * 10 + (isOver ? 50 : 0);
    setEarnedXP(xpGained);
    setTimeout(() => setEarnedXP(null), 4000);

    if (soundEnabled) {
      sounds.playTimerCompletion();
      speakText(`Great job! ${targetName} completed and ${actualMinutes} minutes recorded. You earned ${xpGained} XP!`);
    }

    addNotification({
      title: 'Subject Completed! ✅',
      message: `${actualMinutes} minutes saved to "${targetName}". +${xpGained} XP!`,
      type: 'success',
    });

    setElapsedStudySeconds(0);
    setManualTimeAdjustment(0);
    setTargetTimeAlertPlayed(false);
    setShowTimeOverBanner(false);
    sessionStartTimeRef.current = new Date().toISOString();
  };

  const handleStart = () => {
    sounds.playClick();
    if (elapsedStudySeconds === 0) {
      sessionStartTimeRef.current = new Date().toISOString();
    }
    setIsRunning(true);
    setShowBreakEndBanner(false);
  };

  const handlePause = () => {
    sounds.playClick();
    setIsRunning(false);
  };

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

  const handleStartBreak = () => {
    sounds.playClick();
    setPhase('break');
    setBreakRemainingSeconds(BREAK_SECONDS);
    setShowPapaBreakModal(true);
    setShowTimeOverBanner(false);
  };

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

  const isOvertime = phase === 'study' && elapsedStudySeconds > STUDY_TARGET_SECONDS;
  const remainingTargetSeconds = Math.max(0, STUDY_TARGET_SECONDS - elapsedStudySeconds);
  const overtimeSeconds = Math.max(0, elapsedStudySeconds - STUDY_TARGET_SECONDS);
  const studiedMinutes = Math.round(elapsedStudySeconds / 60);

  const progressPercent =
    phase === 'study'
      ? Math.min(100, Math.round((elapsedStudySeconds / STUDY_TARGET_SECONDS) * 100))
      : Math.min(100, Math.round(((BREAK_SECONDS - breakRemainingSeconds) / BREAK_SECONDS) * 100));

  const bgGlowColor = isOvertime 
    ? 'bg-amber-500/[0.15]' 
    : phase === 'study' 
      ? 'bg-sky-500/[0.12]' 
      : 'bg-pink-500/[0.15]';

  return (
    <div className={`space-y-4 animate-fadeIn mx-auto transition-all duration-700 ${ambientMode ? 'max-w-4xl pt-10' : 'max-w-3xl'}`}>
      
      {/* XP EARNED ANIMATION */}
      {earnedXP !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="animate-bounce-subtle flex flex-col items-center drop-shadow-2xl">
            <div className="text-6xl mb-2">⭐</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-500 tracking-tighter filter drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">
              +{earnedXP} XP
            </div>
            <div className="text-white text-xl font-bold mt-2 tracking-widest uppercase">
              Mission Accomplished!
            </div>
          </div>
        </div>
      )}

      {/* TIME OVER BANNER */}
      {showTimeOverBanner && phase === 'study' && !ambientMode && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col sm:flex-row items-center justify-between gap-3 animate-bounce-subtle backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-amber-500/30">
              ⏰
            </div>
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Time Over! (Target {targetStudyMinutes} Minutes Reached)
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                You can complete your subject now, or continue studying extra time!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowConfirmCompleteModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" /> Complete & Save
            </button>
            <button
              onClick={() => setShowTimeOverBanner(false)}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              Overtime
            </button>
          </div>
        </div>
      )}

      {/* BREAK END REMINDER BANNER */}
      {showBreakEndBanner && !ambientMode && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-sky-500/15 to-emerald-500/15 border border-emerald-400/50 shadow-md flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-emerald-500/30">
              🔔
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Break Complete!
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                “Break is finished — Time to continue studying now.”
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowBreakEndBanner(false)}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-transform active:scale-95 shrink-0 shadow-lg shadow-emerald-500/20"
          >
            Got it!
          </button>
        </div>
      )}

      {/* MAIN PREMIUM GLASS TIMER PANEL */}
      <div
        className={`relative overflow-hidden rounded-[2rem] text-center backdrop-blur-3xl transition-all duration-700 border shadow-2xl ${
          ambientMode ? 'p-10 min-h-[60vh] flex flex-col justify-center' : 'p-4 sm:p-5'
        } ${
          isOvertime
            ? 'bg-amber-500/[0.04] dark:bg-[#120d05]/95 border-amber-500/40 shadow-amber-500/20'
            : phase === 'study'
            ? 'bg-white/95 dark:bg-[#070c18]/95 border-sky-400/30 dark:border-sky-400/20 shadow-sky-500/10'
            : 'bg-white/95 dark:bg-[#070c18]/95 border-pink-400/40 dark:border-pink-500/30 shadow-pink-500/15'
        }`}
      >
        {/* Dynamic Glow Background Orbs */}
        <div className={`absolute top-0 right-1/4 w-64 h-64 rounded-full blur-[80px] pointer-events-none -z-10 transition-colors duration-1000 ${bgGlowColor}`} />
        <div className={`absolute bottom-0 left-1/4 w-48 h-48 rounded-full blur-[60px] pointer-events-none -z-10 transition-colors duration-1000 delay-300 ${bgGlowColor}`} />

        {/* TOP BAR */}
        {!ambientMode && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/30 text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Focus Center
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-500 dark:text-pink-400 border border-pink-400/30 text-[9px] font-extrabold shadow-sm">
                    Premium Mode
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setAmbientMode(true)}
                className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                title="Enter Distraction-Free Focus Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Focus Mode
              </button>

              <button
                onClick={() => setSoundEnabled((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${
                  soundEnabled
                    ? 'bg-gradient-to-r from-sky-500 to-sky-400 text-white border-sky-400 shadow-sky-500/25'
                    : 'bg-slate-100 dark:bg-white/[0.05] border-slate-200 dark:border-white/10 text-slate-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Ambient Mode Exit Button */}
        {ambientMode && (
          <div className="absolute top-6 right-6">
            <button
              onClick={() => setAmbientMode(false)}
              className="p-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 text-slate-400 hover:text-white transition-all backdrop-blur-md shadow-lg z-10"
              title="Exit Focus Mode"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* SELECTION GRID */}
        {!ambientMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 my-4">
            <div className="text-left bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-2xl border border-slate-200 dark:border-white/[0.06] shadow-sm">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase block px-1 mb-1">Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedSubjectId('');
                  setSelectedTopicId('');
                  setSelectedPendingTaskId('');
                }}
                className="w-full text-xs font-bold p-2 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {courses.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>

            <div className="text-left bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-2xl border border-slate-200 dark:border-white/[0.06] shadow-sm">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase block px-1 mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedTopicId('');
                  setSelectedPendingTaskId('');
                }}
                className="w-full text-xs font-bold p-2 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="">All Subjects</option>
                {availableSubjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>

            <div className="text-left bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-2xl border border-slate-200 dark:border-white/[0.06] shadow-sm">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase block px-1 mb-1">Topic</label>
              <select
                value={selectedTopicId}
                onChange={(e) => {
                  setSelectedTopicId(e.target.value);
                  setSelectedPendingTaskId('');
                }}
                className="w-full text-xs font-bold p-2 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="">All Topics</option>
                {availableTopics.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </select>
            </div>

            <div className="text-left bg-rose-50 dark:bg-rose-900/10 p-2.5 rounded-2xl border border-rose-200 dark:border-rose-500/20 shadow-sm">
              <label className="text-[9px] font-extrabold text-rose-500 uppercase block px-1 mb-1">Pending Task</label>
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
                className="w-full text-xs font-bold p-2 rounded-xl bg-white dark:bg-[#0c1322] border border-rose-200 dark:border-rose-500/20 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="">-- Direct Pending Item --</option>
                {coursePendingTasks.map((pt) => (<option key={pt.id} value={pt.id}>📌 {pt.title}</option>))}
              </select>
            </div>
          </div>
        )}

        {/* TIME ADJUSTERS & BREAK SETTINGS */}
        {!ambientMode && (
          <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
            <div className="flex items-center bg-slate-100 dark:bg-white/[0.05] p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
              <button onClick={() => adjustTime(-5)} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-slate-500 hover:text-sky-500"><Minus className="w-4 h-4"/></button>
              <div className="px-3 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Target: {targetStudyMinutes}m
              </div>
              <button onClick={() => adjustTime(5)} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all text-slate-500 hover:text-sky-500"><Plus className="w-4 h-4"/></button>
            </div>
            
            <div className="flex items-center bg-slate-100 dark:bg-white/[0.05] p-1 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="px-3 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Break:
              </div>
              <div className="flex gap-1">
                {[5, 10, 15].map(mins => (
                  <button 
                    key={mins}
                    onClick={() => { sounds.playClick(); setBreakDurationMinutes(mins); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      breakDurationMinutes === mins 
                        ? 'bg-white dark:bg-[#1a2333] shadow-sm text-pink-500 dark:text-pink-400 border border-slate-200 dark:border-white/10'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS RING & DIGITAL DISPLAY */}
        <div className="flex flex-col items-center justify-center relative">
          <ProgressRing
            progress={progressPercent}
            size={ambientMode ? 320 : 220}
            strokeWidth={ambientMode ? 14 : 10}
            variant={isOvertime ? 'amber' : phase === 'study' ? 'sky' : 'pink'}
          >
            <div className="flex flex-col items-center justify-center select-none z-10">
              <div className={`digital-timer font-black tracking-tighter filter drop-shadow-md transition-all ${ambientMode ? 'text-7xl' : 'text-5xl'} ${
                isOvertime ? 'text-amber-500 dark:text-amber-400' : phase === 'study' ? 'text-slate-900 dark:text-white' : 'text-pink-500 dark:text-pink-400'
              }`}>
                {phase === 'study'
                  ? isOvertime
                    ? `+${formatSeconds(overtimeSeconds)}`
                    : formatSeconds(remainingTargetSeconds)
                  : formatSeconds(breakRemainingSeconds)}
              </div>
              <div className={`uppercase font-black tracking-widest mt-1 transition-all ${ambientMode ? 'text-xs' : 'text-[9px]'} ${isOvertime ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
                {phase === 'study'
                  ? isOvertime
                    ? 'Overtime Active'
                    : 'Time Remaining'
                  : 'Break Time Remaining'}
              </div>
              {phase === 'study' && (
                <div className={`font-mono font-bold mt-2 px-3 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-200 transition-all ${ambientMode ? 'text-xs' : 'text-[10px]'}`}>
                  {studiedMinutes}m Logged
                </div>
              )}
            </div>
          </ProgressRing>
        </div>

        {/* ACTION BUTTONS */}
        <div className={`flex flex-wrap items-center justify-center gap-3 transition-all ${ambientMode ? 'mt-16' : 'mt-8'}`}>
          {!isRunning ? (
            <button
              onClick={handleStart}
              className={`rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black shadow-[0_10px_30px_rgba(14,165,233,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${ambientMode ? 'py-4 px-8 text-sm' : 'py-3 px-6 text-xs'}`}
            >
              <Play className={ambientMode ? "w-5 h-5 fill-current" : "w-4 h-4 fill-current"} />
              START FOCUS
            </button>
          ) : (
            <button
              onClick={handlePause}
              className={`rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${ambientMode ? 'py-4 px-8 text-sm' : 'py-3 px-6 text-xs'}`}
            >
              <Pause className={ambientMode ? "w-5 h-5 fill-current" : "w-4 h-4 fill-current"} />
              PAUSE
            </button>
          )}

          <button
            onClick={() => setShowConfirmCompleteModal(true)}
            className={`rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-black shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${ambientMode ? 'py-4 px-8 text-sm' : 'py-3 px-6 text-xs'}`}
          >
            <CheckCircle2 className={ambientMode ? "w-5 h-5" : "w-4 h-4"} />
            COMPLETE TASK
          </button>

          <button
            onClick={handleSkipPhase}
            className={`rounded-2xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${ambientMode ? 'py-4 px-6 text-sm' : 'py-3 px-4 text-xs'}`}
            title={`Skip to ${phase === 'study' ? 'Break' : 'Study'}`}
          >
            <FastForward className={ambientMode ? "w-5 h-5" : "w-4 h-4"} />
            SKIP TO {phase === 'study' ? 'BREAK' : 'STUDY'}
          </button>

          <button
            onClick={handleReset}
            className={`rounded-2xl bg-slate-100 dark:bg-white/[0.05] hover:bg-rose-500/15 hover:text-rose-500 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${ambientMode ? 'py-4 px-6 text-sm' : 'py-3 px-4 text-xs'}`}
          >
            <RotateCcw className={ambientMode ? "w-5 h-5" : "w-4 h-4"} />
            RESET
          </button>
        </div>

        {/* METRICS INLINE FOOTER */}
        {!ambientMode && (
          <div className="grid grid-cols-3 gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-white/[0.08] text-xs">
            <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] shadow-sm">
              <span className="text-[9px] text-slate-400 uppercase font-black block mb-1">Current Session</span>
              <span className="font-extrabold text-sky-500 dark:text-sky-400 font-mono text-base">{studiedMinutes}m</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] shadow-sm">
              <span className="text-[9px] text-slate-400 uppercase font-black block mb-1">Study Cycle</span>
              <span className="font-extrabold text-amber-500 dark:text-amber-400 font-mono text-base">#{cycleCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] shadow-sm">
              <span className="text-[9px] text-slate-400 uppercase font-black block mb-1">Total Completed</span>
              <span className="font-extrabold text-emerald-500 dark:text-emerald-400 font-mono text-base">{completedStudySessions} Tasks</span>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL & PAPA BREAK MODAL */}
      {showConfirmCompleteModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-md rounded-[2rem] bg-white dark:bg-[#0a0f1d] border border-emerald-500/30 p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center animate-scaleIn space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shadow-inner border border-emerald-400/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Complete & Log Time?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Ready to secure your progress?</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setShowConfirmCompleteModal(false)} className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={() => { setShowConfirmCompleteModal(false); handleCompleteSubjectAndSave(); }} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-black text-sm shadow-lg shadow-emerald-500/30 transition-transform active:scale-95">Yes, Log It!</button>
            </div>
          </div>
        </div>
      )}

      {showPapaBreakModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-md rounded-[2rem] bg-white dark:bg-[#0a0f1d] border border-pink-500/30 p-8 shadow-[0_0_50px_rgba(236,72,153,0.2)] text-center animate-scaleIn space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-500/15 text-pink-500 flex items-center justify-center shadow-inner border border-pink-400/30">
              <Coffee className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Break Time!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Take {breakDurationMinutes} minutes to stretch and hydrate.</p>
            </div>
            <button onClick={() => setShowPapaBreakModal(false)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-400 hover:to-pink-300 text-white font-black text-sm shadow-lg shadow-pink-500/30 transition-transform active:scale-95">Got it, resting 👍</button>
          </div>
        </div>
      )}
    </div>
  );
}
