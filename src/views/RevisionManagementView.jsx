import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration } from '../utils/dateUtils';
import { sounds } from '../utils/audio';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  RotateCcw,
  History,
  Trash2,
  Edit2,
  CheckSquare,
  ArrowRight,
  Flame,
} from 'lucide-react';
import RevisionModal from '../components/modals/RevisionModal';
import AddFromCompletedTasksModal from '../components/modals/AddFromCompletedTasksModal';
import RevisionTimerModal from '../components/modals/RevisionTimerModal';

export default function RevisionManagementView({ onNavigate }) {
  const {
    revisions,
    courses,
    subjects,
    topics,
    pendingTasks,
    activeCourseId,
    addRevision,
    deleteRevision,
    completeRevision,
  } = useStudy();

  // Tab state: 'schedule' | 'pending' | 'history' | 'suggestions'
  const [activeTab, setActiveTab] = useState('schedule');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Modal states
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionToEdit, setRevisionToEdit] = useState(null);
  const [isAddCompletedModalOpen, setIsAddCompletedModalOpen] = useState(false);
  const [initialTopicForRevision, setInitialTopicForRevision] = useState(null);
  const [activeTimerRevision, setActiveTimerRevision] = useState(null);

  // Dismissed suggestions tracking
  const [dismissedSuggestions, setDismissedSuggestions] = useState([]);

  // Today Date string
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for computing status
  const getRevisionStatus = (r) => {
    if (r.status === 'Completed') return 'Completed';
    if (!r.revisionDate) return 'Upcoming';
    if (r.revisionDate < todayStr) return 'Pending';
    if (r.revisionDate === todayStr) return 'Today';
    return 'Upcoming';
  };

  // Processed Revisions with computed live status
  const processedRevisions = useMemo(() => {
    return revisions.map((r) => {
      const computedStatus = r.status === 'Completed' ? 'Completed' : getRevisionStatus(r);
      return {
        ...r,
        computedStatus,
      };
    });
  }, [revisions, todayStr]);

  // Metrics calculation
  const todayCount = processedRevisions.filter((r) => r.computedStatus === 'Today').length;
  const pendingCount = processedRevisions.filter((r) => r.computedStatus === 'Pending').length;
  const upcomingCount = processedRevisions.filter((r) => r.computedStatus === 'Upcoming').length;
  const completedCount = processedRevisions.filter((r) => r.computedStatus === 'Completed').length;
  const totalCount = processedRevisions.length;

  const totalRevisionMinutes = processedRevisions.reduce(
    (acc, r) => acc + (r.durationMinutes || 30),
    0
  );

  // Filtered List
  const filteredRevisions = useMemo(() => {
    return processedRevisions.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        (r.topicName && r.topicName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.subjectName && r.subjectName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject =
        selectedSubjectFilter === 'all' ||
        r.subjectId === selectedSubjectFilter ||
        r.subjectName === selectedSubjectFilter;

      const matchesStatus =
        selectedStatusFilter === 'all' || r.computedStatus.toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [processedRevisions, searchQuery, selectedSubjectFilter, selectedStatusFilter]);

  // Automatic Revision Suggestions (Topics completed > 3 days ago that have not been revised recently)
  const automaticSuggestions = useMemo(() => {
    const today = new Date(todayStr);
    const result = [];

    topics.forEach((t) => {
      if (t.status === 'Completed' && !dismissedSuggestions.includes(t.id)) {
        const compDate = t.completedDate || (t.createdAt ? t.createdAt.split('T')[0] : null);
        if (compDate) {
          const compDateTime = new Date(compDate);
          const diffDays = Math.floor((today - compDateTime) / (1000 * 60 * 60 * 24));
          const hasExistingRevision = revisions.some((r) => r.topicId === t.id);

          if (diffDays >= 3 && !hasExistingRevision) {
            const subject = subjects.find((s) => s.id === t.subjectId);
            result.push({
              topic: t,
              subjectName: subject ? subject.name : '',
              daysAgo: diffDays,
            });
          }
        }
      }
    });

    return result;
  }, [topics, revisions, subjects, todayStr, dismissedSuggestions]);

  // Handlers
  const handleOpenNewRevision = () => {
    setRevisionToEdit(null);
    setInitialTopicForRevision(null);
    setIsRevisionModalOpen(true);
  };

  const handleSelectCompletedTopic = (topicObj) => {
    setRevisionToEdit(null);
    setInitialTopicForRevision(topicObj);
    setIsRevisionModalOpen(true);
  };

  const handleStartRevisionTimer = (revision) => {
    sounds.playClick();
    setActiveTimerRevision(revision);
  };

  const handleToggleComplete = (id) => {
    sounds.playClick();
    completeRevision(id);
  };

  const handleDelete = (id) => {
    sounds.playClick();
    deleteRevision(id);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-5xl mx-auto">
      {/* MODALS */}
      <RevisionModal
        isOpen={isRevisionModalOpen}
        revisionToEdit={revisionToEdit}
        initialTopic={initialTopicForRevision}
        onClose={() => {
          setIsRevisionModalOpen(false);
          setRevisionToEdit(null);
          setInitialTopicForRevision(null);
        }}
      />

      <AddFromCompletedTasksModal
        isOpen={isAddCompletedModalOpen}
        onClose={() => setIsAddCompletedModalOpen(false)}
        onSelectTopicForRevision={handleSelectCompletedTopic}
      />

      <RevisionTimerModal
        isOpen={!!activeTimerRevision}
        revisionItem={activeTimerRevision}
        onClose={() => setActiveTimerRevision(null)}
      />

      {/* HERO DASHBOARD HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-white/90 dark:bg-[#070c18]/90 border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-500/[0.08] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-pink-500/[0.06] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-500 dark:text-purple-400 mb-1">
              <BookOpen className="w-4 h-4" />
              Independent Revision Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Revision Dashboard 📚
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Schedule, track, and manage topic revisions independently. Revision progress is tracked separately without affecting normal study task status.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenNewRevision}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Revision</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddCompletedModalOpen(true)}
              className="py-3 px-4 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-400/30 font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <CheckSquare className="w-4 h-4" />
              <span>From Completed</span>
            </button>
          </div>
        </div>

        {/* 5 SUMMARY METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.08] text-center">
            <span className="text-[10px] font-black uppercase text-amber-500 block">Today's Revision</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{todayCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.08] text-center">
            <span className="text-[10px] font-black uppercase text-rose-500 block">Pending Revision</span>
            <span className="text-2xl font-black text-rose-500 dark:text-rose-400">{pendingCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.08] text-center">
            <span className="text-[10px] font-black uppercase text-emerald-500 block">Completed Revision</span>
            <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400">{completedCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.08] text-center">
            <span className="text-[10px] font-black uppercase text-sky-400 block">Upcoming Revision</span>
            <span className="text-2xl font-black text-sky-500 dark:text-sky-400">{upcomingCount}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-400/30 text-center">
            <span className="text-[10px] font-black uppercase text-purple-500 dark:text-purple-400 block">Total Revision Time</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-300">{formatDuration(totalRevisionMinutes)}</span>
          </div>
        </div>
      </div>

      {/* AUTOMATIC REVISION SUGGESTION BANNER (Point 11) */}
      {automaticSuggestions.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-purple-500/15 border-2 border-purple-400/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
              💡
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Smart Revision Suggestion
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                “You completed <span className="text-purple-500 dark:text-purple-400">{automaticSuggestions[0].topic.name}</span> ({automaticSuggestions[0].subjectName}) {automaticSuggestions[0].daysAgo} days ago. Would you like to schedule a Revision?”
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectCompletedTopic(automaticSuggestions[0].topic)}
              className="py-2 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Add Revision
            </button>
            <button
              type="button"
              onClick={() => setDismissedSuggestions((prev) => [...prev, automaticSuggestions[0].topic.id])}
              className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Not Now
            </button>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-[#070c18]/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04]">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`py-1.5 px-4 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'schedule'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🗓️ Schedule ({filteredRevisions.filter((r) => r.computedStatus !== 'Completed').length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`py-1.5 px-4 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'pending'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🟠 Pending ({pendingCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-1.5 px-4 rounded-lg text-xs font-extrabold transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📜 History Log ({completedCount})
          </button>
        </div>

        {/* Search & Subject Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search revisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs font-semibold pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>

          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB CONTENT: SCHEDULE VIEW */}
      {activeTab === 'schedule' && (
        <div className="space-y-3">
          {filteredRevisions.filter((r) => r.computedStatus !== 'Completed').length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/10">
              <div className="text-4xl mb-2">📚</div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                No active revisions scheduled!
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Schedule a new revision or add topics from your completed study tasks.
              </p>
              <button
                type="button"
                onClick={handleOpenNewRevision}
                className="mt-4 py-2 px-5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold"
              >
                + Schedule Revision
              </button>
            </div>
          ) : (
            filteredRevisions
              .filter((r) => r.computedStatus !== 'Completed')
              .map((rev) => {
                const isToday = rev.computedStatus === 'Today';
                const isPending = rev.computedStatus === 'Pending';

                return (
                  <div
                    key={rev.id}
                    className={`group p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-white/[0.04] border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg ${
                      isToday
                        ? 'border-amber-400/60 dark:border-amber-500/40 shadow-amber-500/10'
                        : isPending
                        ? 'border-rose-400/50 dark:border-rose-500/30'
                        : 'border-slate-200/80 dark:border-white/10'
                    }`}
                  >
                    {/* Left Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(rev.id)}
                        className="mt-1 w-5 h-5 rounded-lg border border-slate-300 dark:border-white/30 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 flex items-center justify-center transition-all"
                        title="Mark Revision Complete"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-300 hover:text-emerald-400" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {rev.topicName || rev.title}
                          </h4>

                          {/* Status Badge */}
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              isToday
                                ? 'bg-amber-500/15 text-amber-500 border border-amber-400/30 animate-pulse'
                                : isPending
                                ? 'bg-rose-500/15 text-rose-500 border border-rose-400/30'
                                : 'bg-sky-500/15 text-sky-400'
                            }`}
                          >
                            {isToday ? '🟡 Today' : isPending ? '🟠 Pending' : '🔵 Upcoming'}
                          </span>

                          <span className="text-[9px] font-bold px-2 py-0.2 rounded-md bg-purple-500/15 text-purple-500">
                            Rev #{rev.revisionNumber || 1}
                          </span>
                        </div>

                        {/* Metadata Details */}
                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400 mt-1">
                          {rev.subjectName && (
                            <span className="text-purple-500 dark:text-purple-400 font-bold flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {rev.subjectName}
                            </span>
                          )}
                          {rev.subTopic && <span>• Sub: {rev.subTopic}</span>}
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-amber-500" />
                            {rev.revisionDate} ({rev.startTime || '19:00'})
                          </span>
                          <span>• ⏱️ {rev.durationMinutes || 30} mins</span>
                        </div>

                        {rev.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans italic">
                            “{rev.notes}”
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {/* Clean Source Video Button (Link text completely hidden) */}
                      {(rev.sourceUrl || rev.videoUrl) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(rev.sourceUrl || rev.videoUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="py-1.5 px-3 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white border border-purple-400/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                          title="Open Video / Lecture Source Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Source Link</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartRevisionTimer(rev)}
                        className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Revision</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleComplete(rev.id)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-400/30 font-bold text-xs hover:bg-emerald-500/25"
                      >
                        Complete ✅
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(rev.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* TAB CONTENT: PENDING VIEW */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {filteredRevisions.filter((r) => r.computedStatus === 'Pending').length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-white/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/10">
              <div className="text-3xl mb-1">🎉</div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                No Pending Overdue Revisions!
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All scheduled revisions are up to date.
              </p>
            </div>
          ) : (
            filteredRevisions
              .filter((r) => r.computedStatus === 'Pending')
              .map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-white/90 dark:bg-white/[0.04] border border-rose-400/40 dark:border-rose-500/30 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {rev.topicName || rev.title}
                      </h4>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-400/30">
                        🟠 Overdue (Scheduled: {rev.revisionDate})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Subject: {rev.subjectName || 'General'} • Duration: {rev.durationMinutes} mins
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartRevisionTimer(rev)}
                      className="py-1.5 px-3.5 rounded-xl bg-purple-500 text-white font-extrabold text-xs"
                    >
                      Start Now
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(rev.id)}
                      className="py-1.5 px-3 rounded-xl bg-emerald-500 text-white font-extrabold text-xs"
                    >
                      Complete ✅
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* TAB CONTENT: HISTORY LOG VIEW */}
      {activeTab === 'history' && (
        <div className="rounded-3xl bg-white/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 p-5 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">
                <th className="pb-3 px-2">Completion Date</th>
                <th className="pb-3 px-2">Subject</th>
                <th className="pb-3 px-2">Topic</th>
                <th className="pb-3 px-2">Duration</th>
                <th className="pb-3 px-2">Revision #</th>
                <th className="pb-3 px-2">Source Link</th>
                <th className="pb-3 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {processedRevisions.filter((r) => r.computedStatus === 'Completed').length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No revision sessions completed yet. Completed revisions will log here.
                  </td>
                </tr>
              ) : (
                processedRevisions
                  .filter((r) => r.computedStatus === 'Completed')
                  .map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-2 font-mono text-slate-700 dark:text-slate-300">
                        {r.completedDate || r.revisionDate}
                      </td>
                      <td className="py-3 px-2 font-bold text-purple-500">{r.subjectName || '—'}</td>
                      <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">{r.topicName || r.title}</td>
                      <td className="py-3 px-2 font-mono text-slate-500">{r.durationMinutes || 30} mins</td>
                      <td className="py-3 px-2 font-bold text-amber-500">Rev #{r.revisionNumber || 1}</td>
                      <td className="py-3 px-2">
                        {(r.sourceUrl || r.videoUrl) ? (
                          <button
                            type="button"
                            onClick={() => window.open(r.sourceUrl || r.videoUrl, '_blank', 'noopener,noreferrer')}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-500 hover:bg-purple-500 hover:text-white flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Source
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-400/30">
                          🟢 Completed
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
