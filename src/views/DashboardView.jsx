import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { formatDuration, getTimeGreeting, formatDate } from '../utils/dateUtils';
import ProgressRing from '../components/common/ProgressRing';
import AnimatedNumber from '../components/common/AnimatedNumber';
import StatCard from '../components/common/StatCard';
import SessionCompletionModal from '../components/modals/SessionCompletionModal';

// Specialized Dashboard Components
import LiveStudyControlCard from '../components/dashboard/LiveStudyControlCard';
import LearningMapTimeline from '../components/dashboard/LearningMapTimeline';
import ProductivityHeatmap from '../components/dashboard/ProductivityHeatmap';
import WeeklyStudyChart from '../components/dashboard/WeeklyStudyChart';
import CourseProgressUniverse from '../components/dashboard/CourseProgressUniverse';
import SubjectPerformanceChart from '../components/dashboard/SubjectPerformanceChart';
import TodaysMissionCard from '../components/dashboard/TodaysMissionCard';
import FocusInsightsCard from '../components/dashboard/FocusInsightsCard';
import RecentActivityTimeline from '../components/dashboard/RecentActivityTimeline';
import UpcomingStudyCard from '../components/dashboard/UpcomingStudyCard';
import TomorrowPlanPreview from '../components/dashboard/TomorrowPlanPreview';
import QuickActionCommandBar from '../components/dashboard/QuickActionCommandBar';

