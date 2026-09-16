// StudyFlow LocalStorage Management
// CRITICAL: All collections initialize with ZERO data. No demo items.

export const STORAGE_KEYS = {
  COURSES: 'studyflow_courses',
  STUDY_PLANS: 'studyflow_study_plans',
  SUBJECTS: 'studyflow_subjects',
  TOPICS: 'studyflow_topics',
  RESOURCES: 'studyflow_resources',
  TIMETABLE: 'studyflow_timetable',
  STUDY_SESSIONS: 'studyflow_study_sessions',
  ATTENDANCE: 'studyflow_attendance',
  TARGETS: 'studyflow_targets',
  GOALS: 'studyflow_goals',
  PENDING_TASKS: 'studyflow_pending_tasks',
  NOTIFICATIONS: 'studyflow_notifications',
  SETTINGS: 'studyflow_settings',
  ACTIVE_COURSE_ID: 'studyflow_active_course_id',
  ACTIVE_SESSION: 'studyflow_active_session_state',
};

export const DEFAULT_SETTINGS = {
  dailyTargetHours: 4,
  weeklyTargetHours: 25,
  minStudyMinutesForAttendance: 30,
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  darkMode: true,
  timeFormat: '12h', // '12h' | '24h'
  weekStartDay: 'Monday', // 'Monday' | 'Sunday'
  soundEnabled: true,
  desktopNotifications: false,
  userName: '',
};

export function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error loading key ${key} from storage:`, error);
    return defaultValue;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key ${key} to storage:`, error);
  }
}

export function exportBackupJSON(dataSnapshot) {
  const exportPayload = {
    app: 'StudyFlow - Personal Study Control Center',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    data: {
      courses: dataSnapshot.courses || [],
      studyPlans: dataSnapshot.studyPlans || [],
      subjects: dataSnapshot.subjects || [],
      topics: dataSnapshot.topics || [],
      resources: dataSnapshot.resources || [],
      timetable: dataSnapshot.timetable || [],
      studySessions: dataSnapshot.studySessions || [],
      attendance: dataSnapshot.attendance || [],
      targets: dataSnapshot.targets || [],
      goals: dataSnapshot.goals || [],
      notifications: dataSnapshot.notifications || [],
      settings: dataSnapshot.settings || DEFAULT_SETTINGS,
    },
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `StudyFlow_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateAndImportBackupJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON structure');
    }
    const data = parsed.data || parsed; // Support direct or wrapped
    
    // Ensure all required collections exist or fall back to empty array
    const result = {
      courses: Array.isArray(data.courses) ? data.courses : [],
      studyPlans: Array.isArray(data.studyPlans) ? data.studyPlans : [],
      subjects: Array.isArray(data.subjects) ? data.subjects : [],
      topics: Array.isArray(data.topics) ? data.topics : [],
      resources: Array.isArray(data.resources) ? data.resources : [],
      timetable: Array.isArray(data.timetable) ? data.timetable : [],
      studySessions: Array.isArray(data.studySessions) ? data.studySessions : [],
      attendance: Array.isArray(data.attendance) ? data.attendance : [],
      targets: Array.isArray(data.targets) ? data.targets : [],
      goals: Array.isArray(data.goals) ? data.goals : [],
      notifications: Array.isArray(data.notifications) ? data.notifications : [],
      settings: typeof data.settings === 'object' && data.settings !== null ? { ...DEFAULT_SETTINGS, ...data.settings } : DEFAULT_SETTINGS,
    };

    // Save to localStorage
    saveToStorage(STORAGE_KEYS.COURSES, result.courses);
    saveToStorage(STORAGE_KEYS.STUDY_PLANS, result.studyPlans);
    saveToStorage(STORAGE_KEYS.SUBJECTS, result.subjects);
    saveToStorage(STORAGE_KEYS.TOPICS, result.topics);
    saveToStorage(STORAGE_KEYS.RESOURCES, result.resources);
    saveToStorage(STORAGE_KEYS.TIMETABLE, result.timetable);
    saveToStorage(STORAGE_KEYS.STUDY_SESSIONS, result.studySessions);
    saveToStorage(STORAGE_KEYS.ATTENDANCE, result.attendance);
    saveToStorage(STORAGE_KEYS.TARGETS, result.targets);
    saveToStorage(STORAGE_KEYS.GOALS, result.goals);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, result.notifications);
    saveToStorage(STORAGE_KEYS.SETTINGS, result.settings);
    
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function resetAllStorageData() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  // Initialize back to zero defaults
  saveToStorage(STORAGE_KEYS.COURSES, []);
  saveToStorage(STORAGE_KEYS.STUDY_PLANS, []);
  saveToStorage(STORAGE_KEYS.SUBJECTS, []);
  saveToStorage(STORAGE_KEYS.TOPICS, []);
  saveToStorage(STORAGE_KEYS.RESOURCES, []);
  saveToStorage(STORAGE_KEYS.TIMETABLE, []);
  saveToStorage(STORAGE_KEYS.STUDY_SESSIONS, []);
  saveToStorage(STORAGE_KEYS.ATTENDANCE, []);
  saveToStorage(STORAGE_KEYS.TARGETS, []);
  saveToStorage(STORAGE_KEYS.GOALS, []);
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}
