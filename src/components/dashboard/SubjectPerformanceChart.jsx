import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatDuration } from '../../utils/dateUtils';
import { BookOpen, Layers, Sparkles } from 'lucide-react';

export default function SubjectPerformanceChart({ onNavigate }) {
  const { subjects, studySessions, activeCourseId } = useStudy();

  const filteredSubjects = subjects.filter(
    (s) => !activeCourseId || s.courseId === activeCourseId
  );

  // Compute actual hours from StudySession records
  const subjectStats = filteredSubjects.map((subj) => {
    const minutes = studySessions
      .filter((s) => s.subjectId === subj.id)
      .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);

    return {
      id: subj.id,
      name: subj.name,
      minutes,
    };
  });

  // Sort descending by actual hours
  subjectStats.sort((a, b) => b.minutes - a.minutes);

  const maxMinutes = Math.max(...subjectStats.map((s) => s.minutes), 60);

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Subject Performance
            </h3>
            <p className="text-[11px] text-slate-400">
              Focus time distribution across subjects
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('subjects')}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          All Subjects →
        </button>
      </div>

      {/* Bars Content */}
      <div className="pt-4">
        {subjectStats.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30 text-violet-400" />
            <p>No subjects found for this course yet.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {subjectStats.map((subj, idx) => {
              const widthPercent = Math.max(4, Math.round((subj.minutes / maxMinutes) * 100));

              // Colors based on ranking
              const barGradients = [
                'from-indigo-600 to-indigo-400',
                'from-violet-600 to-violet-400',
                'from-cyan-600 to-cyan-400',
                'from-emerald-600 to-emerald-400',
                'from-purple-600 to-purple-400',
              ];
              const gradient = barGradients[idx % barGradients.length];

              return (
                <div key={subj.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {subj.name}
                    </span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                      {formatDuration(subj.minutes)}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/[0.05] text-[11px] text-slate-400">
        Calculated strictly from verified focus session records.
      </div>
    </div>
  );
}