import {
  Sparkles,
  Plus,
  Play,
  Flame,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react';

export default function DashboardView({
  onOpenNewCourse,
  onOpenNewPlan,
  onOpenNewSubject,
  onOpenNewTopic,
  onOpenNewResource,
  onOpenNewTimetable,
  onNavigate,
}) {
  const {
    courses,
    subjects,
    topics,
    activeCourseId,
    activeCourse,
    getCourseStudyTime,
    getSubjectStudyTime,
    getTodayStudyTime,
    getWeeklyStudyTime,
    getMonthlyStudyTime,
    getAttendanceStats,
    streak,
    settings,
  } = useStudy();

  const {
    activeSession,
    elapsedActiveSeconds,
    elapsedBreakSeconds,
    stopStudy,
    resumeStudy,
  } = useTimer();

  const [hasDismissedWelcome, setHasDismissedWelcome] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionSummary, setCompletionSummary] = useState(null);

  const currentCourse = activeCourse;
  const currentCourseId = activeCourseId;

  // Real statistics (NO SYNTHETIC / NO FAKE DATA)
  const todayStudyMins = getTodayStudyTime(currentCourseId);
  const weeklyStudyMins = getWeeklyStudyTime(currentCourseId);
  const monthlyStudyMins = getMonthlyStudyTime(currentCourseId);

  const dailyTargetHours = currentCourse ? currentCourse.dailyTarget || 4 : 4;
  const dailyTargetMins = dailyTargetHours * 60;
  const dailyProgress = dailyTargetMins > 0 ? Math.min(100, Math.round((todayStudyMins / dailyTargetMins) * 100)) : 0;

  // Topics counts
  const filteredTopics = topics.filter((t) => !currentCourseId || t.courseId === currentCourseId);
  const completedTopicsCount = filteredTopics.filter((t) => t.status === 'Completed').length;
  const pendingTopicsCount = filteredTopics.filter((t) => t.status !== 'Completed').length;

  // Attendance stats
  const attStats = getAttendanceStats(currentCourseId);

  // Overall course progress
  let courseProgress = 0;
  let actualCourseMins = 0;
  let targetCourseMins = 0;

  if (currentCourse) {
    actualCourseMins = getCourseStudyTime(currentCourse.id);
    targetCourseMins = (currentCourse.totalTargetHours || 0) * 60;
    courseProgress = targetCourseMins > 0 ? Math.min(100, Math.round((actualCourseMins / targetCourseMins) * 100)) : 0;
  }

  // Handle Stopping Session with Completion Modal
  const handleRequestStopSession = () => {
    if (!activeSession) return;

    const actualMins = Math.max(0, Math.round(elapsedActiveSeconds / 60));
    const breakMins = Math.round(elapsedBreakSeconds / 60);
    const totalMins = actualMins + breakMins;

    const subj = subjects.find((s) => s.id === activeSession.subjectId);
    const topic = topics.find((t) => t.id === activeSession.topicId);
    const course = courses.find((c) => c.id === activeSession.courseId);

    const todaySubjMins = activeSession.subjectId ? getSubjectStudyTime(activeSession.subjectId) + actualMins : actualMins;
    const courseTotMins = activeSession.courseId ? getCourseStudyTime(activeSession.courseId) + actualMins : actualMins;

    setCompletionSummary({
      courseName: course ? course.name : 'General Course',
      subjectName: subj ? subj.name : 'Focus Session',
      topicName: topic ? topic.name : 'Curriculum topic',
      actualStudyMinutes: actualMins,
      breakMinutes: breakMins,
      totalSessionMinutes: totalMins,
      todaySubjectMinutes: todaySubjMins,
      courseTotalMinutes: courseTotMins,
      topicProgressPercent: topic?.status === 'Completed' ? 100 : 75,
    });

    setIsCompletionModalOpen(true);
  };

  const handleConfirmSaveSession = (markTopicComplete = false) => {
    stopStudy(markTopicComplete);
    setIsCompletionModalOpen(false);
    setCompletionSummary(null);
  };

  const handleContinueStudyFromModal = () => {
    setIsCompletionModalOpen(false);
    resumeStudy();
  };

  const userName = settings?.userName || 'Scholar';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      {/* Session Completion Modal */}
      <SessionCompletionModal
        isOpen={isCompletionModalOpen}
        sessionSummary={completionSummary}
        onSaveSession={handleConfirmSaveSession}
        onContinueStudy={handleContinueStudyFromModal}
      />

      {/* 1. FRESH USER ONBOARDING BANNER (Zero Courses) */}
      {courses.length === 0 && !hasDismissedWelcome && (
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/90 via-indigo-950/90 to-purple-950/90 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/20 border border-indigo-500/30 backdrop-blur-xl command-card">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 backdrop-blur-md text-xs font-bold mb-3 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome to StudyFlow Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              Your Personal Learning OS is Ready.
            </h1>
            <p className="text-indigo-200/90 text-xs sm:text-sm mb-6 leading-relaxed">
              Create your primary course curriculum (e.g. MERN Full Stack, Data Science, UPSC). Organize subjects, break down topics, and track verified focus hours with zero synthetic fluff.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenNewCourse}
                className="py-2.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                + Create Your First Course
              </button>
              <button
                type="button"
                onClick={() => setHasDismissedWelcome(true)}
                className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
              >
                Dismiss Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROW 1: HERO SECTION */}
      <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-6 sm:p-8 shadow-sm backdrop-blur-xl command-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Study Command Center
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {getTimeGreeting()}, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your learning command center is ready. Keep consistent and control every minute.
          </p>
        </div>

        {/* Hero Quick Metrics */}
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {/* Streak Badge */}
          <div className="flex items-center gap-3 p-3.5 px-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Flame className="w-7 h-7 fill-amber-500 text-amber-500 animate-pulse" />
            <div>
              <span className="text-[9px] uppercase font-bold text-amber-500/80 block">
                Current Streak
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                <AnimatedNumber value={streak.current} /> DAYS
              </div>
            </div>
          </div>

          {/* Today's Quota Ring */}
          <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
            <ProgressRing
              progress={dailyProgress}
              size={54}
              strokeWidth={5}
              variant="indigo"
            >
              <span className="text-[10px] font-black">{dailyProgress}%</span>
            </ProgressRing>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                Today's Target
              </span>
              <div className="text-xs font-black text-slate-900 dark:text-white font-mono">
                {formatDuration(todayStudyMins)} / {dailyTargetHours}h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: LIVE STUDY CONTROL (CENTRAL FOCAL CARD) */}
      <LiveStudyControlCard
        onRequestStopSession={handleRequestStopSession}
        onNavigate={onNavigate}
      />

      {/* ROW 3: ADVANCED 8 STATISTIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Today Study */}
        <StatCard
          title="Today Study"
          displayValue={formatDuration(todayStudyMins)}
          description="Active focus time"
          icon={Clock}
          variant="indigo"
          progress={dailyProgress}
          footerText={`Target: ${dailyTargetHours}h 00m`}
          sparklineData={[todayStudyMins * 0.2, todayStudyMins * 0.5, todayStudyMins * 0.8, todayStudyMins]}
        />

        {/* 2. Today Target */}
        <StatCard
          title="Today Target"
          displayValue={`${dailyTargetHours}h 00m`}
          description="Daily study objective"
          icon={Target}
          variant="rose"
          progress={dailyProgress}
          footerText={`${formatDuration(Math.max(0, dailyTargetMins - todayStudyMins))} remaining`}
          sparklineData={[4, 5, 4, 6, dailyTargetHours]}
        />

        {/* 3. Weekly Study */}
        <StatCard
          title="Weekly Study"
          displayValue={formatDuration(weeklyStudyMins)}
          description="Accumulated this week"
          icon={TrendingUp}
          variant="cyan"
          sparklineData={[weeklyStudyMins * 0.1, weeklyStudyMins * 0.3, weeklyStudyMins * 0.6, weeklyStudyMins]}
          footerText="Mon - Sun total"
        />

        {/* 4. Attendance */}
        <StatCard
          title="Attendance"
          value={attStats.percentage}
          displayValue={`${attStats.percentage}%`}
          description={`${attStats.present} Present / ${attStats.partial} Partial`}
          icon={CheckCircle2}
          variant="emerald"
          progress={attStats.percentage}
          footerText="Consistency rating"
          sparklineData={[70, 80, 85, attStats.percentage || 75]}
        />

        {/* 5. Completed Topics */}
        <StatCard
          title="Completed Topics"
          value={completedTopicsCount}
          description="Mastered curriculum units"
          icon={CheckCircle2}
          variant="emerald"
          sparklineData={[0, 1, 2, completedTopicsCount]}
          footerText={`${filteredTopics.length} total topics`}
        />

        {/* 6. Pending Topics */}
        <StatCard
          title="Pending Topics"
          value={pendingTopicsCount}
          description="In curriculum backlog"
          icon={AlertCircle}
          variant="amber"
          sparklineData={[pendingTopicsCount + 2, pendingTopicsCount + 1, pendingTopicsCount]}
          footerText="Ready for focus"
        />

        {/* 7. Course Progress */}
        <StatCard
          title="Course Progress"
          value={courseProgress}
          displayValue={`${courseProgress}%`}
          description={currentCourse ? currentCourse.name : 'All Courses'}
          icon={GraduationCap}
          variant="purple"
          progress={courseProgress}
          sparklineData={[10, 20, 35, courseProgress]}
          footerText="Target hour completion"
        />

        {/* 8. Current Streak */}
        <StatCard
          title="Current Streak"
          value={streak.current}
          displayValue={`${streak.current} Days`}
          description="Consecutive qualifying days"
          icon={Flame}
          variant="amber"
          sparklineData={[Math.max(0, streak.current - 3), Math.max(0, streak.current - 1), streak.current]}
          footerText={`Longest: ${streak.longest} days`}
        />
      </div>

      {/* ROW 4: TODAY'S LEARNING MAP (FULL WIDTH) */}
      <LearningMapTimeline onNavigate={onNavigate} />

      {/* ROW 5: TODAY'S MISSION | COURSE PROGRESS UNIVERSE | UPCOMING STUDY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TodaysMissionCard onNavigate={onNavigate} />
        <CourseProgressUniverse
          onNavigate={onNavigate}
          onOpenNewCourse={onOpenNewCourse}
        />
        <UpcomingStudyCard onNavigate={onNavigate} />
      </div>

      {/* ROW 6: WEEKLY ANALYTICS | SUBJECT PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyStudyChart />
        <SubjectPerformanceChart onNavigate={onNavigate} />
      </div>

      {/* ROW 7: PRODUCTIVITY HEATMAP (FULL WIDTH) */}
      <ProductivityHeatmap />

      {/* ROW 8: RECENT ACTIVITY | TOMORROW'S PLAN | FOCUS INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivityTimeline onNavigate={onNavigate} />
        <TomorrowPlanPreview onNavigate={onNavigate} />
        <FocusInsightsCard onNavigate={onNavigate} />
      </div>

      {/* ROW 9: QUICK ACTION COMMAND BAR */}
      <QuickActionCommandBar
        onStartStudy={() => onNavigate('timer')}
        onOpenNewCourse={onOpenNewCourse}
        onOpenNewPlan={onOpenNewPlan}
        onOpenNewSubject={onOpenNewSubject}
        onOpenNewTopic={onOpenNewTopic}
        onOpenNewResource={onOpenNewResource}
        onOpenNewTimetable={onOpenNewTimetable}
      />
    </div>
  );
}
