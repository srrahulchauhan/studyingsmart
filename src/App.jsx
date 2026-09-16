import React, { useState, useEffect } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { TimerProvider, useTimer } from './context/TimerContext';

// Layout & Global Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import GlobalSearchModal from './components/common/GlobalSearchModal';
import QuickActionsModal from './components/common/QuickActionsModal';
import CommandPaletteModal from './components/common/CommandPaletteModal';
import FloatingStudyButton from './components/common/FloatingStudyButton';
import QuickAddFAB from './components/common/QuickAddFAB';

// Modals
import CourseModal from './components/modals/CourseModal';
import StudyPlanModal from './components/modals/StudyPlanModal';
import SubjectModal from './components/modals/SubjectModal';
import TopicModal from './components/modals/TopicModal';
import ResourceModal from './components/modals/ResourceModal';
import TimetableModal from './components/modals/TimetableModal';
import TargetGoalModal from './components/modals/TargetGoalModal';

// Views
import DashboardView from './views/DashboardView';
import CourseManagementView from './views/CourseManagementView';
import StudyPlanView from './views/StudyPlanView';
import SubjectTopicView from './views/SubjectTopicView';
import ResourceManagementView from './views/ResourceManagementView';
import StudyTimerView from './views/StudyTimerView';
import FocusModeView from './views/FocusModeView';
import TimetableBuilderView from './views/TimetableBuilderView';
import AttendanceView from './views/AttendanceView';
import CalendarView from './views/CalendarView';
import TargetsGoalsView from './views/TargetsGoalsView';
import StudyHistoryView from './views/StudyHistoryView';
import AnalyticsView from './views/AnalyticsView';
import ReportsExportView from './views/ReportsExportView';
import SettingsView from './views/SettingsView';

