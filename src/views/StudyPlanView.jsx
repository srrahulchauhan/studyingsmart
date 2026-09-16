import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration, formatDate } from '../utils/dateUtils';
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Target,
  Calendar,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import StudyPlanModal from '../components/modals/StudyPlanModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

export default function StudyPlanView({ onNavigate }) {
  const {
    courses,
    activeCourseId,
    studyPlans,
    addStudyPlan,
    updateStudyPlan,
    deleteStudyPlan,
    getStudyPlanStudyTime,
  } = useStudy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);

  const filteredPlans = studyPlans.filter(p => !activeCourseId || p.courseId === activeCourseId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <FolderKanban className="w-4 h-4" />
            Structured Curriculum
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Study Plans
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Break courses into focused sprints like 30-Day Bootcamps, Revision Plans, or Interview Prep.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setPlanToEdit(null);
            setIsModalOpen(true);
          }}
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Create Study Plan
        </button>
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No study plans created yet.
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
            Create milestone plans within your courses to structure your weekly schedule and daily targets.
          </p>
          <button
            type="button"
            onClick={() => {
              setPlanToEdit(null);
              setIsModalOpen(true);
            }}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25"
          >
            + Create Study Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const course = courses.find(c => c.id === plan.courseId);
            const actualMins = getStudyPlanStudyTime(plan.id);
            const targetMins = (plan.totalTargetHours || 0) * 60;
            const remainingMins = Math.max(0, targetMins - actualMins);
            const progress = targetMins > 0 ? Math.min(100, Math.round((actualMins / targetMins) * 100)) : 0;

            return (
              <div
                key={plan.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      {course ? course.name : 'Unassigned Course'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPlanToEdit(plan);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                        title="Edit Plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlanToDelete(plan)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {plan.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-slate-400">Plan Completion</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Actual</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatDuration(actualMins)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Target</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {plan.totalTargetHours || 0}h
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Remaining</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatDuration(remainingMins)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Days: {plan.studyDays || 'All days'}</span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${
                    plan.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {plan.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <StudyPlanModal
        isOpen={isModalOpen}
        planToEdit={planToEdit}
        courseId={activeCourseId}
        onSave={(data) => {
          if (planToEdit) {
            updateStudyPlan(planToEdit.id, data);
          } else {
            addStudyPlan(data);
          }
        }}
        onClose={() => {
          setIsModalOpen(false);
          setPlanToEdit(null);
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!planToDelete}
        title={`Delete "${planToDelete?.name}"?`}
        message="Are you sure you want to delete this study plan? Linked subjects and topics will be detached."
        onConfirm={() => {
          if (planToDelete) deleteStudyPlan(planToDelete.id);
        }}
        onClose={() => setPlanToDelete(null)}
      />
    </div>
  );
}
