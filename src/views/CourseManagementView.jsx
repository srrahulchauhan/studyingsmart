import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration } from '../utils/dateUtils';
import GlassIcon from '../components/common/GlassIcon';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Archive,
  RotateCcw,
  Layers,
  FileText,
} from 'lucide-react';
import CourseModal from '../components/modals/CourseModal';
import DuplicateCourseModal from '../components/modals/DuplicateCourseModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

export default function CourseManagementView({ onSelectCourse, onNavigate }) {
  const {
    courses,
    subjects,
    topics,
    activeCourseId,
    setActiveCourseId,
    addCourse,
    updateCourse,
    deleteCourse,
    archiveCourse,
    restoreCourse,
    duplicateCourse,
    getCourseStudyTime,
    getAttendanceStats,
  } = useStudy();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [courseToDuplicate, setCourseToDuplicate] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Active' | 'Archived'

  const filteredCourses = courses.filter((c) => {
    if (filterStatus === 'Archived') return c.isArchived;
    if (filterStatus === 'Active') return !c.isArchived;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-white/[0.045] p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.09] shadow-sm backdrop-blur-2xl command-card">
        <div className="flex items-center gap-3">
          <GlassIcon icon={BookOpen} variant="sky" size="md" />
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-400 mb-0.5">
              Curriculum Control
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Course Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage curricula with isolated study plans, subjects, topics, and verified focus hours.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-white/60 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-sky-400"
          >
            <option value="All">All ({courses.length})</option>
            <option value="Active">Active ({courses.filter((c) => !c.isArchived).length})</option>
            <option value="Archived">Archived ({courses.filter((c) => c.isArchived).length})</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setCourseToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 btn-premium transition-all"
          >
            <Plus className="w-4 h-4" />
            + New Course
          </button>
        </div>
      </div>

      {/* Requirement 25: Zero State Design */}
      {courses.length === 0 ? (
        <div className="py-20 px-8 text-center bg-white/80 dark:bg-white/[0.045] rounded-3xl border border-slate-200/80 dark:border-white/[0.09] max-w-lg mx-auto backdrop-blur-2xl command-card">
          <GlassIcon icon={BookOpen} variant="sky" size="xl" className="mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Start Your Learning Journey
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 mb-6 leading-relaxed max-w-xs mx-auto">
            No courses created yet. Create your primary curriculum to begin organizing subjects and focus sessions.
          </p>
          <button
            type="button"
            onClick={() => {
              setCourseToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="py-3 px-7 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-xs shadow-lg shadow-sky-500/30 transition-all btn-premium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + CREATE COURSE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((course) => {
            const actualMins = getCourseStudyTime(course.id);
            const targetMins = (course.totalTargetHours || 0) * 60;
            const progress = targetMins > 0 ? Math.min(100, Math.round((actualMins / targetMins) * 100)) : 0;
            const courseSubjects = subjects.filter((s) => s.courseId === course.id);
            const courseTopics = topics.filter((t) => t.courseId === course.id);
            const completedTopics = courseTopics.filter((t) => t.status === 'Completed').length;
            const totalTopics = courseTopics.length;
            const isActive = activeCourseId === course.id;

            return (
              <div
                key={course.id}
                className={`rounded-2xl border transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between backdrop-blur-2xl command-card ${
                  isActive
                    ? 'bg-sky-500/[0.07] border-sky-400/40 shadow-[0_0_20px_rgba(14,165,233,0.18)]'
                    : 'bg-white/80 dark:bg-white/[0.045] border-slate-200/80 dark:border-white/[0.09] hover:border-sky-400/30'
                }`}
              >
                <div>
                  {/* Top Bar: Category badge & Management Actions */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-400/20">
                        {course.category || 'General'}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-400/20">
                          Active
                        </span>
                      )}
                      {course.isArchived && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-400">
                          Archived
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5">
                      {!isActive && !course.isArchived && (
                        <button
                          type="button"
                          onClick={() => setActiveCourseId(course.id)}
                          className="text-[10px] font-bold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 px-2 py-1 rounded-lg transition-colors mr-1"
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setCourseToDuplicate(course)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/[0.06] transition-colors"
                        title="Duplicate Course"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCourseToEdit(course);
                          setIsCreateModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/[0.06] transition-colors"
                        title="Edit Course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {course.isArchived ? (
                        <button
                          type="button"
                          onClick={() => restoreCourse(course.id)}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Restore Course"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => archiveCourse(course.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/[0.06] transition-colors"
                          title="Archive Course"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setCourseToDelete(course)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Course Title & Purpose */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📚</span>
                      <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                        {course.name}
                      </h3>
                    </div>
                    {course.purpose && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
                        "{course.purpose}"
                      </p>
                    )}
                  </div>

                  {/* Progress Bar & Stats */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span className="text-slate-400">{progress}% Complete</span>
                      <span className="text-sky-400 font-mono text-[11px]">
                        {formatDuration(actualMins)} Studied
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/[0.08] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-sky-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Compact Stats Box */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-white/50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.05]">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-medium">Topics Completed</span>
                      <span className="font-bold text-sky-400 font-mono text-xs">
                        {completedTopics} / {totalTopics} Topics
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-medium">Target Curriculum</span>
                      <span className="font-bold text-slate-800 dark:text-white font-mono text-xs">
                        {course.totalTargetHours || 0}h Target
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Open Course Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 font-semibold">
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      {courseSubjects.length} Subjects
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold">
                      <FileText className="w-3.5 h-3.5 text-pink-400" />
                      {courseTopics.length} Topics
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCourseId(course.id);
                      onNavigate('subjects');
                    }}
                    className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1 btn-premium"
                  >
                    Open Course →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CourseModal
        isOpen={isCreateModalOpen}
        courseToEdit={courseToEdit}
        onSave={(data) => {
          if (courseToEdit) {
            updateCourse(courseToEdit.id, data);
          } else {
            addCourse(data);
          }
        }}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCourseToEdit(null);
        }}
      />

      <DuplicateCourseModal
        isOpen={!!courseToDuplicate}
        course={courseToDuplicate}
        onDuplicate={duplicateCourse}
        onClose={() => setCourseToDuplicate(null)}
      />

      <ConfirmDeleteModal
        isOpen={!!courseToDelete}
        title={`Delete "${courseToDelete?.name}"?`}
        message="Are you sure you want to permanently delete this course? All associated study plans, subjects, topics, timetable slots, and sessions will also be removed."
        onConfirm={() => {
          if (courseToDelete) deleteCourse(courseToDelete.id);
        }}
        onClose={() => setCourseToDelete(null)}
      />
    </div>
  );
}
