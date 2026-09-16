import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatDuration } from '../../utils/dateUtils';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

export default function TomorrowPlanPreview({ onNavigate }) {
  const { timetable, subjects, topics, activeCourseId } = useStudy();

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const tomorrowDayName = dayNames[(new Date().getDay() + 1) % 7];

  const tomorrowSlots = timetable.filter(
    (tt) => tt.day === tomorrowDayName && (!activeCourseId || tt.courseId === activeCourseId)
  );

  // Sort by startTime
  tomorrowSlots.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const totalPlannedMinutes = tomorrowSlots.reduce(
    (sum, s) => sum + (s.targetDuration || 0),
    0
  );

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Tomorrow's Plan
            </h3>
            <p className="text-[11px] text-slate-400">
              Advance schedule ({tomorrowDayName})
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          {tomorrowSlots.length} {tomorrowSlots.length === 1 ? 'Session' : 'Sessions'}
        </span>
      </div>

      {/* Content */}
      <div className="pt-4">
        {tomorrowSlots.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-400" />
            <p>No study slots scheduled for tomorrow ({tomorrowDayName}).</p>
            <button
              type="button"
              onClick={() => onNavigate('timetable')}
              className="mt-3 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              + Plan Tomorrow's Timetable
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* High-level summary */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs">
              <div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase block">
                  Planned Target
                </span>
                <strong className="text-base font-black text-slate-900 dark:text-white">
                  {formatDuration(totalPlannedMinutes)}
                </strong>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <span>First: {tomorrowSlots[0]?.startTime}</span>
                <br />
                <span>Last: {tomorrowSlots[tomorrowSlots.length - 1]?.endTime}</span>
              </div>
            </div>

            {/* List of slots */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {tomorrowSlots.map((slot) => {
                const subj = subjects.find((s) => s.id === slot.subjectId);
                const topic = topics.find((t) => t.id === slot.topicId);

                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        {slot.startTime}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {topic ? topic.name : subj ? subj.name : 'Study Block'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDuration(slot.targetDuration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-end">
        <button
          type="button"
          onClick={() => onNavigate('timetable')}
          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
        >
          VIEW TOMORROW →
        </button>
      </div>
    </div>
  );
}
