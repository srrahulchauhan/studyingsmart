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

  const toggleExpand = (id) => {
    setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-white/[0.045] p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.09] shadow-sm backdrop-blur-2xl command-card">
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
              Organize individual subjects, set targets, break into granular topics, and track focus.
            </p>
          </div>
        </div>

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

      {/* Zero State */}
      {filteredSubjects.length === 0 ? (
        <div className="py-20 px-8 text-center bg-white/80 dark:bg-white/[0.045] rounded-3xl border border-slate-200/80 dark:border-white/[0.09] max-w-lg mx-auto backdrop-blur-2xl command-card">
          <GlassIcon icon={Layers} variant="sky" size="xl" className="mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            No subjects created yet.
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 mb-6 leading-relaxed max-w-xs mx-auto">
            Add subjects to your course (e.g. JavaScript, React, HTML, CSS) and populate them with topics to start tracking study time.
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
            const subjectTopics = topics.filter((t) => t.subjectId === subject.id);
            const completedCount = subjectTopics.filter((t) => t.status === 'Completed').length;
            const pendingCount = subjectTopics.length - completedCount;

            const actualSubjectMins = getSubjectStudyTime(subject.id);
            const targetMins = (subject.targetHours || 0) * 60;
            const progress = targetMins > 0 ? Math.min(100, Math.round((actualSubjectMins / targetMins) * 100)) : (subjectTopics.length > 0 ? Math.round((completedCount / subjectTopics.length) * 100) : 0);

            const isExpanded = expandedSubjects[subject.id] !== undefined ? expandedSubjects[subject.id] : true;

            // Requirement 13: Subject Cards
            return (
              <div
                key={subject.id}
                className="rounded-3xl bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.09] shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-2xl overflow-hidden command-card hover:border-sky-400/30"
              >
                {/* Subject Header / Accordion Trigger */}
                <div className="p-5 bg-white/40 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(subject.id)}
                        className="p-2 rounded-xl bg-white/50 dark:bg-white/[0.06] text-slate-400 hover:text-white mt-0.5 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <div className="flex items-start gap-2.5">
                        <GlassIcon icon={Layers} variant="sky" size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-400/20">
                              {course ? course.name : 'Course'}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Priority: {subject.priority}
                            </span>
                          </div>
                          <h2 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                            {subject.name}
                          </h2>
                          {subject.purpose && (
                            <p className="text-xs text-slate-400 italic mt-0.5">
                              "{subject.purpose}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Subject Metrics matching Requirement 13 */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-3.5 text-xs bg-white/60 dark:bg-white/[0.035] px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Actual Hours</span>
                          <span className="font-black text-sky-400 font-mono">
                            {formatDuration(actualSubjectMins)}
                          </span>
                        </div>
                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Target</span>
                          <span className="font-bold text-slate-800 dark:text-white font-mono">
                            {subject.targetHours || 0}h
                          </span>
                        </div>
                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Progress</span>
                          <span className="font-black text-yellow-400 font-mono">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Completed / Pending</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                            {completedCount} / {pendingCount}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTargetSubjectForTopic(subject.id);
                          setTopicToEdit(null);
                          setIsTopicModalOpen(true);
                        }}
                        className="py-2 px-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-black shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5 btn-premium"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Topic
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSubjectToEdit(subject);
                          setIsSubjectModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSubjectToDelete(subject)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thin Colored Progress Bar (Requirement 13) */}
                  <div className="mt-3.5">
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
                  <div className="p-5">
                    {subjectTopics.length === 0 ? (
                      <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-xs text-slate-400 mb-3">
                          No topics added for this subject yet.
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
                          + Add First Topic
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {subjectTopics.map((topic) => {
                          const topicStudyMins = getTopicStudyTime(topic.id);
                          const isCompleted = topic.status === 'Completed';

                          return (
                            <div
                              key={topic.id}
                              className={`py-3 px-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                                isCompleted ? 'opacity-75' : ''
                              }`}
                            >
                              {/* Left: Checkbox & Name */}
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleComplete(topic)}
                                  className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                                  title={isCompleted ? 'Mark Pending' : 'Complete Topic'}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </button>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className={`text-sm font-bold text-slate-800 dark:text-slate-100 ${
                                      isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                                    }`}>
                                      {topic.name}
                                    </h4>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                      topic.status === 'Completed'
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50'
                                        : topic.status === 'In Progress'
                                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                    }`}>
                                      {topic.status}
                                    </span>
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

                              {/* Right: Actions */}
                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {/* Start Study Button */}
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
