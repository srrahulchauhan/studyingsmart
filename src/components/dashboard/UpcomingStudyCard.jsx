import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';
import { formatDuration } from '../../utils/dateUtils';
import { CalendarRange, Play, Clock, Sparkles } from 'lucide-react';

export default function UpcomingStudyCard({ onNavigate }) {
  const { timetable, subjects, topics, activeCourseId } = useStudy();
  const { startStudy } = useTimer();

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayNames[new Date().getDay()];

  // Today's upcoming slots
  const filteredSlots = timetable.filter(
    (tt) => (!activeCourseId || tt.courseId === activeCourseId)
  );

  // Split into today and other days
  const todaysSlots = filteredSlots.filter((s) => s.day === todayDayName);
  const nextSlot = todaysSlots.length > 0 ? todaysSlots[0] : filteredSlots[0];
  const subsequentSlots = filteredSlots.filter((s) => s.id !== nextSlot?.id).slice(0, 2);

  const getSubjTopic = (slot) => {
    if (!slot) return { subjName: 'Study Block', topicName: 'Focused Learning' };
    const s = subjects.find((sb) => sb.id === slot.subjectId);
    const t = topics.find((tp) => tp.id === slot.topicId);
    return {
      subjName: s ? s.name : 'Focus Session',
      topicName: t ? t.name : 'Curriculum block',
    };
  };

  const nextInfo = getSubjTopic(nextSlot);

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
            <CalendarRange className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Upcoming Study
            </h3>
            <p className="text-[11px] text-slate-400">
              Scheduled timetable milestones
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('timetable')}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Timetable →
        </button>
      </div>

      {/* Content */}
      <div className="pt-4 space-y-3">
        {nextSlot ? (
          <>
            {/* Primary Next Up Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 dark:border-cyan-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">
                  Next Up
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {nextSlot.day === todayDayName ? 'Today' : nextSlot.day} • {nextSlot.startTime}
                </span>
              </div>

              <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                {nextInfo.topicName}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {nextInfo.subjName} • {formatDuration(nextSlot.targetDuration)}
              </div>

              <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    startStudy({
                      courseId: nextSlot.courseId,
                      studyPlanId: nextSlot.studyPlanId,
                      subjectId: nextSlot.subjectId,
                      topicId: nextSlot.topicId,
                    });
                    onNavigate('timer');
                  }}
                  className="py-1.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-3 h-3 fill-current" />
                  START
                </button>
              </div>
            </div>

            {/* Subsequent slots */}
            {subsequentSlots.map((slot) => {
              const info = getSubjTopic(slot);
              return (
                <div
                  key={slot.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.05] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {info.topicName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {slot.day} • {slot.startTime} ({formatDuration(slot.targetDuration)})
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      startStudy({
                        courseId: slot.courseId,
                        studyPlanId: slot.studyPlanId,
                        subjectId: slot.subjectId,
                        topicId: slot.topicId,
                      });
                      onNavigate('timer');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    title="Start session"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            <CalendarRange className="w-8 h-8 mx-auto mb-2 opacity-30 text-cyan-400" />
            <p>No upcoming study sessions scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
}
