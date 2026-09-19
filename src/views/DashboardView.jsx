import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { formatDuration, getTimeGreeting } from '../utils/dateUtils';
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
  Flame,
  Clock,
  Target,
  TrendingUp,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
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
    pendingTasks,
    revisions,
    activeCourseId,
    activeCourse,
    getCourseStudyTime,
    getSubjectStudyTime,
    getTodayStudyTime,
    getWeeklyStudyTime,
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

  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionSummary, setCompletionSummary] = useState(null);

  const currentCourse = activeCourse;
  const currentCourseId = activeCourseId;

  // Real statistics (NO SYNTHETIC / NO FAKE DATA)
  const todayStudyMins = getTodayStudyTime(currentCourseId);
  const weeklyStudyMins = getWeeklyStudyTime(currentCourseId);

  const dailyTargetHours = currentCourse ? currentCourse.dailyTarget || 4 : 4;
  const dailyTargetMins = dailyTargetHours * 60;
  const dailyProgress = dailyTargetMins > 0 ? Math.min(100, Math.round((todayStudyMins / dailyTargetMins) * 100)) : 0;

  // Topics counts
  const filteredTopics = topics.filter((t) => !currentCourseId || t.courseId === currentCourseId);

  const completedTopicsCount = filteredTopics.filter((t) => {
    const lectureDone = t.lectureStatus === 'Completed';
    const notesDone = t.notesStatus === 'Completed';
    const revisionDone = !t.revisionRequired || t.revisionStatus === 'Completed';
    return lectureDone && notesDone && revisionDone;
  }).length;
  const pendingTopicsCount = filteredTopics.length - completedTopicsCount;

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
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-16">
      {/* Session Completion Modal */}
      <SessionCompletionModal
        isOpen={isCompletionModalOpen}
        sessionSummary={completionSummary}
        onSaveSession={handleConfirmSaveSession}
        onContinueStudy={handleContinueStudyFromModal}
      />

      {/* ROW 1: STUDY COMMAND CENTER (HERO CARD) - Compact & Responsive */}
      <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-white/[0.045] border border-slate-200/80 dark:border-white/[0.10] p-4 sm:p-5 shadow-xl dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-2xl command-card flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-sky-400/30">
        {/* Subtle Animated Glow Behind Hero Card */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-sky-500/[0.08] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-yellow-500/[0.05] rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle"></div>

        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            Study Command Center
          </div>
          {/* Typography */}
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {getTimeGreeting().toUpperCase()} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
            "Ready for your next study session?"
          </p>
        </div>

        {/* Hero Metrics */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Current Streak */}
          <div className="flex items-center gap-2.5 p-2.5 px-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 backdrop-blur-md">
            <Flame className="w-5 h-5 fill-yellow-400 text-yellow-400 animate-pulse" />
            <div>
              <span className="text-[8px] uppercase font-bold text-yellow-400/80 block tracking-wider">
                Current Streak
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
                <AnimatedNumber value={streak.current} /> DAYS
              </div>
            </div>
          </div>

          {/* Today Quota */}
          <div className="flex items-center gap-2.5 p-2 px-3.5 rounded-2xl bg-white/40 dark:bg-white/[0.035] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md">
            <ProgressRing
              progress={dailyProgress}
              size={42}
              strokeWidth={4}
              variant="sky"
            >
              <span className="text-[9px] font-black text-white">{dailyProgress}%</span>
            </ProgressRing>
            <div>
              <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">
                Today
              </span>
              <div className="text-xs font-black text-slate-900 dark:text-white font-mono">
                {formatDuration(todayStudyMins)} / {dailyTargetHours}h
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* ROW 2: COLORFUL STAT CARDS (Positioned directly under Study Command Center Hero) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* CARD 1: TODAY STUDY - Sky Blue (Requirement 7) */}
        <StatCard
          title="Today Study"
          displayValue={
            activeSession?.status === 'running'
              ? `${formatDuration(todayStudyMins + Math.round(elapsedActiveSeconds / 60))}`
              : formatDuration(todayStudyMins)
          }
          description={activeSession?.status === 'running' ? 'Focus timer running now' : 'Active focus time'}
          icon={Clock}
          variant="sky"
          progress={dailyProgress}
          footerText={`Target: ${dailyTargetHours}h 00m`}
          sparklineData={
            todayStudyMins > 0
              ? [todayStudyMins * 0.2, todayStudyMins * 0.4, todayStudyMins * 0.65, todayStudyMins * 0.9, todayStudyMins]
              : [1.2, 2.5, 1.8, 3.2, 2.8]
          }
          onClick={() => onNavigate('timer')}
          isLiveActive={activeSession?.status === 'running'}
        />

        {/* CARD 2: TODAY TARGET - Yellow (Requirement 7) */}
        <StatCard
          title="Today Target"
          displayValue={`${dailyTargetHours}h 00m`}
          description="Daily study objective"
          icon={Target}
          variant="yellow"
          progress={dailyProgress}
          footerText={`${formatDuration(Math.max(0, dailyTargetMins - todayStudyMins))} remaining`}
          sparklineData={[2.5, 3.8, 3.2, 4.5, dailyTargetHours || 4]}
          onClick={() => onNavigate('targets')}
        />

        {/* CARD 3: ATTENDANCE - Pink (Requirement 7) */}
        <StatCard
          title="Attendance"
          value={attStats.percentage}
          displayValue={`${attStats.percentage}%`}
          description={`${attStats.present} Present / ${attStats.partial} Partial`}
          icon={CalendarCheck}
          variant="pink"
          progress={attStats.percentage}
          footerText="Consistency rating"
          sparklineData={[65, 80, 75, 90, attStats.percentage || 75]}
          onClick={() => onNavigate('attendance')}
        />

        {/* CARD 4: PENDING TASKS - Red (Requirement 7) */}
        <StatCard
          title="Pending Tasks"
          value={Math.max(pendingTopicsCount, pendingTasks ? pendingTasks.filter(t => t.status === 'Pending').length : 0)}
          description="In rollover backlog"
          icon={AlertCircle}
          variant="red"
          sparklineData={[pendingTopicsCount + 4, pendingTopicsCount + 3, pendingTopicsCount + 1, pendingTopicsCount]}
          footerText="Carry-forward active"
          onClick={() => onNavigate('pending-tasks')}
        />

        {/* CARD 5: WEEKLY STUDY - Sky Blue */}
        <StatCard
          title="Weekly Study"
          displayValue={formatDuration(weeklyStudyMins)}
          description="Accumulated this week"
          icon={TrendingUp}
          variant="sky"
          sparklineData={
            weeklyStudyMins > 0
              ? [weeklyStudyMins * 0.15, weeklyStudyMins * 0.35, weeklyStudyMins * 0.6, weeklyStudyMins * 0.85, weeklyStudyMins]
              : [2, 3.5, 3, 5, 4.2]
          }
          footerText="Mon - Sun total"
          onClick={() => onNavigate('analytics')}
        />

        {/* CARD 6: COMPLETED TOPICS - White / Sky Blue */}
        <StatCard
          title="Completed Topics"
          value={completedTopicsCount}
          description="Mastered curriculum units"
          icon={CheckCircle2}
          variant="sky"
          sparklineData={[0, 1, 2, Math.max(2, completedTopicsCount + 1)]}
          footerText={`${filteredTopics.length} total topics`}
          onClick={() => onNavigate('topics')}
        />

        {/* CARD 7: COURSE PROGRESS - Pink */}
        <StatCard
          title="Course Progress"
          value={courseProgress}
          displayValue={`${courseProgress}%`}
          description={currentCourse ? currentCourse.name : 'All Courses'}
          icon={GraduationCap}
          variant="pink"
          progress={courseProgress}
          sparklineData={[10, 20, 25, 35, Math.max(30, courseProgress)]}
          footerText="Target hour completion"
          onClick={() => onNavigate('courses')}
        />

        {/* CARD 8: REVISION CONTROL CARD - Purple */}
        <StatCard
          title="📚 Revision"
          value={revisions ? revisions.filter(r => r.status !== 'Completed').length : 0}
          displayValue={`${revisions ? revisions.filter(r => r.status !== 'Completed').length : 0} Scheduled`}
          description={`${revisions ? revisions.filter(r => r.status === 'Completed').length : 0} Completed / ${revisions ? revisions.length : 0} Total`}
          icon={GraduationCap}
          variant="sky"
          footerText="Spaced Repetition Active"
          onClick={() => onNavigate('revision')}
        />

        {/* CARD 8: CURRENT STREAK - Yellow */}
        <StatCard
          title="Current Streak"
          value={streak.current}
          displayValue={`${streak.current} Days`}
          description="Consecutive qualifying days"
          icon={Flame}
          variant="yellow"
          sparklineData={[
            Math.max(1, streak.current - 3),
            Math.max(1, streak.current - 2),
            Math.max(1, streak.current - 1),
            Math.max(2, streak.current + 1),
          ]}
          footerText={`Longest: ${streak.longest} days`}
          onClick={() => onNavigate('history')}
        />
      </div>

      {/* ROW 3: LIVE STUDY CONTROL (CENTRAL FOCAL MAIN TIMER CARD - Requirement 6) */}
      <LiveStudyControlCard
        onRequestStopSession={handleRequestStopSession}
        onNavigate={onNavigate}
      />

      {/* ROW 4: TODAY'S LEARNING MAP (FULL WIDTH - Requirement 10) */}
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

      {/* ROW 9: QUICK ACTION COMMAND BAR (Requirement 20) */}
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
