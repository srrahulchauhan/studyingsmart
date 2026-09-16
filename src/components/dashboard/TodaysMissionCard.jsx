import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';
import { formatDuration } from '../../utils/dateUtils';
import ProgressRing from '../common/ProgressRing';
import GlassIcon from '../common/GlassIcon';
import { Target, Play, Sparkles } from 'lucide-react';

export default function TodaysMissionCard({ onNavigate }) {
  const {
    activeCourse,
    activeCourseId,
    topics,
    subjects,
    getTodayStudyTime,
  } = useStudy();

  const { startStudy } = useTimer();

  const dailyTargetHours = activeCourse ? activeCourse.dailyTarget || 4 : 4;
  const targetMinutes = dailyTargetHours * 60;
  const todayStudyMinutes = getTodayStudyTime(activeCourseId);
  const remainingMinutes = Math.max(0, targetMinutes - todayStudyMinutes);
  const progressPercent = targetMinutes > 0 ? Math.min(100, Math.round((todayStudyMinutes / targetMinutes) * 100)) : 0;

  // Next Mission / Target topic (Requirement 11)
  const filteredTopics = topics.filter(
    (t) => !activeCourseId || t.courseId === activeCourseId
  );
  const nextMissionTopic = filteredTopics.find(
    (t) => t.status === 'In Progress' || t.status === 'Pending'
  );

  const topicSubject = nextMissionTopic
    ? subjects.find((s) => s.id === nextMissionTopic.subjectId)
    : null;

  const handleStartMission = () => {
    if (nextMissionTopic) {
      startStudy({
        courseId: nextMissionTopic.courseId,
        studyPlanId: nextMissionTopic.studyPlanId,
        subjectId: nextMissionTopic.subjectId,
        topicId: nextMissionTopic.id,
      });
      onNavigate('timer');
    }
  };

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.09] p-5 sm:p-6 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-2xl command-card flex flex-col justify-between hover:border-yellow-400/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Target} variant="yellow" size="sm" />
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Today's Target
            </h3>
            <p className="text-[11px] text-slate-400">
              Daily quota & target milestones
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-black text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-400/25">
          {dailyTargetHours}h 00m
        </span>
      </div>

      {/* Target Progress Dial (Requirement 11: Sky Blue + Yellow accent) */}
      <div className="py-4 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Completed
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {formatDuration(todayStudyMinutes)}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Remaining
            </span>
            <div className="text-sm font-black text-yellow-400 font-mono">
              {formatDuration(remainingMinutes)}
            </div>
          </div>
        </div>

        {/* Circular Progress Ring with Sky-blue + yellow accent */}
        <ProgressRing
          progress={progressPercent}
          size={90}
          strokeWidth={8}
          variant="sky"
        >
          <span className="text-base font-black text-white font-mono">
            {progressPercent}%
          </span>
        </ProgressRing>
      </div>

      {/* Next Target / Mission Box (Requirement 11) */}
      <div className="mt-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
        <div className="text-[10px] font-black uppercase tracking-wider text-sky-400 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          NEXT TARGET
        </div>

        {nextMissionTopic ? (
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] flex items-center justify-between gap-3">
            <div className="overflow-hidden">
              <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                "{nextMissionTopic.name}"
              </h5>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {topicSubject ? topicSubject.name : 'Curriculum topic'} • Est. {formatDuration(nextMissionTopic.estimatedMinutes)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartMission}
              className="shrink-0 py-2 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-xs shadow-md shadow-sky-500/30 flex items-center gap-1.5 btn-premium hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-3 h-3 fill-current" />
              [START]
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-white/[0.02] text-slate-400 text-xs text-center border border-white/[0.04]">
            All active targets completed! Add more topics to unlock targets.
          </div>
        )}
      </div>
    </div>
  );
}
