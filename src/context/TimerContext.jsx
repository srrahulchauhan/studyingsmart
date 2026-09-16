import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../utils/storage';
import { useStudy } from './StudyContext';
import { sounds } from '../utils/audio';

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  const { addStudySession, toggleTopicComplete, addNotification, settings } = useStudy();

  // Active session state recovered from LocalStorage if page was refreshed
  const [activeSession, setActiveSession] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.ACTIVE_SESSION, null);
  });

  // Current live elapsed seconds (computed reactively from timestamps)
  const [elapsedActiveSeconds, setElapsedActiveSeconds] = useState(0);
  const [elapsedBreakSeconds, setElapsedBreakSeconds] = useState(0);

  // Break modal state
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [currentBreakReason, setCurrentBreakReason] = useState('Rest');

  // Pomodoro configuration
  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [pomodoroPreset, setPomodoroPreset] = useState('25/5'); // '25/5', '50/10', '45/15', 'custom'
  const [pomodoroRemainingSeconds, setPomodoroRemainingSeconds] = useState(25 * 60);
  const [pomodoroPhase, setPomodoroPhase] = useState('work'); // 'work' | 'break'

  // Focus Mode toggle
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Persist active session state to LocalStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_SESSION, activeSession);
  }, [activeSession]);

  /**
   * Accurate calculation of total active duration (in seconds)
   * from timestamp intervals
   */
  const calculateTotalActiveSeconds = useCallback((session) => {
    if (!session || !session.activeIntervals) return 0;
    const now = Date.now();
    let totalMs = 0;

    session.activeIntervals.forEach((interval) => {
      const start = interval.start;
      const end = interval.end || (session.status === 'running' ? now : start);
      if (end >= start) {
        totalMs += (end - start);
      }
    });

    return Math.max(0, Math.floor(totalMs / 1000));
  }, []);

  /**
   * Accurate calculation of total break duration (in seconds)
   */
  const calculateTotalBreakSeconds = useCallback((session) => {
    if (!session || !session.breakIntervals) return 0;
    const now = Date.now();
    let totalMs = 0;

    session.breakIntervals.forEach((interval) => {
      const start = interval.start;
      const end = interval.end || (session.status === 'break' ? now : start);
      if (end >= start) {
        totalMs += (end - start);
      }
    });

    return Math.max(0, Math.floor(totalMs / 1000));
  }, []);

  // Heartbeat interval to update live seconds based strictly on Date.now()
  useEffect(() => {
    if (!activeSession) {
      setElapsedActiveSeconds(0);
      setElapsedBreakSeconds(0);
      return;
    }

    const updateTimes = () => {
      const activeSecs = calculateTotalActiveSeconds(activeSession);
      const breakSecs = calculateTotalBreakSeconds(activeSession);
      setElapsedActiveSeconds(activeSecs);
      setElapsedBreakSeconds(breakSecs);

      // Handle Pomodoro countdown if active
      if (pomodoroMode && activeSession.status === 'running') {
        const targetSeconds = (pomodoroPreset === '50/10' ? 50 : pomodoroPreset === '45/15' ? 45 : 25) * 60;
        const currentCycleSecs = activeSecs % targetSeconds;
        const remaining = Math.max(0, targetSeconds - currentCycleSecs);
        setPomodoroRemainingSeconds(remaining);

        if (remaining === 0) {
          sounds.playTimerCompletion();
          addNotification({
            title: 'Pomodoro Completed! 🍅',
            message: 'Great focus session! Time to take a 5-minute break.',
            type: 'success',
          });
        }
      }
    };

    updateTimes();
    const timerId = setInterval(updateTimes, 500); // 500ms smooth ticker
    return () => clearInterval(timerId);
  }, [activeSession, calculateTotalActiveSeconds, calculateTotalBreakSeconds, pomodoroMode, pomodoroPreset, addNotification]);

  /**
   * START STUDY SESSION
   */
  const startStudy = useCallback(({ courseId, studyPlanId = null, subjectId = null, topicId = null }) => {
    if (!courseId) return;

    sounds.playClick();
    const now = Date.now();
    const newSession = {
      courseId,
      studyPlanId,
      subjectId,
      topicId,
      status: 'running', // 'running' | 'paused' | 'break'
      startTime: new Date(now).toISOString(),
      activeIntervals: [{ start: now, end: null }],
      breakIntervals: [],
      lastActiveTimestamp: now,
    };

    setActiveSession(newSession);
  }, []);

  /**
   * PAUSE STUDY
   */
  const pauseStudy = useCallback(() => {
    if (!activeSession || activeSession.status !== 'running') return;
    sounds.playClick();
    const now = Date.now();

    const updatedActiveIntervals = activeSession.activeIntervals.map((interval) => {
      if (interval.end === null) {
        return { ...interval, end: now };
      }
      return interval;
    });

    setActiveSession({
      ...activeSession,
      status: 'paused',
      activeIntervals: updatedActiveIntervals,
    });
  }, [activeSession]);

  /**
   * RESUME STUDY
   */
  const resumeStudy = useCallback(() => {
    if (!activeSession || activeSession.status === 'running') return;
    sounds.playClick();
    const now = Date.now();

    // If currently on break, close the break interval first
    let updatedBreakIntervals = activeSession.breakIntervals;
    if (activeSession.status === 'break') {
      updatedBreakIntervals = activeSession.breakIntervals.map((interval) => {
        if (interval.end === null) {
          return {
            ...interval,
            end: now,
            durationSeconds: Math.floor((now - interval.start) / 1000),
          };
        }
        return interval;
      });
      setIsBreakModalOpen(false);
    }

    // Start a new active interval
    const updatedActiveIntervals = [
      ...activeSession.activeIntervals,
      { start: now, end: null },
    ];

    setActiveSession({
      ...activeSession,
      status: 'running',
      activeIntervals: updatedActiveIntervals,
      breakIntervals: updatedBreakIntervals,
      lastActiveTimestamp: now,
    });
  }, [activeSession]);

  /**
   * TAKE BREAK
   */
  const takeBreak = useCallback((reason = 'Rest') => {
    if (!activeSession) return;
    sounds.playBreakAlert();
    const now = Date.now();

    // Close any running active interval
    const updatedActiveIntervals = activeSession.activeIntervals.map((interval) => {
      if (interval.end === null) {
        return { ...interval, end: now };
      }
      return interval;
    });

    // Start a new break interval
    const updatedBreakIntervals = [
      ...activeSession.breakIntervals,
      { start: now, end: null, reason: reason || currentBreakReason },
    ];

    setActiveSession({
      ...activeSession,
      status: 'break',
      activeIntervals: updatedActiveIntervals,
      breakIntervals: updatedBreakIntervals,
    });
    setIsBreakModalOpen(true);
  }, [activeSession, currentBreakReason]);

  /**
   * END BREAK (Resumes study)
   */
  const endBreak = useCallback(() => {
    resumeStudy();
    setIsBreakModalOpen(false);
  }, [resumeStudy]);

  /**
   * STOP & SAVE STUDY SESSION
   */
  const stopStudy = useCallback((markTopicCompleted = false) => {
    if (!activeSession) return null;
    sounds.playTimerCompletion();

    const now = Date.now();

    // Finalize intervals
    const finalizedActive = activeSession.activeIntervals.map((inv) =>
      inv.end === null ? { ...inv, end: now } : inv
    );
    const finalizedBreaks = activeSession.breakIntervals.map((inv) => {
      if (inv.end === null) {
        return { ...inv, end: now, durationSeconds: Math.floor((now - inv.start) / 1000) };
      }
      return inv;
    });

    // Calculate exact minutes
    let totalActiveMs = 0;
    finalizedActive.forEach((inv) => {
      if (inv.end >= inv.start) totalActiveMs += (inv.end - inv.start);
    });

    let totalBreakMs = 0;
    finalizedBreaks.forEach((inv) => {
      if (inv.end >= inv.start) totalBreakMs += (inv.end - inv.start);
    });

    const sessionStartMs = new Date(activeSession.startTime).getTime();
    const totalSessionMinutes = Math.max(0, Math.round((now - sessionStartMs) / 60000));
    const breakMinutes = Math.round(totalBreakMs / 60000);
    // Strict formula: Actual Study = Total active study periods
    const actualStudyMinutes = Math.max(0, Math.round(totalActiveMs / 60000));

    // Save session to global StudyContext
    const saved = addStudySession({
      courseId: activeSession.courseId,
      studyPlanId: activeSession.studyPlanId,
      subjectId: activeSession.subjectId,
      topicId: activeSession.topicId,
      startTime: activeSession.startTime,
      endTime: new Date(now).toISOString(),
      sessionDuration: Math.max(actualStudyMinutes + breakMinutes, totalSessionMinutes),
      breakDuration: breakMinutes,
      actualStudyDuration: actualStudyMinutes,
      status: 'Completed',
      breaks: finalizedBreaks.map(b => ({
        start: new Date(b.start).toISOString(),
        end: new Date(b.end).toISOString(),
        durationMinutes: Math.round(((b.end - b.start) / 60000) * 10) / 10,
        reason: b.reason || 'Rest',
      })),
    });

    if (markTopicCompleted && activeSession.topicId) {
      toggleTopicComplete(activeSession.topicId);
    }

    addNotification({
      title: 'Study Session Saved 🎉',
      message: `Completed ${actualStudyMinutes} minutes of actual study time.`,
      type: 'success',
    });

    // Clear active session
    setActiveSession(null);
    setIsBreakModalOpen(false);
    setIsFocusMode(false);
    return saved;
  }, [activeSession, addStudySession, toggleTopicComplete, addNotification]);

  /**
   * COMPLETE TOPIC FROM TIMER
   */
  const completeTopicFromTimer = useCallback(() => {
    stopStudy(true);
  }, [stopStudy]);

  /**
   * CANCEL / DISCARD ACTIVE SESSION
   */
  const cancelStudy = useCallback(() => {
    setActiveSession(null);
    setIsBreakModalOpen(false);
    setIsFocusMode(false);
  }, []);

  const value = {
    activeSession,
    elapsedActiveSeconds,
    elapsedBreakSeconds,
    isBreakModalOpen,
    setIsBreakModalOpen,
    currentBreakReason,
    setCurrentBreakReason,
    pomodoroMode,
    setPomodoroMode,
    pomodoroPreset,
    setPomodoroPreset,
    pomodoroRemainingSeconds,
    pomodoroPhase,
    isFocusMode,
    setIsFocusMode,

    // Timer actions
    startStudy,
    pauseStudy,
    resumeStudy,
    takeBreak,
    endBreak,
    stopStudy,
    completeTopicFromTimer,
    cancelStudy,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