function MainLayout() {
  const {
    activeCourseId,
    addCourse,
    addStudyPlan,
    addSubject,
    addTopic,
    addResource,
    addTimetableSlot,
    addTarget,
    addGoal,
  } = useStudy();

  const { isFocusMode, setIsFocusMode } = useTimer();

  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Dialog states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Global keyboard shortcuts (Ctrl+K, Cmd+K, Alt+C, Alt+B, Alt+T, Alt+R, Alt+M)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K / Cmd+K -> Toggle Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Alt+C -> New Course
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsCourseModalOpen(true);
        return;
      }

      // Alt+B -> New Subject
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSubjectModalOpen(true);
        return;
      }

      // Alt+T -> New Topic
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTopicModalOpen(true);
        return;
      }

      // Alt+R -> New Resource
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsResourceModalOpen(true);
        return;
      }

      // Alt+M -> New Timetable
      if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsTimetableModalOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation handler
  const handleNavigate = (viewId, modalTrigger = null) => {
    if (modalTrigger === 'search') {
      setIsSearchOpen(true);
      return;
    }
    if (viewId === 'focus') {
      setIsFocusMode(true);
      return;
    }
    if (viewId) {
      setCurrentView(viewId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // If in distraction-free Focus Mode, render only FocusModeView
  if (isFocusMode) {
    return <FocusModeView onExitFocus={() => setIsFocusMode(false)} />;
  }

  return (
    <div className="min-h-screen command-center-light-bg dark:command-center-bg text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        onOpenQuickActions={() => setIsQuickActionsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onNavigate={handleNavigate}
        onOpenNewCourseModal={() => setIsCourseModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
            <DashboardView
              onOpenNewCourse={() => setIsCourseModalOpen(true)}
              onOpenNewPlan={() => setIsPlanModalOpen(true)}
              onOpenNewSubject={() => setIsSubjectModalOpen(true)}
              onOpenNewTopic={() => setIsTopicModalOpen(true)}
              onOpenNewResource={() => setIsResourceModalOpen(true)}
              onOpenNewTimetable={() => setIsTimetableModalOpen(true)}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'courses' && (
            <CourseManagementView
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'plans' && (
            <StudyPlanView
              onNavigate={handleNavigate}
            />
          )}

          {(currentView === 'subjects' || currentView === 'topics') && (
            <SubjectTopicView
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'resources' && (
            <ResourceManagementView />
          )}

          {currentView === 'timer' && (
            <StudyTimerView
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'timetable' && (
            <TimetableBuilderView
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView />
          )}

          {currentView === 'attendance' && (
            <AttendanceView />
          )}

          {(currentView === 'targets' || currentView === 'goals') && (
            <TargetsGoalsView />
          )}

          {currentView === 'history' && (
            <StudyHistoryView
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'reports' && (
            <ReportsExportView />
          )}

          {(currentView === 'settings' || currentView === 'backup') && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Animated Floating Plus Action Button with Feature Add Speed-Dial */}
      <QuickAddFAB
        onOpenNewCourse={() => setIsCourseModalOpen(true)}
        onOpenNewPlan={() => setIsPlanModalOpen(true)}
        onOpenNewSubject={() => setIsSubjectModalOpen(true)}
        onOpenNewTopic={() => setIsTopicModalOpen(true)}
        onOpenNewResource={() => setIsResourceModalOpen(true)}
        onOpenNewTimetable={() => setIsTimetableModalOpen(true)}
        onOpenNewTarget={() => setIsTargetModalOpen(true)}
        onStartStudy={() => handleNavigate('timer')}
      />

      {/* Mobile Bottom Navigation Bar & Drawer */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onStartStudy={() => handleNavigate('timer')}
        onOpenNewCourse={() => setIsCourseModalOpen(true)}
        onOpenNewSubject={() => setIsSubjectModalOpen(true)}
        onOpenNewTopic={() => setIsTopicModalOpen(true)}
        onOpenNewResource={() => setIsResourceModalOpen(true)}
        onOpenNewTimetable={() => setIsTimetableModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Quick Actions Modal */}
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onOpenNewCourse={() => setIsCourseModalOpen(true)}
        onOpenNewPlan={() => setIsPlanModalOpen(true)}
        onOpenNewSubject={() => setIsSubjectModalOpen(true)}
        onOpenNewTopic={() => setIsTopicModalOpen(true)}
        onOpenNewResource={() => setIsResourceModalOpen(true)}
        onOpenNewTimetable={() => setIsTimetableModalOpen(true)}
        onOpenNewTarget={() => setIsTargetModalOpen(true)}
        onOpenNewGoal={() => setIsGoalModalOpen(true)}
        onStartStudy={() => handleNavigate('timer')}
      />

      {/* Individual Creation Modals */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onSave={addCourse}
        onClose={() => setIsCourseModalOpen(false)}
      />

      <StudyPlanModal
        isOpen={isPlanModalOpen}
        courseId={activeCourseId}
        onSave={addStudyPlan}
        onClose={() => setIsPlanModalOpen(false)}
      />

      <SubjectModal
        isOpen={isSubjectModalOpen}
        courseId={activeCourseId}
        onSave={addSubject}
        onClose={() => setIsSubjectModalOpen(false)}
      />

      <TopicModal
        isOpen={isTopicModalOpen}
        courseId={activeCourseId}
        onSave={addTopic}
        onClose={() => setIsTopicModalOpen(false)}
      />

      <ResourceModal
        isOpen={isResourceModalOpen}
        courseId={activeCourseId}
        onSave={addResource}
        onClose={() => setIsResourceModalOpen(false)}
      />

      <TimetableModal
        isOpen={isTimetableModalOpen}
        courseId={activeCourseId}
        onSave={addTimetableSlot}
        onClose={() => setIsTimetableModalOpen(false)}
      />

      <TargetGoalModal
        isOpen={isTargetModalOpen}
        mode="target"
        courseId={activeCourseId}
        onSave={(data) => addTarget(data)}
        onClose={() => setIsTargetModalOpen(false)}
      />

      <TargetGoalModal
        isOpen={isGoalModalOpen}
        mode="goal"
        courseId={activeCourseId}
        onSave={(data) => addGoal(data)}
        onClose={() => setIsGoalModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <TimerProvider>
        <MainLayout />
      </TimerProvider>
    </StudyProvider>
  );
}
