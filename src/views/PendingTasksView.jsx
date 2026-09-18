import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { formatDuration } from '../utils/dateUtils';
import { sounds } from '../utils/audio';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Play,
  Trash2,
  Plus,
  AlertCircle,
  Calendar,
  Sparkles,
  BookOpen,
  Filter,
  Search,
  CheckSquare,
  ArrowRight,
  Flame,
  Archive,
} from 'lucide-react';
import GlassIcon from '../components/common/GlassIcon';

export default function PendingTasksView({ onNavigate }) {
  const {
    pendingTasks,
    courses,
    subjects,
    activeCourseId,
    addPendingTask,
    completePendingTask,
    deletePendingTask,
  } = useStudy();

  const { startStudy } = useTimer();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('pending'); // 'pending' | 'completed'

  // Inline Quick Add form state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCourseId, setNewTaskCourseId] = useState(activeCourseId || (courses[0]?.id || ''));
  const [newTaskSubjectId, setNewTaskSubjectId] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(45);
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskDate, setNewTaskDate] = useState(() => {
    // Default to yesterday so it simulates a rolled over task
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });

  const availableSubjects = subjects.filter(
    (s) => !newTaskCourseId || s.courseId === newTaskCourseId
  );

  // Active vs Completed
  const activePendingList = useMemo(
    () => pendingTasks.filter((t) => t.status === 'Pending'),
    [pendingTasks]
  );
  const completedList = useMemo(
    () => pendingTasks.filter((t) => t.status === 'Completed'),
    [pendingTasks]
  );

  // Today string for overdue calculation
  const todayStr = new Date().toISOString().split('T')[0];

  const calculateDaysOverdue = (dateStr) => {
    if (!dateStr) return 0;
    const taskDate = new Date(dateStr);
    const today = new Date(todayStr);
    const diffTime = today - taskDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Filtered List based on tab, course, and search
  const displayedTasks = useMemo(() => {
    const list = selectedTab === 'pending' ? activePendingList : completedList;
    return list.filter((task) => {
      const matchesSearch =
        !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse =
        selectedCourseFilter === 'all' || task.courseId === selectedCourseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [selectedTab, activePendingList, completedList, searchQuery, selectedCourseFilter]);

  // Total backlog minutes
  const totalBacklogMinutes = activePendingList.reduce(
    (acc, t) => acc + (t.estimatedMinutes || 45),
    0
  );

  // Handlers
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addPendingTask({
      title: newTaskTitle,
      courseId: newTaskCourseId || null,
      subjectId: newTaskSubjectId || null,
      estimatedMinutes: Number(newTaskMinutes) || 45,
      priority: newTaskPriority,
      originalDate: newTaskDate,
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handleContinueTask = (task) => {
    sounds.playClick();
    if (task.courseId) {
      startStudy({
        courseId: task.courseId,
        subjectId: task.subjectId || null,
        topicId: task.topicId || null,
      });
    }
    if (onNavigate) {
      onNavigate('timer');
    }
  };

  const handleComplete = (id) => {
    sounds.playClick();
    completePendingTask(id);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-5xl mx-auto">
      {/* HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-[#070c18]/90 border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-rose-500/[0.08] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/[0.06] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-1">
              <ClipboardList className="w-4 h-4" />
              Auto-Rollover Task Backlog
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              📋 Pending Tasks
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-1 max-w-xl">
              Unfinished tasks automatically carry forward across days and remain safely in your backlog until you mark them complete.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingTask((prev) => !prev)}
            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {isAddingTask ? 'Cancel' : '+ Add Pending Task'}
          </button>
        </div>

        {/* METRIC PILLS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.08]">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
              Active Pending
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-500 dark:text-rose-400 font-mono">
              {activePendingList.length} Tasks
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
              Estimated Focus
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 font-mono">
              {formatDuration(totalBacklogMinutes)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
              Completed Tasks
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-500 dark:text-emerald-400 font-mono">
              {completedList.length} Done
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
              Rollover Rule
            </span>
            <div className="text-xs font-black text-sky-500 dark:text-sky-400 font-mono mt-1">
              Never Auto-Deletes 🛡️
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ADD TASK FORM (Collapsible) */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-[#090e1c]/95 border-2 border-rose-400/40 dark:border-rose-500/40 backdrop-blur-2xl shadow-xl animate-scaleIn space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-500" />
              Add Task to Pending Backlog
            </h3>
            <span className="text-[10px] text-slate-400">
              Task automatically carries forward until completed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Task Name / Topic <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. JavaScript Array Methods Practice"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Course
              </label>
              <select
                value={newTaskCourseId}
                onChange={(e) => setNewTaskCourseId(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Original Date Scheduled
              </label>
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Est. Minutes
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={newTaskMinutes}
                  onChange={(e) => setNewTaskMinutes(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="py-2 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md shadow-rose-500/25"
            >
              Save to Pending Backlog
            </button>
          </div>
        </form>
      )}

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#070c18]/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04]">
          <button
            type="button"
            onClick={() => setSelectedTab('pending')}
            className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${
              selectedTab === 'pending'
                ? 'bg-white dark:bg-white/[0.12] text-rose-500 dark:text-rose-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Backlog ({activePendingList.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('completed')}
            className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all ${
              selectedTab === 'completed'
                ? 'bg-white dark:bg-white/[0.12] text-emerald-500 dark:text-emerald-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed Archive ({completedList.length})
          </button>
        </div>

        {/* Search & Course Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs font-semibold pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>

          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TASKS LIST */}
      {displayedTasks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/10">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-3xl">
            {selectedTab === 'pending' ? '🎉' : '📂'}
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {selectedTab === 'pending'
              ? 'No Pending Tasks in Backlog!'
              : 'No completed tasks in archive yet.'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {selectedTab === 'pending'
              ? 'All caught up! Incomplete tasks roll over automatically, or you can add custom tasks using the button above.'
              : 'When you complete tasks from your backlog, they will appear here in the archive.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedTasks.map((task) => {
            const course = courses.find((c) => c.id === task.courseId);
            const subject = subjects.find((s) => s.id === task.subjectId);
            const overdueDays = calculateDaysOverdue(task.originalDate);

            return (
              <div
                key={task.id}
                className={`group p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-white/[0.04] border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg ${
                  task.status === 'Completed'
                    ? 'border-emerald-500/30 dark:border-emerald-500/20 opacity-75'
                    : overdueDays > 0
                    ? 'border-rose-400/40 dark:border-rose-500/30 hover:border-rose-400'
                    : 'border-slate-200/80 dark:border-white/10 hover:border-sky-400'
                }`}
              >
                {/* Left Task Information */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleComplete(task.id)}
                    disabled={task.status === 'Completed'}
                    className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      task.status === 'Completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-white/30 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/20'
                    }`}
                    title="Mark as Completed"
                  >
                    {task.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-black text-slate-900 dark:text-white truncate ${
                          task.status === 'Completed' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Overdue Badge */}
                      {task.status === 'Pending' && overdueDays > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-400/30 animate-pulse">
                          ⚠️ {overdueDays} {overdueDays === 1 ? 'Day' : 'Days'} Overdue
                        </span>
                      )}

                      {/* Priority chip */}
                      <span
                        className={`text-[9px] font-bold px-2 py-0.2 rounded-md uppercase ${
                          task.priority === 'High'
                            ? 'bg-rose-500/15 text-rose-500'
                            : task.priority === 'Low'
                            ? 'bg-sky-500/15 text-sky-400'
                            : 'bg-yellow-500/15 text-yellow-500'
                        }`}
                      >
                        {task.priority || 'Medium'}
                      </span>
                    </div>

                    {/* Metadata line: Course, Subject, Scheduled Date & Completion Date */}
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400 mt-1">
                      {course && (
                        <span className="text-sky-500 dark:text-sky-400 font-bold flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {course.name}
                        </span>
                      )}
                      {subject && <span>• {subject.name}</span>}
                      {task.originalDate && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          Scheduled: {task.originalDate}
                        </span>
                      )}
                      {task.status === 'Completed' && (task.completedAt || task.completedDate) && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-400/30 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed: {task.completedAt ? new Date(task.completedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : task.completedDate}
                        </span>
                      )}
                      <span>• ⏱️ {task.estimatedMinutes || 45} mins</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {task.status === 'Pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleContinueTask(task)}
                        className="py-2 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-extrabold text-xs shadow-md shadow-sky-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                        title="Start Study Timer for this task"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>▶ Continue Task</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleComplete(task.id)}
                        className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30 font-bold text-xs flex items-center gap-1 transition-all"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete ✅</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => deletePendingTask(task.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
