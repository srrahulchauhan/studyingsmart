import React from 'react';
import { Play } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

export default function FloatingStudyButton({ onStartStudy }) {
  const { activeSession } = useTimer();

  return (
    <button
      type="button"
      onClick={onStartStudy}
      className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-extrabold text-sm shadow-[0_8px_30px_rgba(14,165,233,0.45)] hover:shadow-[0_12px_36px_rgba(14,165,233,0.6)] border border-white/20 backdrop-blur-md btn-premium transition-all duration-300 hover:scale-105 active:scale-95 group"
      title="Start Study Session"
    >
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Play className="w-3.5 h-3.5 fill-current text-white ml-0.5" />
      </div>
      <span className="tracking-wide">
        {activeSession ? 'VIEW LIVE TIMER' : 'START STUDY'}
      </span>
      {activeSession?.status === 'running' && (
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      )}
    </button>
  );
}
