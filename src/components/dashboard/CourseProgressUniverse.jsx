import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatDuration } from '../../utils/dateUtils';
import ProgressRing from '../common/ProgressRing';
import GlassIcon from '../common/GlassIcon';
import {
  BookOpen,
  ArrowRight,
  Plus,
} from 'lucide-react';

export default function CourseProgressUniverse({ onNavigate, onOpenNewCourse }) {
  const {
    courses,
    subjects,
    topics,
    activeCourseId,
    setActiveCourseId,
    getCourseStudyTime,
    getAttendanceStats,
  } = useStudy();

  // Requirement 25: Beautiful Zero Data Empty State
  if (courses.length === 0) {
    return (
      <div className="rounded-3xl bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.09] p-8 text-center backdrop-blur-2xl command-card">
        <GlassIcon icon={BookOpen} variant="sky" size="lg" className="mx-auto mb-3" />
        <h3 className="text-base font-black text-slate-900 dark:text-white">
          Start Your Learning Journey
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-5 max-w-sm mx-auto">
          No courses created yet. Build your first curriculum to track verified progress.
        </p>
        <button
          type="button"
          onClick={onOpenNewCourse}
          className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-xs shadow-lg shadow-sky-500/30 transition-all btn-premium flex items-center gap-1.5 mx-auto"
        >
          <Plus className="w-4 h-4" />
          + CREATE COURSE
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.09] p-5 sm:p-6 shadow-sm backdrop-blur-2xl command-card hover:border-sky-400/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <GlassIcon icon={BookOpen} variant="sky" size="sm" />
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Course Progress
            </h3>
            <p className="text-[11px] text-slate-400">
              Active pathways & completion rates
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('courses')}
          className="text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Courses List matching Requirement 12 */}
      <div className="space-y-3.5 pt-4">
        {courses.map((course) => {
          const isActive = course.id === activeCourseId;
          const courseStudyMins = getCourseStudyTime(course.id);
          const courseTopics = topics.filter((t) => t.courseId === course.id);
          const completedTopics = courseTopics.filter((t) => t.status === 'Completed').length;
          const totalTopics = courseTopics.length;

          const targetMins = (course.totalTargetHours || 0) * 60;
          let progressPercent = 0;
          if (targetMins > 0) {
            progressPercent = Math.min(100, Math.round((courseStudyMins / targetMins) * 100));
          } else if (totalTopics > 0) {
            progressPercent = Math.round((completedTopics / totalTopics) * 100);
          }

          const courseSubjs = subjects.filter((s) => s.courseId === course.id);

          return (
            <div
              key={course.id}
              onClick={() => setActiveCourseId(course.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl flex flex-col justify-between command-card ${
                isActive
                  ? 'bg-sky-500/[0.08] border-sky-400/40 shadow-[0_0_24px_rgba(14,165,233,0.25)]'
                  : 'bg-white/40 dark:bg-white/[0.025] border-slate-200/70 dark:border-white/[0.06] hover:border-pink-400/30'
              }`}
            >
              <div>
                {/* Header line: Book icon + Name + Progress Ring */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-2.5 truncate">
                    <span className="text-xl">📚</span>
                    <div className="truncate">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        {course.category || 'Curriculum'}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {course.name}
                      </h4>
                    </div>
                  </div>

                  <ProgressRing
                    progress={progressPercent}
                    size={46}
                    strokeWidth={4.5}
                    variant={isActive ? 'sky' : 'yellow'}
                  >
                    <span className="text-[10px] font-black text-white font-mono">{progressPercent}%</span>
                  </ProgressRing>
                </div>

                {/* Sky-Blue Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="text-sky-400 font-mono">{progressPercent}% Complete</span>
                    <span className="text-yellow-400 font-mono">{formatDuration(courseStudyMins)} Study Time</span>
                  </div>
                  <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-700 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Small Yellow Statistics (Requirement 12) */}
                <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-white/40 dark:bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-slate-400 text-[10px]">Topics Completed:</span>
                  <span className="font-bold text-yellow-400 font-mono text-[11px]">
                    {completedTopics} / {totalTopics} Topics
                  </span>
                </div>
              </div>

              {/* Action Button: [OPEN COURSE →] */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/[0.05] flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  {courseSubjs.length} {courseSubjs.length === 1 ? 'Subject' : 'Subjects'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCourseId(course.id);
                    onNavigate('courses');
                  }}
                  className="font-black text-sky-400 hover:text-sky-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  OPEN COURSE →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
