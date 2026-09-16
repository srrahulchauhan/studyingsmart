import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatDuration, formatTime, formatDate } from '../../utils/dateUtils';
import { History, Clock, ArrowRight } from 'lucide-react';

export default function RecentActivityTimeline({ onNavigate }) {
  const { studySessions, subjects, topics, activeCourseId } = useStudy();

  const filteredSessions = studySessions
    .filter((s) => !activeCourseId || s.courseId === activeCourseId)
    .slice(0, 5); // Take last 5

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Study Activity
            </h3>
            <p className="text-[11px] text-slate-400">
              Live focus log of completed sessions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('history')}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View Log →
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="pt-4">
        {filteredSessions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-400" />
            <p>No study sessions recorded yet.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
            {filteredSessions.map((s) => {
              const subj = subjects.find((sb) => sb.id === s.subjectId);
              const topic = topics.find((tp) => tp.id === s.topicId);
              const timeDisplay = s.endTime ? formatTime(s.endTime) : formatTime(s.startTime);

              return (
                <div key={s.id} className="relative group">
                  {/* Glowing Node Dot */}
                  <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-[#0f1629] shadow-sm shadow-indigo-600/50 group-hover:scale-125 transition-transform" />

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-400">
                        {timeDisplay} • {formatDate(s.date)}
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                        {subj ? subj.name : 'Focus Session'}
                        {topic && (
                          <span className="text-slate-500 dark:text-slate-400 font-normal">
                            {' '}— {topic.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      {formatDuration(s.actualStudyDuration)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
