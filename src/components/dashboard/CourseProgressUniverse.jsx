import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatDuration } from '../../utils/dateUtils';
import ProgressRing from '../common/ProgressRing';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
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

  if (courses.length === 0) {
    return (
      <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-6 text-center backdrop-blur-xl command-card">
        <GraduationCap className="w-10 h-10 mx-auto mb-2 text-indigo-400 opacity-40" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Course Progress Universe
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          No courses created yet. Add your first learning curriculum to unlock progress tracking.
        </p>
        <button
          type="button"
          onClick={onOpenNewCourse}
          className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all"
        >
          + Create First Course
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Course Progress Universe
            </h3>
            <p className="text-[11px] text-slate-400">
              Active learning pathways & curriculum completion
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('courses')}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View All Courses →
        </button>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {courses.map((course) => {
          const isActive = course.id === activeCourseId;
          const courseStudyMins = getCourseStudyTime(course.id);
          const courseTopics = topics.filter((t) => t.courseId === course.id);
          const completedTopics = courseTopics.filter((t) => t.status === 'Completed').length;
          const totalTopics = courseTopics.length;
          const pendingTopics = totalTopics - completedTopics;

          // Target hours progress calculation
          const targetMins = (course.totalTargetHours || 0) * 60;
          let progressPercent = 0;
          if (targetMins > 0) {
            progressPercent = Math.min(100, Math.round((courseStudyMins / targetMins) * 100));
          } else if (totalTopics > 0) {
            progressPercent = Math.round((completedTopics / totalTopics) * 100);
          }

          const att = getAttendanceStats(course.id);
          const currentTopic = courseTopics.find((t) => t.status === 'In Progress') || courseTopics.find((t) => t.status === 'Pending');

          // Subject mini breakdown
          const courseSubjs = subjects.filter((s) => s.courseId === course.id);

          return (
            <div
              key={course.id}
              onClick={() => setActiveCourseId(course.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-500/[0.08] to-purple-500/[0.04] border-indigo-500/40 shadow-glow-indigo'
                  : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200/70 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {course.category || 'Curriculum'}
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {course.name}
                    </h4>
                  </div>

                  <ProgressRing
                    progress={progressPercent}
                    size={48}
                    strokeWidth={5}
                    variant={isActive ? 'indigo' : 'cyan'}
                  >
                    <span className="text-[10px] font-black">{progressPercent}%</span>
                  </ProgressRing>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-3 p-2 rounded-xl bg-slate-100/70 dark:bg-white/[0.03]">
                  <div>
                    <span className="text-slate-400 block">Total Study</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">
                      {formatDuration(courseStudyMins)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Topics</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">
                      {completedTopics}/{totalTopics}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Attendance</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">
                      {att.percentage}%
                    </strong>
                  </div>
                </div>

                {/* Current In-progress Topic */}
                {currentTopic && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 truncate">
                    <span className="text-slate-400">Current: </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {currentTopic.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Action link */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-white/[0.04] flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {courseSubjs.length} {courseSubjs.length === 1 ? 'Subject' : 'Subjects'}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Select Course <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
