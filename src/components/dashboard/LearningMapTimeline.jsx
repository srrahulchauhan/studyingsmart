import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';
import { formatDuration } from '../../utils/dateUtils';
import { Calendar, CheckCircle2, Clock, Play, Sparkles, MapPin } from 'lucide-react';

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

  // Completed sessions
  todaysSessions.forEach((sess) => {
    const subj = subjects.find((s) => s.id === sess.subjectId);
    const topic = topics.find((t) => t.id === sess.topicId);
    const startTime = sess.startTime ? new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged';
    blocks.push({
      id: sess.id,
      title: topic ? topic.name : subj ? subj.name : 'Completed Study Session',
      subtitle: subj ? subj.name : 'Focus Session',
      time: startTime,
      plannedDuration: sess.actualStudyDuration,
      actualDuration: sess.actualStudyDuration,
      status: 'Completed',
      type: 'session',
    });
  });

  // Scheduled slots (avoid duplicate if already completed)
  todaysSlots.forEach((slot) => {
    const subj = subjects.find((s) => s.id === slot.subjectId);
    const topic = topics.find((t) => t.id === slot.topicId);
    blocks.push({
      id: slot.id,
      title: topic ? topic.name : subj ? subj.name : 'Scheduled Block',
      subtitle: subj ? subj.name : 'Planned Session',
      time: slot.startTime,
      plannedDuration: slot.targetDuration,
      actualDuration: 0,
      status: 'Planned',
      type: 'timetable',
      rawSlot: slot,
    });
  });

  // Sort blocks chronologically by time
  blocks.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <MapPin className="w-4 h-4" />
          </div>
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
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Manage Timetable →
        </button>
      </div>

      {/* Timeline Content */}
      <div className="pt-4">
        {blocks.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-400" />
            <p>No learning blocks mapped for today yet.</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('timetable')}
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
              >
                + Schedule Study Time
              </button>
              <button
                type="button"
                onClick={() => onNavigate('timer')}
                className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
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

                return (
                  <div
                    key={b.id || idx}
                    className={`w-60 p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isCompleted
                        ? 'bg-emerald-500/[0.06] border-emerald-500/30 dark:border-emerald-500/20'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06]'
                    }`}
                  >
                    <div>
                      {/* Top status line */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {b.time}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">
                        {b.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {b.subtitle}
                      </div>
                    </div>

                    {/* Footer / Duration and Action */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between text-[11px]">
                      <div>
                        {isCompleted ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {formatDuration(b.actualDuration)} studied
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">
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
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
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
