import React from 'react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { formatSeconds, formatDuration } from '../utils/dateUtils';
import {
  Minimize2,
  Play,
  Pause,
  Coffee,
  Square,
  Sparkles,
} from 'lucide-react';
import BreakModal from '../components/timer/BreakModal';

export default function FocusModeView({ onExitFocus }) {
  const { courses, subjects, topics } = useStudy();
  const {
    activeSession,
    elapsedActiveSeconds,
    pauseStudy,
    resumeStudy,
    takeBreak,
    stopStudy,
  } = useTimer();

  const currentCourse = courses.find(c => c.id === activeSession?.courseId);
  const currentSubject = subjects.find(s => s.id === activeSession?.subjectId);
  const currentTopic = topics.find(t => t.id === activeSession?.topicId);

  const isRunning = activeSession?.status === 'running';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 animate-fadeIn">
      <BreakModal />

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Focus Mode
          </span>
        </div>

        <button
          type="button"
          onClick={onExitFocus}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          Exit Focus Mode
        </button>
      </div>

      {/* Center Digital Clock & Target Info */}
      <div className="text-center max-w-2xl mx-auto my-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-900/50 text-indigo-300 border border-indigo-800/60">
            {currentCourse ? currentCourse.name : 'Study Session'}
          </span>
          {currentSubject && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-900/50 text-violet-300 border border-violet-800/60">
              {currentSubject.name}
            </span>
          )}
          {currentTopic && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-900/50 text-sky-300 border border-sky-800/60">
              {currentTopic.name}
            </span>
          )}
        </div>

        {/* Huge Digital Clock */}
        <div className="text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tight text-white select-none">
          {formatSeconds(elapsedActiveSeconds)}
        </div>

        <p className="text-xs text-slate-500 mt-4 uppercase tracking-widest">
          Active Focused Study Time
        </p>
      </div>

      {/* Bottom Minimal Controls */}
      <div className="flex items-center justify-center gap-3">
        {activeSession ? (
          <>
            {isRunning ? (
              <button
                type="button"
                onClick={pauseStudy}
                className="py-3.5 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
              >
                <Pause className="w-4 h-4 fill-current" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeStudy}
                className="py-3.5 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                Resume
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                stopStudy(false);
                onExitFocus();
              }}
              className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop & Save
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onExitFocus}
            className="py-3.5 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm"
          >
            Start a Session in Normal View
          </button>
        )}
      </div>
    </div>
  );
}
