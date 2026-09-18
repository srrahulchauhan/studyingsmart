import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Clock, Plus, ExternalLink, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { formatSeconds } from '../../utils/dateUtils';
import { sounds } from '../../utils/audio';
import ProgressRing from '../common/ProgressRing';

export default function RevisionTimerModal({ isOpen, revisionItem, onClose }) {
  const { completeRevision, addNotification, settings } = useStudy();

  const initialSeconds = (revisionItem?.durationMinutes || 30) * 60;
  const [targetSeconds, setTargetSeconds] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(settings?.soundEnabled ?? true);

  useEffect(() => {
    if (revisionItem) {
      const sec = (revisionItem.durationMinutes || 30) * 60;
      setTargetSeconds(sec);
      setRemainingSeconds(sec);
      setElapsedSeconds(0);
      setIsRunning(false);
    }
  }, [revisionItem, isOpen]);

  // Speech Helper
  const speakText = (text) => {
    if (!soundEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  };

  // Timer interval
  useEffect(() => {
    if (!isRunning || !isOpen) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        setElapsedSeconds((e) => e + 1);
        if (prev > 1) return prev - 1;

        // Timer Finished!
        if (soundEnabled) {
          sounds.playTimerCompletion();
          speakText(`Revision time finished for ${revisionItem?.topicName || revisionItem?.title || 'Revision'}.`);
        }
        addNotification({
          title: 'Revision Time Finished! 📚⏰',
          message: `Target time for revision "${revisionItem?.topicName || 'Revision'}" reached! Click Complete to save.`,
          type: 'success',
        });
        setIsRunning(false);
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isOpen, soundEnabled, revisionItem, addNotification]);

  if (!isOpen || !revisionItem) return null;

  const handleStart = () => {
    sounds.playClick();
    setIsRunning(true);
  };

  const handlePause = () => {
    sounds.playClick();
    setIsRunning(false);
  };

  const handleReset = () => {
    sounds.playClick();
    setIsRunning(false);
    setRemainingSeconds(targetSeconds);
    setElapsedSeconds(0);
  };

  const handleExtendTime = (extraMins) => {
    sounds.playClick();
    const extraSec = extraMins * 60;
    setTargetSeconds((prev) => prev + extraSec);
    setRemainingSeconds((prev) => prev + extraSec);
  };

  const handleComplete = () => {
    sounds.playClick();
    const actualMins = Math.max(1, Math.round(elapsedSeconds / 60) || Math.round(targetSeconds / 60));
    completeRevision(revisionItem.id, actualMins);
    onClose();
  };

  const progressPercent = Math.min(100, Math.round(((targetSeconds - remainingSeconds) / targetSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#070c18] border-2 border-purple-400/40 dark:border-purple-500/30 rounded-3xl shadow-[0_20px_70px_rgba(168,85,247,0.3)] p-6 text-center relative overflow-hidden animate-scaleIn">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-2 text-left">
            <span className="text-xl">📚</span>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-purple-500 dark:text-purple-400">
                Revision Timer
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[220px]">
                {revisionItem.topicName || revisionItem.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-100 dark:bg-white/[0.08]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Source Video Link if available */}
        {(revisionItem.sourceUrl || revisionItem.videoUrl) && (
          <div className="my-2.5">
            <button
              type="button"
              onClick={() => window.open(revisionItem.sourceUrl || revisionItem.videoUrl, '_blank', 'noopener,noreferrer')}
              className="w-full py-1.5 px-3 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-purple-500 hover:text-white transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>🎥 Open Source Video Link</span>
            </button>
          </div>
        )}

        {/* Progress Ring & Countdown Display */}
        <div className="flex flex-col items-center justify-center my-4">
          <ProgressRing progress={progressPercent} size={160} strokeWidth={9} variant="pink">
            <div className="flex flex-col items-center justify-center select-none">
              <div className="digital-timer text-3xl font-black text-slate-900 dark:text-white">
                {formatSeconds(remainingSeconds)}
              </div>
              <div className="text-[9px] uppercase font-black tracking-widest text-slate-400 mt-1">
                Revision Time Left
              </div>
              <div className="text-[9px] font-mono font-bold mt-1 text-purple-400">
                {Math.round(elapsedSeconds / 60)} Mins Elapsed
              </div>
            </div>
          </ProgressRing>
        </div>

        {/* Extend Time Options */}
        <div className="flex items-center justify-center gap-2 mb-4 text-xs font-bold text-slate-400">
          <span>Extend:</span>
          <button
            type="button"
            onClick={() => handleExtendTime(5)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-purple-500/20 hover:text-purple-400 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all"
          >
            +5 Mins
          </button>
          <button
            type="button"
            onClick={() => handleExtendTime(10)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-purple-500/20 hover:text-purple-400 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all"
          >
            +10 Mins
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {!isRunning ? (
            <button
              type="button"
              onClick={handleStart}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Revision
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              Pause
            </button>
          )}

          <button
            type="button"
            onClick={handleComplete}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            Complete ✅
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-400 hover:text-slate-200"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
