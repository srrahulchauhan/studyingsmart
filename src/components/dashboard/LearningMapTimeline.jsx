import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';
import { formatDuration } from '../../utils/dateUtils';
import GlassIcon from '../common/GlassIcon';
import { Calendar, CheckCircle2, Clock, Play, MapPin } from 'lucide-react';

export default function LearningMapTimeline({ onNavigate }) {
  const {
    timetable,
    studySessions,
    subjects,
    topics,
    activeCourseId,
  } = useStudy();

  const { startStudy } = useTimer();

  const todayStr = new Date().toISOString().split('T')[0];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayNames[new Date().getDay()];

  // Today's scheduled slots
  const todaysSlots = timetable.filter(
    (tt) => tt.day === todayDayName && (!activeCourseId || tt.courseId === activeCourseId)
  );

  // Today's completed sessions
  const todaysSessions = studySessions.filter(
    (s) => s.date === todayStr && (!activeCourseId || s.courseId === activeCourseId)
  );

  // Combine items for the map
  const blocks = [];

  // Completed sessions (Requirement 10: Sky Blue)
  todaysSessions.forEach((sess) => {
    const subj = subjects.find((s) => s.id === sess.subjectId);
    const topic = topics.find((t) => t.id === sess.topicId);
    const startTime = sess.startTime ? new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged';
    blocks.push({
      id: sess.id,
      title: topic ? topic.name : subj ? subj.name : 'Completed Focus Session',
      subtitle: subj ? subj.name : 'Focus Session',
      time: startTime,
      plannedDuration: sess.actualStudyDuration,
      actualDuration: sess.actualStudyDuration,
      status: 'Completed',
      type: 'session',
    });
  });

  // Scheduled slots (Requirement 10: Upcoming -> Yellow)
  todaysSlots.forEach((slot) => {
    const subj = subjects.find((s) => s.id === slot.subjectId);
    const topic = topics.find((t) => t.id === slot.topicId);
    blocks.push({
      id: slot.id,
      title: topic ? topic.name : subj ? subj.name : 'Planned Study Block',
      subtitle: subj ? subj.name : 'Scheduled Block',
      time: slot.startTime,
      plannedDuration: slot.targetDuration,
      actualDuration: 0,
      status: 'Upcoming',
      type: 'timetable',
      rawSlot: slot,
    });
  });

  // Sort blocks chronologically by time
  blocks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.09] p-5 sm:p-6 shadow-sm backdrop-blur-2xl command-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <GlassIcon icon={MapPin} variant="sky" size="sm" />
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Today's Learning Map
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive timeline of your daily study journey ({todayDayName})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('timetable')}
          className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline transition-colors"
        >
          Manage Timetable →
        </button>
      </div>

      {/* Timeline Content */}
      <div className="pt-4">
        {blocks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30 text-sky-400" />
            <p>No learning blocks mapped for today yet.</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('timetable')}
                className="py-1.5 px-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all"
              >
                + Schedule Study Time
              </button>
              <button
                type="button"
                onClick={() => onNavigate('timer')}
                className="py-1.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs border border-white/10 transition-colors"
              >
                Start Free Focus Session
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex items-stretch gap-3 min-w-max">
              {blocks.map((b, idx) => {
                const isCompleted = b.status === 'Completed';
                const isBreak = b.status === 'Break';
                const isMissed = b.status === 'Missed';

                // Status colors from Requirement 10:
                // Completed -> Sky Blue, Upcoming -> Yellow, Break -> Pink, Missed -> Red
                const cardStyle = isCompleted
                  ? 'bg-sky-500/[0.08] border-sky-400/30 hover:border-sky-400/50'
                  : isBreak
                  ? 'bg-pink-500/[0.08] border-pink-400/30 hover:border-pink-400/50'
                  : isMissed
                  ? 'bg-red-500/[0.08] border-red-400/30 hover:border-red-400/50'
                  : 'bg-yellow-500/[0.06] border-yellow-400/25 hover:border-yellow-400/40';

                const badgeStyle = isCompleted
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30'
                  : isBreak
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-400/30'
                  : isMissed
                  ? 'bg-red-500/20 text-red-400 border border-red-400/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30';

                const dotEmoji = isCompleted ? '🔵' : isBreak ? '🟡' : isMissed ? '🔴' : '🟡';

                return (
                  <div
                    key={b.id || idx}
                    className={`w-64 p-4 rounded-2xl border backdrop-blur-xl transition-all flex flex-col justify-between command-card ${cardStyle}`}
                  >
                    <div>
                      {/* Top status line */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {b.time}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeStyle}`}
                        >
                          {b.status}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 flex items-center gap-1.5">
                        <span>{dotEmoji}</span>
                        <span>{b.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate pl-4">
                        {b.subtitle}
                      </div>
                    </div>

                    {/* Footer / Duration and Action */}
                    <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                      <div>
                        {isCompleted ? (
                          <span className="text-sky-400 font-bold flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {formatDuration(b.actualDuration)} studied
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium font-mono">
                            Target: {formatDuration(b.plannedDuration)}
                          </span>
                        )}
                      </div>

                      {!isCompleted && b.rawSlot && (
                        <button
                          type="button"
                          onClick={() => {
                            startStudy({
                              courseId: b.rawSlot.courseId,
                              studyPlanId: b.rawSlot.studyPlanId,
                              subjectId: b.rawSlot.subjectId,
                              topicId: b.rawSlot.topicId,
                            });
                            onNavigate('timer');
                          }}
                          className="p-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/30 transition-all active:scale-95"
                          title="Start this session now"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
