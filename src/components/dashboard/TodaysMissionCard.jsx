import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { useTimer } from '../../context/TimerContext';
import { formatDuration } from '../../utils/dateUtils';
import ProgressRing from '../common/ProgressRing';
import { Target, Play, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

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

  // Next Mission topic
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
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Today's Mission
            </h3>
            <p className="text-[11px] text-slate-400">
              Daily quota & target milestones
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
          Target: {dailyTargetHours}h
        </span>
      </div>

      {/* Target Progress Dial */}
      <div className="py-4 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Completed Today
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatDuration(todayStudyMinutes)}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Remaining Target
            </span>
            <div className="text-sm font-bold text-rose-500">
              {formatDuration(remainingMinutes)}
            </div>
          </div>
        </div>

        <ProgressRing
          progress={progressPercent}
          size={84}
          strokeWidth={8}
          variant="rose"
        >
          <span className="text-base font-black text-slate-900 dark:text-white">
            {progressPercent}%
          </span>
        </ProgressRing>
      </div>

      {/* Next Mission Box */}
      <div className="mt-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Next Mission
        </div>

        {nextMissionTopic ? (
          <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-white/[0.02] border border-indigo-200/50 dark:border-white/[0.05] flex items-center justify-between gap-3">
            <div className="overflow-hidden">
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                {nextMissionTopic.name}
              </h5>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {topicSubject ? topicSubject.name : 'Curriculum topic'} • Est. {formatDuration(nextMissionTopic.estimatedMinutes)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartMission}
              className="shrink-0 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              START MISSION →
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-slate-400 text-xs text-center">
            All active topics completed! Create more topics to unlock missions.
          </div>
        )}
      </div>
    </div>
  );
}
