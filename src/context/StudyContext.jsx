import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  loadFromStorage,
  saveToStorage,
  exportBackupJSON,
  validateAndImportBackupJSON,
  resetAllStorageData,
} from '../utils/storage';
import { getTodayDateString, isToday } from '../utils/dateUtils';

const StudyContext = createContext(null);

export function StudyProvider({ children }) {
  // CRITICAL: Fresh user zero-data initialization.
  const [courses, setCourses] = useState(() => loadFromStorage(STORAGE_KEYS.COURSES, []));
  const [studyPlans, setStudyPlans] = useState(() => loadFromStorage(STORAGE_KEYS.STUDY_PLANS, []));
  const [subjects, setSubjects] = useState(() => loadFromStorage(STORAGE_KEYS.SUBJECTS, []));
  const [topics, setTopics] = useState(() => {
    const raw = loadFromStorage(STORAGE_KEYS.TOPICS, []);
    return raw.map(t => {
      const isComp = t.status === 'Completed';
      const lectureStatus = t.lectureStatus || (isComp ? 'Completed' : 'Pending');
      const notesStatus = t.notesStatus || (isComp ? 'Completed' : 'Pending');
      const revisionStatus = t.revisionStatus || (isComp ? 'Completed' : 'Pending');
      const revisionRequired = t.revisionRequired ?? true;
      const isFullComp = lectureStatus === 'Completed' && notesStatus === 'Completed' && (!revisionRequired || revisionStatus === 'Completed');
      return {
        ...t,
        lectureStatus,
        notesStatus,
        revisionStatus,
        revisionRequired,
        status: isFullComp ? 'Completed' : 'Pending',
      };
    });
  });
  const [resources, setResources] = useState(() => loadFromStorage(STORAGE_KEYS.RESOURCES, []));
  const [timetable, setTimetable] = useState(() => loadFromStorage(STORAGE_KEYS.TIMETABLE, []));
  const [studySessions, setStudySessions] = useState(() => loadFromStorage(STORAGE_KEYS.STUDY_SESSIONS, []));
  const [attendance, setAttendance] = useState(() => loadFromStorage(STORAGE_KEYS.ATTENDANCE, []));
  const [targets, setTargets] = useState(() => loadFromStorage(STORAGE_KEYS.TARGETS, []));
  const [goals, setGoals] = useState(() => loadFromStorage(STORAGE_KEYS.GOALS, []));
  const [pendingTasks, setPendingTasks] = useState(() => loadFromStorage(STORAGE_KEYS.PENDING_TASKS, []));
  const [revisions, setRevisions] = useState(() => loadFromStorage(STORAGE_KEYS.REVISIONS, []));
  const [notifications, setNotifications] = useState(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []));
  const [settings, setSettings] = useState(() => loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS));
  const [activeCourseId, setActiveCourseId] = useState(() => loadFromStorage(STORAGE_KEYS.ACTIVE_COURSE_ID, null));

  // Auto-sync activeCourseId if current active course was deleted
  useEffect(() => {
    if (activeCourseId && !courses.some(c => c.id === activeCourseId)) {
      setActiveCourseId(courses.length > 0 ? courses[0].id : null);
    }
  }, [courses, activeCourseId]);

  // Persist state changes
  useEffect(() => saveToStorage(STORAGE_KEYS.COURSES, courses), [courses]);
  useEffect(() => saveToStorage(STORAGE_KEYS.STUDY_PLANS, studyPlans), [studyPlans]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SUBJECTS, subjects), [subjects]);
  useEffect(() => saveToStorage(STORAGE_KEYS.TOPICS, topics), [topics]);
  useEffect(() => saveToStorage(STORAGE_KEYS.RESOURCES, resources), [resources]);
  useEffect(() => saveToStorage(STORAGE_KEYS.TIMETABLE, timetable), [timetable]);
  useEffect(() => saveToStorage(STORAGE_KEYS.STUDY_SESSIONS, studySessions), [studySessions]);
  useEffect(() => saveToStorage(STORAGE_KEYS.ATTENDANCE, attendance), [attendance]);
  useEffect(() => saveToStorage(STORAGE_KEYS.TARGETS, targets), [targets]);
  useEffect(() => saveToStorage(STORAGE_KEYS.GOALS, goals), [goals]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PENDING_TASKS, pendingTasks), [pendingTasks]);
  useEffect(() => saveToStorage(STORAGE_KEYS.REVISIONS, revisions), [revisions]);
  useEffect(() => saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications), [notifications]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SETTINGS, settings), [settings]);
  useEffect(() => saveToStorage(STORAGE_KEYS.ACTIVE_COURSE_ID, activeCourseId), [activeCourseId]);

  // Apply dark mode class to document element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Active course object
  const activeCourse = useMemo(() => {
    if (!activeCourseId) return null;
    return courses.find(c => c.id === activeCourseId) || null;
  }, [courses, activeCourseId]);

  // --- NOTIFICATIONS ---
  const addNotification = useCallback(({ title, message, type = 'info' }) => {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      time: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]); // Keep last 50
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // --- CRUD: COURSES ---
  const addCourse = useCallback((courseData) => {
    const newCourse = {
      id: `course_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: courseData.name.trim(),
      description: courseData.description || '',
      purpose: courseData.purpose || '',
      category: courseData.category || 'General',
      startDate: courseData.startDate || getTodayDateString(),
      targetDate: courseData.targetDate || '',
      dailyTarget: Number(courseData.dailyTarget) || 0,
      weeklyTarget: Number(courseData.weeklyTarget) || 0,
      totalTargetHours: Number(courseData.totalTargetHours) || 0,
      priority: courseData.priority || 'Medium',
      status: courseData.status || 'In Progress',
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    setCourses(prev => [...prev, newCourse]);
    // If first course, set as active
    setActiveCourseId(prev => (prev ? prev : newCourse.id));

    // Optional notification
    addNotification({
      title: 'Course Created',
      message: `Course "${newCourse.name}" has been created successfully.`,
      type: 'info',
    });

    return newCourse;
  }, []);

  const updateCourse = useCallback((id, updates) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCourse = useCallback((id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    // Cascade cleanup or decouple
    setStudyPlans(prev => prev.filter(p => p.courseId !== id));
    setSubjects(prev => prev.filter(s => s.courseId !== id));
    setTopics(prev => prev.filter(t => t.courseId !== id));
    setResources(prev => prev.filter(r => r.courseId !== id));
    setTimetable(prev => prev.filter(tt => tt.courseId !== id));
    setStudySessions(prev => prev.filter(s => s.courseId !== id));
    setAttendance(prev => prev.filter(a => a.courseId !== id));
    setTargets(prev => prev.filter(t => t.courseId !== id));
    setGoals(prev => prev.filter(g => g.courseId !== id));

    if (activeCourseId === id) {
      const remaining = courses.filter(c => c.id !== id);
      setActiveCourseId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [activeCourseId, courses]);

  const archiveCourse = useCallback((id) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isArchived: true, status: 'Paused' } : c));
  }, []);

  const restoreCourse = useCallback((id) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isArchived: false, status: 'In Progress' } : c));
  }, []);

  const duplicateCourse = useCallback((courseId, options = { copySubjects: true, copyTopics: true, copyResources: true, copyTimetable: true, copyTargets: true }) => {
    const original = courses.find(c => c.id === courseId);
    if (!original) return null;

    const newCourseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const duplicatedCourse = {
      ...original,
      id: newCourseId,
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      isArchived: false,
    };

    setCourses(prev => [...prev, duplicatedCourse]);

    // Copy study plans
    const originalPlans = studyPlans.filter(p => p.courseId === courseId);
    const planIdMap = {};
    const newPlans = originalPlans.map(p => {
      const newPlanId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      planIdMap[p.id] = newPlanId;
      return { ...p, id: newPlanId, courseId: newCourseId };
    });
    if (newPlans.length) setStudyPlans(prev => [...prev, ...newPlans]);

    // Copy subjects & topics
    if (options.copySubjects) {
      const originalSubjects = subjects.filter(s => s.courseId === courseId);
      const subjIdMap = {};
      const newSubjs = originalSubjects.map(s => {
        const newSubjId = `subj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        subjIdMap[s.id] = newSubjId;
        return {
          ...s,
          id: newSubjId,
          courseId: newCourseId,
          studyPlanId: planIdMap[s.studyPlanId] || null,
        };
      });
      setSubjects(prev => [...prev, ...newSubjs]);

      if (options.copyTopics) {
        const originalTopics = topics.filter(t => t.courseId === courseId);
        const topicIdMap = {};
        const newTopics = originalTopics.map(t => {
          const newTopicId = `topic_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          topicIdMap[t.id] = newTopicId;
          return {
            ...t,
            id: newTopicId,
            courseId: newCourseId,
            studyPlanId: planIdMap[t.studyPlanId] || null,
            subjectId: subjIdMap[t.subjectId] || null,
            status: 'Pending', // reset progress
          };
        });
        setTopics(prev => [...prev, ...newTopics]);

        if (options.copyResources) {
          const originalResources = resources.filter(r => r.courseId === courseId);
          const newResources = originalResources.map(r => ({
            ...r,
            id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            courseId: newCourseId,
            studyPlanId: planIdMap[r.studyPlanId] || null,
            subjectId: subjIdMap[r.subjectId] || null,
            topicId: topicIdMap[r.topicId] || null,
            status: 'Not Started',
          }));
          setResources(prev => [...prev, ...newResources]);
        }
      }
    }

    // Copy timetable
    if (options.copyTimetable) {
      const originalTimetable = timetable.filter(tt => tt.courseId === courseId);
      const newTimetable = originalTimetable.map(tt => ({
        ...tt,
        id: `tt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        courseId: newCourseId,
        studyPlanId: planIdMap[tt.studyPlanId] || null,
      }));
      setTimetable(prev => [...prev, ...newTimetable]);
    }

    // Copy targets
    if (options.copyTargets) {
      const originalTargets = targets.filter(t => t.courseId === courseId);
      const newTargets = originalTargets.map(t => ({
        ...t,
        id: `tgt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        courseId: newCourseId,
      }));
      setTargets(prev => [...prev, ...newTargets]);
    }

    return duplicatedCourse;
  }, [courses, studyPlans, subjects, topics, resources, timetable, targets]);

  // --- CRUD: STUDY PLANS ---
  const addStudyPlan = useCallback((planData) => {
    const newPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      courseId: planData.courseId || activeCourseId,
      name: planData.name.trim(),
      description: planData.description || '',
      startDate: planData.startDate || getTodayDateString(),
      endDate: planData.endDate || '',
      dailyTarget: Number(planData.dailyTarget) || 0,
      weeklyTarget: Number(planData.weeklyTarget) || 0,
      totalTargetHours: Number(planData.totalTargetHours) || 0,
      studyDays: planData.studyDays || 'All',
      priority: planData.priority || 'Medium',
      status: planData.status || 'In Progress',
      createdAt: new Date().toISOString(),
    };
    setStudyPlans(prev => [...prev, newPlan]);
    return newPlan;
  }, [activeCourseId]);

  const updateStudyPlan = useCallback((id, updates) => {
    setStudyPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteStudyPlan = useCallback((id) => {
    setStudyPlans(prev => prev.filter(p => p.id !== id));
    // Cascade
    setSubjects(prev => prev.filter(s => s.studyPlanId !== id));
    setTopics(prev => prev.filter(t => t.studyPlanId !== id));
  }, []);

  // --- CRUD: SUBJECTS ---
  const addSubject = useCallback((subjectData) => {
    const newSubject = {
      id: `subj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      courseId: subjectData.courseId || activeCourseId,
      studyPlanId: subjectData.studyPlanId || null,
      name: subjectData.name.trim(),
      description: subjectData.description || '',
      purpose: subjectData.purpose || '',
      targetDate: subjectData.targetDate || '',
      targetHours: Number(subjectData.targetHours) || 0,
      dailyTargetHours: Number(subjectData.dailyTargetHours) || 0,
      priority: subjectData.priority || 'Medium',
      status: subjectData.status || 'In Progress',
      createdAt: new Date().toISOString(),
    };
    setSubjects(prev => [...prev, newSubject]);
    return newSubject;
  }, [activeCourseId]);

  const updateSubject = useCallback((id, updates) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSubject = useCallback((id) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    // Cascade
    setTopics(prev => prev.filter(t => t.subjectId !== id));
    setResources(prev => prev.filter(r => r.subjectId !== id));
  }, []);

  // Helper to check full topic completion status
  const checkTopicCompletion = (t) => {
    const lectureDone = t.lectureStatus === 'Completed';
    const notesDone = t.notesStatus === 'Completed';
    const revisionDone = !t.revisionRequired || t.revisionStatus === 'Completed';
    return lectureDone && notesDone && revisionDone;
  };

  // --- CRUD: TOPICS ---
  const addTopic = useCallback((topicData) => {
    const lectureStatus = topicData.lectureStatus || 'Pending';
    const notesStatus = topicData.notesStatus || 'Pending';
    const revisionStatus = topicData.revisionStatus || 'Pending';
    const revisionRequired = topicData.revisionRequired ?? true;

    const isComp = lectureStatus === 'Completed' && notesStatus === 'Completed' && (!revisionRequired || revisionStatus === 'Completed');

    const newTopic = {
      id: `topic_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      courseId: topicData.courseId || activeCourseId,
      studyPlanId: topicData.studyPlanId || null,
      subjectId: topicData.subjectId,
      name: topicData.name.trim(),
      description: topicData.description || '',
      estimatedMinutes: Number(topicData.estimatedMinutes) || 60,
      targetDate: topicData.targetDate || '',
      priority: topicData.priority || 'Medium',
      lectureStatus,
      notesStatus,
      revisionStatus,
      revisionRequired,
      sourceUrl: topicData.sourceUrl || topicData.videoUrl || '',
      videoUrl: topicData.videoUrl || topicData.sourceUrl || '',
      status: isComp ? 'Completed' : 'Pending',
      createdAt: new Date().toISOString(),
    };
    setTopics(prev => [...prev, newTopic]);
    return newTopic;
  }, [activeCourseId]);

  const updateTopic = useCallback((id, updates) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        const isComp = checkTopicCompletion(updated);
        return { ...updated, status: isComp ? 'Completed' : 'Pending' };
      }
      return t;
    }));
  }, []);

  const updateTopicSubTask = useCallback((id, taskType, newStatus = null) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        let lectureStatus = t.lectureStatus || 'Pending';
        let notesStatus = t.notesStatus || 'Pending';
        let revisionStatus = t.revisionStatus || 'Pending';

        if (taskType === 'lecture') {
          lectureStatus = newStatus || (lectureStatus === 'Completed' ? 'Pending' : 'Completed');
        } else if (taskType === 'notes') {
          notesStatus = newStatus || (notesStatus === 'Completed' ? 'Pending' : 'Completed');
        } else if (taskType === 'revision') {
          revisionStatus = newStatus || (revisionStatus === 'Completed' ? 'Pending' : 'Completed');
        }

        const updated = { ...t, lectureStatus, notesStatus, revisionStatus };
        const isComp = checkTopicCompletion(updated);
        return { ...updated, status: isComp ? 'Completed' : 'Pending' };
      }
      return t;
    }));
  }, []);

  const toggleTopicRevisionRequired = useCallback((id, isRequired = null) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        const revisionRequired = isRequired !== null ? isRequired : !t.revisionRequired;
        const updated = { ...t, revisionRequired };
        const isComp = checkTopicCompletion(updated);
        return { ...updated, status: isComp ? 'Completed' : 'Pending' };
      }
      return t;
    }));
  }, []);

  const deleteTopic = useCallback((id) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    setResources(prev => prev.filter(r => r.topicId !== id));
  }, []);

  const toggleTopicComplete = useCallback((id) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        const currentlyComplete = checkTopicCompletion(t);
        const targetStatus = currentlyComplete ? 'Pending' : 'Completed';
        const updated = {
          ...t,
          lectureStatus: targetStatus,
          notesStatus: targetStatus,
          revisionStatus: targetStatus,
          status: targetStatus,
        };
        return updated;
      }
      return t;
    }));
  }, []);

  // --- CRUD: RESOURCES ---
  const addResource = useCallback((resourceData) => {
    const newResource = {
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      courseId: resourceData.courseId || activeCourseId,
      studyPlanId: resourceData.studyPlanId || null,
      subjectId: resourceData.subjectId || null,
      topicId: resourceData.topicId || null,
      name: resourceData.name.trim(),
      url: resourceData.url || '',
      type: resourceData.type || 'Website', // 'YouTube' | 'Documentation' | 'Article' | 'GitHub' | 'ChatGPT' | 'PDF' | 'Notes' | 'Other'
      description: resourceData.description || '',
      tags: resourceData.tags || [],
      priority: resourceData.priority || 'Medium',
      status: resourceData.status || 'Not Started',
      addedDate: getTodayDateString(),
    };
    setResources(prev => [...prev, newResource]);
    return newResource;
  }, [activeCourseId]);

  const updateResource = useCallback((id, updates) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteResource = useCallback((id) => {
    setResources(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleResourceComplete = useCallback((id) => {
    setResources(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: r.status === 'Completed' ? 'Not Started' : 'Completed' };
      }
      return r;
    }));
  }, []);

  // --- CRUD: TIMETABLE ---
  const addTimetableSlot = useCallback((slotData) => {
    const newSlot = {
      id: `tt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      courseId: slotData.courseId || activeCourseId,
      studyPlanId: slotData.studyPlanId || null,
      subjectId: slotData.subjectId || null,
      topicId: slotData.topicId || null,
      day: slotData.day || 'Monday',
      startTime: slotData.startTime || '09:00',
      endTime: slotData.endTime || '10:30',
      targetDuration: Number(slotData.targetDuration) || 90, // in minutes
      repeat: slotData.repeat || 'None', // 'None' | '1 Day' | '3 Days' | '7 Days' | '15 Days' | '30 Days'
      priority: slotData.priority || 'Medium',
    };
    setTimetable(prev => [...prev, newSlot]);
    return newSlot;
  }, [activeCourseId]);

  const updateTimetableSlot = useCallback((id, updates) => {
    setTimetable(prev => prev.map(tt => tt.id === id ? { ...tt, ...updates } : tt));
  }, []);

  const deleteTimetableSlot = useCallback((id) => {
    setTimetable(prev => prev.filter(tt => tt.id !== id));
  }, []);

  // --- STUDY SESSIONS & AUTOMATIC ATTENDANCE UPDATE ---
  const addStudySession = useCallback((sessionData) => {
    const newSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      courseId: sessionData.courseId,
      studyPlanId: sessionData.studyPlanId || null,
      subjectId: sessionData.subjectId || null,
      topicId: sessionData.topicId || null,
      date: sessionData.date || getTodayDateString(),
      startTime: sessionData.startTime, // ISO string
      endTime: sessionData.endTime,     // ISO string
      sessionDuration: Number(sessionData.sessionDuration) || 0, // minutes
      breakDuration: Number(sessionData.breakDuration) || 0,     // minutes
      actualStudyDuration: Number(sessionData.actualStudyDuration) || 0, // minutes
      status: sessionData.status || 'Completed',
      breaks: sessionData.breaks || [],
    };

    setStudySessions(prev => [newSession, ...prev]);

    // Automatic Attendance Evaluation
    const targetDate = newSession.date;
    const targetCourse = newSession.courseId;
    const minMins = settings.minStudyMinutesForAttendance || 30;

    // Recalculate daily total for that date & course including new session
    const existingDayMins = studySessions
      .filter(s => s.courseId === targetCourse && s.date === targetDate)
      .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
    const updatedDayMins = existingDayMins + newSession.actualStudyDuration;

    let autoStatus = 'Partial';
    if (updatedDayMins >= minMins) {
      autoStatus = 'Present';
    }

    setAttendance(prev => {
      const idx = prev.findIndex(a => a.courseId === targetCourse && a.date === targetDate);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          studyMinutes: updatedDayMins,
          status: autoStatus,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            courseId: targetCourse,
            studyPlanId: newSession.studyPlanId || null,
            subjectId: newSession.subjectId || null,
            date: targetDate,
            status: autoStatus,
            studyMinutes: updatedDayMins,
          },
        ];
      }
    });

    // Mark topic in-progress or completed if requested
    if (newSession.topicId) {
      setTopics(prev => prev.map(t => {
        if (t.id === newSession.topicId && t.status === 'Pending') {
          return { ...t, status: 'In Progress' };
        }
        return t;
      }));
    }

    return newSession;
  }, [studySessions, settings.minStudyMinutesForAttendance]);

  const updateStudySession = useCallback((id, updates) => {
    setStudySessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteStudySession = useCallback((id) => {
    setStudySessions(prev => prev.filter(s => s.id !== id));
  }, []);

  // --- CRUD: ATTENDANCE ---
  const updateAttendanceRecord = useCallback((id, updates) => {
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const setManualAttendance = useCallback((courseId, date, status, remarks = '') => {
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.courseId === courseId && a.date === date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], status, remarks };
        return next;
      } else {
        return [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            courseId,
            date,
            status,
            studyMinutes: 0,
            remarks,
          },
        ];
      }
    });
  }, []);

  // --- CRUD: TARGETS & GOALS ---
  const addTarget = useCallback((targetData) => {
    const newTarget = {
      id: `tgt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      courseId: targetData.courseId || activeCourseId,
      name: targetData.name || 'Daily Target',
      period: targetData.period || 'Daily', // 'Daily' | 'Weekly' | 'Monthly' | 'Tomorrow'
      targetHours: Number(targetData.targetHours) || 4,
      date: targetData.date || getTodayDateString(),
      topicId: targetData.topicId || null,
      subjectId: targetData.subjectId || null,
      status: 'Active',
    };
    setTargets(prev => [...prev, newTarget]);
    return newTarget;
  }, [activeCourseId]);

  const deleteTarget = useCallback((id) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  }, []);

  const addGoal = useCallback((goalData) => {
    const newGoal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      courseId: goalData.courseId || activeCourseId,
      studyPlanId: goalData.studyPlanId || null,
      name: goalData.name.trim(),
      targetDate: goalData.targetDate || '',
      targetHours: Number(goalData.targetHours) || 0,
      progress: 0,
      status: 'In Progress',
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  }, [activeCourseId]);

  const updateGoal = useCallback((id, updates) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  // --- PENDING TASKS AUTO-ROLLOVER & CRUD ---
  // Rule 3 & 4: Automatically rolls over any incomplete task/topic scheduled before today,
  // carries forward across Day 1 -> Day 2 -> Day 3... and NEVER auto-deletes until user completes it!
  // --- PENDING TASKS AUTO-ROLLOVER & CRUD ---
  // Automatically rolls over any incomplete topic, subject, or task into Pending Tasks,
  // carries forward across days, and NEVER auto-deletes until user explicitly completes it!
  useEffect(() => {
    const today = getTodayDateString();

    // 1. Auto-rollover Topics into individual sub-task pending cards
    topics.forEach((topic) => {
      const topicDate = topic.targetDate || (topic.createdAt ? topic.createdAt.split('T')[0] : null);
      if (topicDate ? topicDate <= today : true) {
        // Lecture Pending
        if (topic.lectureStatus === 'Pending') {
          setPendingTasks((prev) => {
            const taskId = `ptask_topic_lecture_${topic.id}`;
            if (!prev.some((pt) => pt.id === taskId)) {
              return [
                ...prev,
                {
                  id: taskId,
                  title: `🎥 Lecture: ${topic.name}`,
                  courseId: topic.courseId,
                  subjectId: topic.subjectId,
                  topicId: topic.id,
                  taskType: 'lecture',
                  originalDate: topicDate || today,
                  estimatedMinutes: Math.round((topic.estimatedMinutes || 60) * 0.4),
                  priority: topic.priority || 'Medium',
                  status: 'Pending',
                  completedAt: null,
                  source: 'topic',
                  createdAt: new Date().toISOString(),
                },
              ];
            }
            return prev;
          });
        } else {
          setPendingTasks((prev) => prev.map((pt) => (pt.id === `ptask_topic_lecture_${topic.id}` ? { ...pt, status: 'Completed' } : pt)));
        }

        // Notes Pending
        if (topic.notesStatus === 'Pending') {
          setPendingTasks((prev) => {
            const taskId = `ptask_topic_notes_${topic.id}`;
            if (!prev.some((pt) => pt.id === taskId)) {
              return [
                ...prev,
                {
                  id: taskId,
                  title: `📝 Notes: ${topic.name}`,
                  courseId: topic.courseId,
                  subjectId: topic.subjectId,
                  topicId: topic.id,
                  taskType: 'notes',
                  originalDate: topicDate || today,
                  estimatedMinutes: Math.round((topic.estimatedMinutes || 60) * 0.4),
                  priority: topic.priority || 'High',
                  status: 'Pending',
                  completedAt: null,
                  source: 'topic',
                  createdAt: new Date().toISOString(),
                },
              ];
            }
            return prev;
          });
        } else {
          setPendingTasks((prev) => prev.map((pt) => (pt.id === `ptask_topic_notes_${topic.id}` ? { ...pt, status: 'Completed' } : pt)));
        }

        // Revision Pending (only if revisionRequired is true)
        if (topic.revisionRequired && topic.revisionStatus === 'Pending') {
          setPendingTasks((prev) => {
            const taskId = `ptask_topic_revision_${topic.id}`;
            if (!prev.some((pt) => pt.id === taskId)) {
              return [
                ...prev,
                {
                  id: taskId,
                  title: `🔄 Revision: ${topic.name}`,
                  courseId: topic.courseId,
                  subjectId: topic.subjectId,
                  topicId: topic.id,
                  taskType: 'revision',
                  originalDate: topicDate || today,
                  estimatedMinutes: Math.round((topic.estimatedMinutes || 60) * 0.2),
                  priority: topic.priority || 'Medium',
                  status: 'Pending',
                  completedAt: null,
                  source: 'topic',
                  createdAt: new Date().toISOString(),
                },
              ];
            }
            return prev;
          });
        } else {
          setPendingTasks((prev) => prev.map((pt) => (pt.id === `ptask_topic_revision_${topic.id}` ? { ...pt, status: 'Completed' } : pt)));
        }
      }
    });

    // 2. Auto-rollover Subjects
    subjects.forEach((subject) => {
      const subjectDate = subject.targetDate || (subject.createdAt ? subject.createdAt.split('T')[0] : null);
      if (subject.status !== 'Completed' && (subjectDate ? subjectDate <= today : true)) {
        setPendingTasks((prev) => {
          const exists = prev.some((pt) => pt.subjectId === subject.id && pt.source === 'subject' || pt.id === `ptask_subj_${subject.id}`);
          if (!exists) {
            return [
              ...prev,
              {
                id: `ptask_subj_${subject.id}`,
                title: `Subject: ${subject.name}`,
                courseId: subject.courseId,
                subjectId: subject.id,
                topicId: null,
                originalDate: subjectDate || today,
                estimatedMinutes: (subject.targetHours || 2) * 60,
                priority: subject.priority || 'High',
                status: 'Pending',
                completedAt: null,
                source: 'subject',
                createdAt: new Date().toISOString(),
              },
            ];
          }
          return prev;
        });
      }
    });
  }, [topics, subjects]);

  const addPendingTask = useCallback((taskData) => {
    const today = getTodayDateString();
    const newTask = {
      id: `ptask_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: taskData.title.trim(),
      courseId: taskData.courseId || activeCourseId,
      subjectId: taskData.subjectId || null,
      topicId: taskData.topicId || null,
      taskType: taskData.taskType || null,
      originalDate: taskData.originalDate || today,
      estimatedMinutes: Number(taskData.estimatedMinutes) || 45,
      priority: taskData.priority || 'Medium',
      status: 'Pending',
      completedAt: null,
      source: taskData.source || 'manual',
      notes: taskData.notes || '',
      createdAt: new Date().toISOString(),
    };
    setPendingTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, [activeCourseId]);

  const updatePendingTask = useCallback((id, updates) => {
    setPendingTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const completePendingTask = useCallback((id) => {
    const completionISO = new Date().toISOString();
    const completionDateStr = getTodayDateString();

    setPendingTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (t.topicId) {
            if (t.taskType) {
              updateTopicSubTask(t.topicId, t.taskType, 'Completed');
            } else {
              setTopics((prevTopics) =>
                prevTopics.map((top) => (top.id === t.topicId ? {
                  ...top,
                  lectureStatus: 'Completed',
                  notesStatus: 'Completed',
                  revisionStatus: 'Completed',
                  status: 'Completed',
                } : top))
              );
            }
          }
          if (t.subjectId && t.source === 'subject') {
            setSubjects((prevSubjs) =>
              prevSubjs.map((subj) => (subj.id === t.subjectId ? { ...subj, status: 'Completed' } : subj))
            );
          }

          // Auto-record session on actual completion date so reports capture study time & completion on that date
          if (t.courseId) {
            addStudySession({
              courseId: t.courseId,
              subjectId: t.subjectId || null,
              topicId: t.topicId || null,
              date: completionDateStr,
              startTime: t.createdAt || completionISO,
              endTime: completionISO,
              sessionDuration: t.estimatedMinutes || 30,
              actualStudyDuration: t.estimatedMinutes || 30,
              breakDuration: 0,
              notes: `Completed pending task "${t.title}" (Scheduled: ${t.originalDate || 'Earlier'}, Completed: ${completionDateStr})`,
            });
          }

          return {
            ...t,
            status: 'Completed',
            completedAt: completionISO,
            completedDate: completionDateStr,
          };
        }
        return t;
      })
    );

    addNotification({
      title: 'Task Completed! ✅',
      message: 'Pending item completed! Completion date & time recorded in report.',
      type: 'success',
    });
  }, [addNotification, updateTopicSubTask, addStudySession]);

  const deletePendingTask = useCallback((id) => {
    setPendingTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- REVISION MANAGEMENT SYSTEM (INDEPENDENT) ---
  const addRevision = useCallback((revisionData) => {
    const todayStr = getTodayDateString();
    const newRevision = {
      id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: revisionData.title || (revisionData.topicName ? `${revisionData.topicName} Revision` : 'Revision Task'),
      subjectName: revisionData.subjectName || '',
      subjectId: revisionData.subjectId || null,
      courseId: revisionData.courseId || activeCourseId || null,
      topicName: revisionData.topicName || '',
      topicId: revisionData.topicId || null,
      subTopic: revisionData.subTopic || '',
      revisionDate: revisionData.revisionDate || todayStr,
      startTime: revisionData.startTime || '19:00',
      durationMinutes: Number(revisionData.durationMinutes) || 30,
      priority: revisionData.priority || 'Medium',
      notes: revisionData.notes || '',
      revisionType: revisionData.revisionType || 'New Topic',
      repeatPattern: revisionData.repeatPattern || 'One Time',
      revisionNumber: Number(revisionData.revisionNumber) || 1,
      status: revisionData.status || (revisionData.revisionDate < todayStr ? 'Pending' : revisionData.revisionDate === todayStr ? 'Today' : 'Upcoming'),
      sourceUrl: revisionData.sourceUrl || revisionData.videoUrl || '',
      videoUrl: revisionData.videoUrl || revisionData.sourceUrl || '',
      completedAt: null,
      completedDate: null,
      originalCompletionDate: revisionData.originalCompletionDate || null,
      createdAt: new Date().toISOString(),
    };
    setRevisions((prev) => [newRevision, ...prev]);
    addNotification({
      title: 'Revision Scheduled! 📚',
      message: `Revision for "${newRevision.topicName || newRevision.title}" scheduled for ${newRevision.revisionDate}.`,
      type: 'info',
    });
    return newRevision;
  }, [activeCourseId, addNotification]);

  const updateRevision = useCallback((id, updates) => {
    setRevisions((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteRevision = useCallback((id) => {
    setRevisions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const completeRevision = useCallback((id, actualDurationMinutes = null) => {
    const completionISO = new Date().toISOString();
    const completionDateStr = getTodayDateString();

    setRevisions((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const duration = actualDurationMinutes || r.durationMinutes || 30;

          if (r.courseId || activeCourseId) {
            addStudySession({
              courseId: r.courseId || activeCourseId,
              subjectId: r.subjectId || null,
              topicId: r.topicId || null,
              date: completionDateStr,
              startTime: r.createdAt || completionISO,
              endTime: completionISO,
              sessionDuration: duration,
              actualStudyDuration: duration,
              breakDuration: 0,
              notes: `Completed Revision #${r.revisionNumber || 1}: "${r.topicName || r.title}" (${duration} mins)`,
            });
          }

          return {
            ...r,
            status: 'Completed',
            completedAt: completionISO,
            completedDate: completionDateStr,
          };
        }
        return r;
      })
    );

    addNotification({
      title: 'Revision Completed! 📚✅',
      message: 'Great job! Revision logged in history and study stats.',
      type: 'success',
    });
  }, [addNotification, addStudySession, activeCourseId]);

  // --- SETTINGS ---
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // --- RELIABLE ROLLUP & CALCULATION FUNCTIONS (ZERO DOUBLE COUNTING) ---
  const getTopicStudyTime = useCallback((topicId) => {
    if (!topicId) return 0;
    return studySessions
      .filter(s => s.topicId === topicId)
      .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
  }, [studySessions]);

  const getSubjectStudyTime = useCallback((subjectId) => {
    if (!subjectId) return 0;
    return studySessions
      .filter(s => s.subjectId === subjectId)
      .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
  }, [studySessions]);

  const getStudyPlanStudyTime = useCallback((planId) => {
    if (!planId) return 0;
    return studySessions
      .filter(s => s.studyPlanId === planId)
      .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
  }, [studySessions]);

  const getCourseStudyTime = useCallback((courseId) => {
    if (!courseId) return 0;
    return studySessions
      .filter(s => s.courseId === courseId)
      .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
  }, [studySessions]);

  const getGlobalStudyTime = useCallback(() => {
    return studySessions.reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
  }, [studySessions]);

  // Today, Weekly, Monthly filters
  const getTodayStudyTime = useCallback((courseId = null) => {
    const today = getTodayDateString();
    return studySessions
      .filter(s => s.date === today && (!courseId || s.courseId === courseId))
      .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
  }, [studySessions]);

  const getWeeklyStudyTime = useCallback((courseId = null) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    return studySessions
      .filter(s => {
        if (courseId && s.courseId !== courseId) return false;
        const sessionDate = new Date(s.date);
        return sessionDate >= startOfWeek;
      })
      .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
  }, [studySessions]);

  const getMonthlyStudyTime = useCallback((courseId = null) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return studySessions
      .filter(s => {
        if (courseId && s.courseId !== courseId) return false;
        const sessionDate = new Date(s.date);
        return (
          sessionDate.getFullYear() === currentYear &&
          sessionDate.getMonth() === currentMonth
        );
      })
      .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
  }, [studySessions]);

  // Study Streak (consecutive days with study >= min qualifying minutes)
  const streak = useMemo(() => {
    if (studySessions.length === 0) return { current: 0, longest: 0 };
    const minMins = settings.minStudyMinutesForAttendance || 30;

    // Group study minutes by date
    const dailyMins = {};
    studySessions.forEach(s => {
      if (!s.date) return;
      dailyMins[s.date] = (dailyMins[s.date] || 0) + (s.actualStudyDuration || 0);
    });

    // Qualifying dates sorted descending
    const qualifyingDates = Object.keys(dailyMins)
      .filter(d => dailyMins[d] >= minMins)
      .sort((a, b) => new Date(b) - new Date(a));

    if (qualifyingDates.length === 0) return { current: 0, longest: 0 };

    const todayStr = getTodayDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yestYear = yesterdayDate.getFullYear();
    const yestMonth = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
    const yestDay = String(yesterdayDate.getDate()).padStart(2, '0');
    const yesterdayStr = `${yestYear}-${yestMonth}-${yestDay}`;

    // Current streak starts if today or yesterday is qualifying
    let currentStreak = 0;
    let checkDate = new Date();
    // If today is studied, start from today, else if yesterday studied, start from yesterday
    if (dailyMins[todayStr] >= minMins) {
      checkDate = new Date();
    } else if (dailyMins[yesterdayStr] >= minMins) {
      checkDate = yesterdayDate;
    } else {
      return { current: 0, longest: Math.max(1, qualifyingDates.length) };
    }

    while (true) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${d}`;
      if (dailyMins[dateKey] >= minMins) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { current: currentStreak, longest: Math.max(currentStreak, qualifyingDates.length) };
  }, [studySessions, settings.minStudyMinutesForAttendance]);

  // Attendance stats
  const getAttendanceStats = useCallback((courseId = null) => {
    const list = attendance.filter(a => !courseId || a.courseId === courseId);
    if (list.length === 0) return { present: 0, partial: 0, absent: 0, holiday: 0, percentage: 0 };

    const present = list.filter(a => a.status === 'Present').length;
    const partial = list.filter(a => a.status === 'Partial').length;
    const absent = list.filter(a => a.status === 'Absent').length;
    const holiday = list.filter(a => a.status === 'Holiday').length;
    const totalWorking = present + partial + absent;
    const percentage = totalWorking > 0 ? Math.round(((present + partial * 0.5) / totalWorking) * 100) : 0;

    return { present, partial, absent, holiday, percentage };
  }, [attendance]);

  // Global backup / restore / reset
  const handleExportBackup = () => {
    exportBackupJSON({
      courses,
      studyPlans,
      subjects,
      topics,
      resources,
      timetable,
      studySessions,
      attendance,
      targets,
      goals,
      notifications,
      settings,
    });
  };

  const handleImportBackup = (jsonStr) => {
    const res = validateAndImportBackupJSON(jsonStr);
    if (res.success) {
      setCourses(res.data.courses);
      setStudyPlans(res.data.studyPlans);
      setSubjects(res.data.subjects);
      setTopics(res.data.topics);
      setResources(res.data.resources);
      setTimetable(res.data.timetable);
      setStudySessions(res.data.studySessions);
      setAttendance(res.data.attendance);
      setTargets(res.data.targets);
      setGoals(res.data.goals);
      setNotifications(res.data.notifications);
      setSettings(res.data.settings);
      if (res.data.courses.length > 0) {
        setActiveCourseId(res.data.courses[0].id);
      }
    }
    return res;
  };

  const handleResetAllData = () => {
    resetAllStorageData();
    setCourses([]);
    setStudyPlans([]);
    setSubjects([]);
    setTopics([]);
    setResources([]);
    setTimetable([]);
    setStudySessions([]);
    setAttendance([]);
    setTargets([]);
    setGoals([]);
    setNotifications([]);
    setSettings(DEFAULT_SETTINGS);
    setActiveCourseId(null);
  };

  const value = {
    // Data collections
    courses,
    studyPlans,
    subjects,
    topics,
    resources,
    timetable,
    studySessions,
    attendance,
    targets,
    goals,
    notifications,
    settings,
    activeCourseId,
    activeCourse,
    setActiveCourseId,

    // Course CRUD
    addCourse,
    updateCourse,
    deleteCourse,
    archiveCourse,
    restoreCourse,
    duplicateCourse,

    // Plan, Subject, Topic, Resource CRUD
    addStudyPlan,
    updateStudyPlan,
    deleteStudyPlan,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    updateTopicSubTask,
    toggleTopicRevisionRequired,
    deleteTopic,
    toggleTopicComplete,
    addResource,
    updateResource,
    deleteResource,
    toggleResourceComplete,

    // Timetable
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,

    // Study Sessions
    addStudySession,
    updateStudySession,
    deleteStudySession,

    // Attendance
    updateAttendanceRecord,
    setManualAttendance,
    getAttendanceStats,

    // Targets & Goals
    addTarget,
    deleteTarget,
    addGoal,
    updateGoal,
    deleteGoal,

    // Pending Tasks System
    pendingTasks,
    addPendingTask,
    updatePendingTask,
    completePendingTask,
    deletePendingTask,

    // Revisions System
    revisions,
    addRevision,
    updateRevision,
    deleteRevision,
    completeRevision,

    // Notifications
    addNotification,
    markNotificationRead,
    clearAllNotifications,

    // Settings
    updateSettings,

    // Accurate calculation helpers
    getTopicStudyTime,
    getSubjectStudyTime,
    getStudyPlanStudyTime,
    getCourseStudyTime,
    getGlobalStudyTime,
    getTodayStudyTime,
    getWeeklyStudyTime,
    getMonthlyStudyTime,
    streak,

    // Backup & Reset
    exportBackup: handleExportBackup,
    importBackup: handleImportBackup,
    resetAllData: handleResetAllData,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
