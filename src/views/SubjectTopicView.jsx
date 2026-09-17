import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { formatDuration, formatDate } from '../utils/dateUtils';
import {
  CalendarDays,
  Plus,
  Play,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckSquare,
  Sparkles,
  Layers,
  Search,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import SubjectModal from '../components/modals/SubjectModal';
import TopicModal from '../components/modals/TopicModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import confetti from 'canvas-confetti';
import GlassIcon from '../components/common/GlassIcon';

export default function SubjectTopicView({ onNavigate }) {
  const {
    courses,
    activeCourseId,
    subjects,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    updateTopicSubTask,
    toggleTopicRevisionRequired,
    deleteTopic,
    toggleTopicComplete,
    getSubjectStudyTime,
    getTopicStudyTime,
    studySessions,
  } = useStudy();

  const { startStudy } = useTimer();

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState(null);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [targetSubjectForTopic, setTargetSubjectForTopic] = useState(null);

  // Accordion open/close state for subjects
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const toggleExpand = (id) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : false
    }));
  };

  const handleExpandAll = () => {
    const next = {};
    subjects.forEach(s => { next[s.id] = true; });
    setExpandedSubjects(next);
  };

  const handleCollapseAll = () => {
    const next = {};
    subjects.forEach(s => { next[s.id] = false; });
    setExpandedSubjects(next);
  };

  const filteredSubjects = subjects.filter(s => !activeCourseId || s.courseId === activeCourseId);

  const handleToggleComplete = (topic) => {
    toggleTopicComplete(topic.id);
    if (topic.status !== 'Completed') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleStartStudyTopic = (topic) => {
    startStudy({
      courseId: topic.courseId,
      studyPlanId: topic.studyPlanId,
      subjectId: topic.subjectId,
      topicId: topic.id,
    });
    onNavigate('timer');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/80 dark:bg-white/[0.045] p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.09] shadow-sm backdrop-blur-2xl command-card">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Layers} variant="sky" size="md" />
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-400 mb-0.5">
              Curriculum Breakdown
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Subjects & Topics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Organize subjects, view topics, set targets, and launch focus timer.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExpandAll}
            className="py-2.5 px-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.06] hover:bg-sky-500/10 text-slate-700 dark:text-slate-200 hover:text-sky-400 font-bold text-xs border border-slate-200/80 dark:border-white/10 flex items-center gap-1.5 transition-all"
            title="Expand all topic sections"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            Expand All
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            className="py-2.5 px-3.5 rounded-2xl bg-white/60 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200/80 dark:border-white/10 flex items-center gap-1.5 transition-all"
            title="Collapse all topic sections"
          >
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            Collapse All
          </button>

          <button
            type="button"
            onClick={() => {
              setSubjectToEdit(null);
              setIsSubjectModalOpen(true);
            }}
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 btn-premium transition-all"
          >
            <Plus className="w-4 h-4" />
            + New Subject
          </button>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      {filteredSubjects.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/60 dark:bg-white/[0.03] p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.07]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics by name..."
              className="w-full pl-10 pr-4 py-2 bg-white/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {['all', 'Pending', 'In Progress', 'Completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-white/40 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {st === 'all' ? 'All Topics' : st}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zero State */}
      {filteredSubjects.length === 0 ? (
        <div className="py-20 px-8 text-center bg-white/80 dark:bg-white/[0.045] rounded-3xl border border-slate-200/80 dark:border-white/[0.09] max-w-lg mx-auto backdrop-blur-2xl command-card">
          <GlassIcon icon={Layers} variant="sky" size="xl" className="mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            No subjects created yet.
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 mb-6 leading-relaxed max-w-xs mx-auto">
            Add subjects to your course (e.g. Computer, Math, Science) and populate them with topics to start tracking study time.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubjectToEdit(null);
              setIsSubjectModalOpen(true);
            }}
            className="py-3 px-7 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-white font-black text-xs shadow-lg shadow-sky-500/30 transition-all btn-premium inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Add First Subject
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubjects.map((subject) => {
            const course = courses.find((c) => c.id === subject.courseId);
            const rawSubjectTopics = topics.filter((t) => t.subjectId === subject.id);

            const subjectTopics = rawSubjectTopics.filter((t) => {
              const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
              const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
              return matchesSearch && matchesStatus;
            });

            const completedCount = rawSubjectTopics.filter((t) => t.status === 'Completed').length;
            const pendingCount = rawSubjectTopics.length - completedCount;

            const actualSubjectMins = getSubjectStudyTime(subject.id);
            const targetMins = (subject.targetHours || 0) * 60;
            const progress = targetMins > 0 ? Math.min(100, Math.round((actualSubjectMins / targetMins) * 100)) : (rawSubjectTopics.length > 0 ? Math.round((completedCount / rawSubjectTopics.length) * 100) : 0);

            // Auto-expand if user is actively searching topics
            const isExpanded = searchQuery.trim().length > 0 ? true : (expandedSubjects[subject.id] !== undefined ? expandedSubjects[subject.id] : true);

            return (
              <div
                key={subject.id}
                className="rounded-2xl bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.09] shadow-sm backdrop-blur-2xl overflow-hidden command-card hover:border-sky-400/30 transition-all"
              >
                {/* Subject Header / Clickable Accordion Trigger */}
                <div
                  onClick={() => toggleExpand(subject.id)}
                  className="p-4 sm:p-4.5 bg-white/40 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06] cursor-pointer hover:bg-slate-50/70 dark:hover:bg-white/[0.04] transition-all select-none group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(subject.id);
                        }}
                        className="p-1.5 rounded-lg bg-white/60 dark:bg-white/[0.06] text-slate-400 group-hover:text-sky-400 group-hover:bg-sky-500/10 mt-0.5 transition-colors"
                        title={isExpanded ? "Collapse Topics" : "View Topics"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-sky-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      <div className="flex items-start gap-2.5">
                        <GlassIcon icon={Layers} variant="sky" size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-400/20">
                              {course ? course.name : 'Course'}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Priority: {subject.priority}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            <h2 className="text-base font-black text-slate-900 dark:text-white group-hover:text-sky-400 transition-colors">
                              {subject.name}
                            </h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                              {rawSubjectTopics.length} {rawSubjectTopics.length === 1 ? 'Topic' : 'Topics'}
                            </span>
                          </div>

                          {subject.purpose && (
                            <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">
                              "{subject.purpose}"
                            </p>
                          )}

                          {!isExpanded && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 mt-0.5">
                              <ChevronDown className="w-3.5 h-3.5 animate-bounce" /> Click to view {rawSubjectTopics.length} topics
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Subject Metrics */}
                    <div
                      className="flex flex-wrap items-center gap-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-3 text-xs bg-white/60 dark:bg-white/[0.035] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08]">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Actual Hours</span>
                          <span className="font-bold text-sky-400 font-mono text-xs">
                            {formatDuration(actualSubjectMins)}
                          </span>
                        </div>
                        <div className="h-5 w-px bg-slate-200 dark:bg-white/10"></div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Target</span>
                          <span className="font-bold text-slate-800 dark:text-white font-mono text-xs">
                            {subject.targetHours || 0}h
                          </span>
                        </div>
                        <div className="h-5 w-px bg-slate-200 dark:bg-white/10"></div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Progress</span>
                          <span className="font-bold text-yellow-400 font-mono text-xs">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-5 w-px bg-slate-200 dark:bg-white/10"></div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Completed / Pending</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-xs">
                            {completedCount} / {pendingCount}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetSubjectForTopic(subject.id);
                          setTopicToEdit(null);
                          setIsTopicModalOpen(true);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-sm shadow-sky-500/25 transition-all flex items-center gap-1 btn-premium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Topic
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubjectToEdit(subject);
                          setIsSubjectModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubjectToDelete(subject);
                        }}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thin Colored Progress Bar */}
                  <div className="mt-2.5">
                    <div className="w-full bg-slate-100 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-sky-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Topics List Inside Subject */}
                {isExpanded && (
                  <div className="p-5 animate-fadeIn">
                    {subjectTopics.length === 0 ? (
                      <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-xs text-slate-400 mb-3">
                          {searchQuery || statusFilter !== 'all' ? 'No topics match your current filter/search.' : 'No topics added for this subject yet.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetSubjectForTopic(subject.id);
                            setTopicToEdit(null);
                            setIsTopicModalOpen(true);
                          }}
                          className="py-1.5 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
                        >
                          + Add Topic
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {subjectTopics.map((topic) => {
                          const topicStudyMins = getTopicStudyTime(topic.id);
                          const isLectureDone = topic.lectureStatus === 'Completed';
                          const isNotesDone = topic.notesStatus === 'Completed';
                          const isRevisionDone = !topic.revisionRequired || topic.revisionStatus === 'Completed';
                          const isTopicSuccess = isLectureDone && isNotesDone && isRevisionDone;

                          return (
                            <div
                              key={topic.id}
                              className={`py-4 px-4 rounded-2xl border transition-all ${
                                isTopicSuccess
                                  ? 'bg-emerald-500/[0.03] border-emerald-500/25 dark:bg-emerald-950/[0.1]'
                                  : 'bg-white/60 dark:bg-white/[0.025] border-slate-200/80 dark:border-white/[0.08]'
                              }`}
                            >
                              {/* Top Header: Topic Name, Progress Badge & Actions */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleComplete(topic)}
                                    className="text-slate-400 hover:text-emerald-500 transition-colors"
                                    title={isTopicSuccess ? 'Reset Topic Tasks' : 'Mark All Tasks Completed'}
                                  >
                                    {isTopicSuccess ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-slate-400" />
                                    )}
                                  </button>

                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className={`text-base font-black text-slate-900 dark:text-white ${
                                        isTopicSuccess ? 'line-through text-slate-500 dark:text-slate-400' : ''
                                      }`}>
                                        {topic.name}
                                      </h4>

                                      {/* Status Indicator */}
                                      {isTopicSuccess ? (
                                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                                          🎉 SUCCESS / COMPLETED
                                        </span>
                                      ) : (
                                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                                          ⚠️ INCOMPLETE
                                        </span>
                                      )}
                                    </div>

                                    {topic.description && (
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {topic.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                                      <span>Est: {formatDuration(topic.estimatedMinutes)}</span>
                                      <span>•</span>
                                      <span className="font-bold text-sky-400">
                                        Studied: {formatDuration(topicStudyMins)}
                                      </span>
                                      {topic.targetDate && (
                                        <>
                                          <span>•</span>
                                          <span>Due: {formatDate(topic.targetDate)}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <button
                                    type="button"
                                    onClick={() => handleStartStudyTopic(topic)}
                                    className="py-1.5 px-3 rounded-xl bg-sky-500/15 text-sky-400 hover:bg-sky-500 hover:text-white border border-sky-400/30 text-xs font-bold transition-all flex items-center gap-1.5 btn-premium"
                                    title="Launch Focus Timer on this Topic"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    Start Study
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTopicToEdit(topic);
                                      setTargetSubjectForTopic(subject.id);
                                      setIsTopicModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                    title="Edit Topic"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setTopicToDelete(topic)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                                    title="Delete Topic"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* 3 Option Sub-Cards Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-3">
                                {/* 1. 🎥 Lecture Card */}
                                <div
                                  onClick={() => updateTopicSubTask(topic.id, 'lecture')}
                                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                                    isLectureDone
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                      : 'bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400 animate-pulse-subtle'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">🎥</span>
                                    <div>
                                      <div className="text-xs font-extrabold">Lecture</div>
                                      <div className="text-[10px] opacity-80 font-medium">
                                        {isLectureDone ? 'Lecture = Completed ✅' : 'Lecture = Pending 🔴'}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                                    {isLectureDone ? '✅ Done' : '🔴 Pending'}
                                  </span>
                                </div>

                                {/* 2. 📝 Make Notes Card */}
                                <div
                                  onClick={() => updateTopicSubTask(topic.id, 'notes')}
                                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                                    isNotesDone
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                      : 'bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400 animate-pulse-subtle'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">📝</span>
                                    <div>
                                      <div className="text-xs font-extrabold">Make Notes</div>
                                      <div className="text-[10px] opacity-80 font-medium">
                                        {isNotesDone ? 'Notes = Completed ✅' : 'Notes = Pending 🔴'}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                                    {isNotesDone ? '✅ Done' : '🔴 Pending'}
                                  </span>
                                </div>

                                {/* 3. 🔄 Revision Card with ON/OFF Control */}
                                <div
                                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                                    !topic.revisionRequired
                                      ? 'bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                                      : topic.revisionStatus === 'Completed'
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                      : 'bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400 animate-pulse-subtle'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">🔄</span>
                                      <span className="text-xs font-extrabold">Revision</span>
                                    </div>

                                    {/* Revision Required Toggle Switch (Yes / No) */}
                                    <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-0.5 rounded-lg" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={() => toggleTopicRevisionRequired(topic.id, true)}
                                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                          topic.revisionRequired ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                        title="Enable Revision for this topic"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => toggleTopicRevisionRequired(topic.id, false)}
                                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                          !topic.revisionRequired ? 'bg-slate-500 text-white' : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                        title="Exclude Revision for this topic"
                                      >
                                        No
                                      </button>
                                    </div>
                                  </div>

                                  <div
                                    onClick={() => {
                                      if (topic.revisionRequired) {
                                        updateTopicSubTask(topic.id, 'revision');
                                      }
                                    }}
                                    className={`flex items-center justify-between text-[10px] font-medium pt-1 ${
                                      topic.revisionRequired ? 'cursor-pointer select-none' : 'opacity-60 cursor-not-allowed'
                                    }`}
                                  >
                                    <span>
                                      {!topic.revisionRequired
                                        ? 'Revision = Excluded ⭕'
                                        : topic.revisionStatus === 'Completed'
                                        ? 'Revision = Completed ✅'
                                        : 'Revision = Pending 🔴'}
                                    </span>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                                      {!topic.revisionRequired
                                        ? '⭕ Skipped'
                                        : topic.revisionStatus === 'Completed'
                                        ? '✅ Done'
                                        : '🔴 Pending'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        subjectToEdit={subjectToEdit}
        courseId={activeCourseId}
        onSave={(data) => {
          if (subjectToEdit) {
            updateSubject(subjectToEdit.id, data);
          } else {
            addSubject(data);
          }
        }}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setSubjectToEdit(null);
        }}
      />

      <TopicModal
        isOpen={isTopicModalOpen}
        topicToEdit={topicToEdit}
        subjectId={targetSubjectForTopic}
        courseId={activeCourseId}
        onSave={(data) => {
          if (topicToEdit) {
            updateTopic(topicToEdit.id, data);
          } else {
            addTopic(data);
          }
        }}
        onClose={() => {
          setIsTopicModalOpen(false);
          setTopicToEdit(null);
          setTargetSubjectForTopic(null);
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!subjectToDelete}
        title={`Delete "${subjectToDelete?.name}"?`}
        message="Are you sure you want to delete this subject? All topics and resources associated with it will also be deleted."
        onConfirm={() => {
          if (subjectToDelete) deleteSubject(subjectToDelete.id);
        }}
        onClose={() => setSubjectToDelete(null)}
      />

      <ConfirmDeleteModal
        isOpen={!!topicToDelete}
        title={`Delete "${topicToDelete?.name}"?`}
        message="Are you sure you want to delete this topic?"
        onConfirm={() => {
          if (topicToDelete) deleteTopic(topicToDelete.id);
        }}
        onClose={() => setTopicToDelete(null)}
      />
    </div>
  );
}
