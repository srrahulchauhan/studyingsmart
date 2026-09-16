import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration, formatDate } from '../utils/dateUtils';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Archive,
  RotateCcw,
  Clock,
  Target,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FolderKanban,
  CheckSquare,
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
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <GraduationCap className="w-4 h-4" />
            Curriculum Control
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Course Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every course maintains completely isolated study plans, subjects, topics, and sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            <option value="All">All ({courses.length})</option>
            <option value="Active">Active ({courses.filter(c => !c.isArchived).length})</option>
            <option value="Archived">Archived ({courses.filter(c => c.isArchived).length})</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setCourseToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            + New Course
          </button>
        </div>
      </div>

      {/* Zero State */}
      {courses.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No courses yet.
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
            Create your first course to begin organizing your subjects, study plans, and daily targets.
          </p>
          <button
            type="button"
            onClick={() => {
              setCourseToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all"
          >
            + Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCourses.map((course) => {
            const actualMins = getCourseStudyTime(course.id);
            const targetMins = (course.totalTargetHours || 0) * 60;
            const remainingMins = Math.max(0, targetMins - actualMins);
            const progress = targetMins > 0 ? Math.min(100, Math.round((actualMins / targetMins) * 100)) : 0;
            const courseSubjects = subjects.filter(s => s.courseId === course.id);
            const courseTopics = topics.filter(t => t.courseId === course.id);
            const att = getAttendanceStats(course.id);
            const isActive = activeCourseId === course.id;

            return (
              <div
                key={course.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all p-5 flex flex-col justify-between shadow-sm ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Bar: Badges and Actions */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {course.category || 'General'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        course.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : course.status === 'Paused'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      }`}>
                        {course.status}
                      </span>
                      {course.isArchived && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Archived
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Set Active Button */}
                      {!isActive && !course.isArchived && (
                        <button
                          type="button"
                          onClick={() => setActiveCourseId(course.id)}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
                        >
                          Set Active
                        </button>
                      )}
                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => setCourseToDuplicate(course)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Duplicate Course"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          setCourseToEdit(course);
                          setIsCreateModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Archive / Restore */}
                      {course.isArchived ? (
                        <button
                          type="button"
                          onClick={() => restoreCourse(course.id)}
                          className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                          title="Restore Course"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => archiveCourse(course.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Archive Course"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setCourseToDelete(course)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Course Title & Purpose */}
                  <div className="mt-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {course.name}
                    </h3>
                    {course.purpose && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
                        "{course.purpose}"
                      </p>
                    )}
                    {course.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">Course Progress</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Actual Study</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatDuration(actualMins)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Target</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {course.totalTargetHours || 0}h
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Remaining</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatDuration(remainingMins)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Stats & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                      {courseSubjects.length} Subjects
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                      {courseTopics.length} Topics
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveCourseId(course.id);
                      onNavigate('subjects');
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
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
