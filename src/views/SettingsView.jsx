import React, { useState, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Clock,
  Target,
  Bell,
  Volume2,
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  User,
  ShieldAlert,
} from 'lucide-react';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

export default function SettingsView() {
  const {
    settings,
    updateSettings,
    exportBackup,
    importBackup,
    resetAllData,
    courses,
    studySessions,
  } = useStudy();

  const [formData, setFormData] = useState({ ...settings });
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = importBackup(content);
        if (res.success) {
          setImportStatus({ type: 'success', message: 'Backup restored successfully!' });
        } else {
          setImportStatus({ type: 'error', message: `Import failed: ${res.error}` });
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            <SettingsIcon className="w-4 h-4" />
            System Preferences
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Application Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure default daily targets, attendance thresholds, Pomodoro durations, and data management.
          </p>
        </div>

        {saveFeedback && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Section 1: Study & Attendance Preferences */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            Target & Attendance Defaults
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Daily Target (Hours)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.dailyTargetHours}
                onChange={(e) => setFormData({ ...formData, dailyTargetHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Weekly Target (Hours)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.weeklyTargetHours}
                onChange={(e) => setFormData({ ...formData, weeklyTargetHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min Study Time for Attendance (Minutes)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.minStudyMinutesForAttendance}
                onChange={(e) => setFormData({ ...formData, minStudyMinutesForAttendance: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Daily sessions below this threshold are marked Partial.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Pomodoro Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500" />
            Pomodoro Focus Intervals
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Focus Work Interval (Minutes)
              </label>
              <input
                type="number"
                min="5"
                value={formData.pomodoroWorkMinutes}
                onChange={(e) => setFormData({ ...formData, pomodoroWorkMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Break (Minutes)
              </label>
              <input
                type="number"
                min="1"
                value={formData.pomodoroBreakMinutes}
                onChange={(e) => setFormData({ ...formData, pomodoroBreakMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Long Break (Minutes)
              </label>
              <input
                type="number"
                min="5"
                value={formData.pomodoroLongBreakMinutes}
                onChange={(e) => setFormData({ ...formData, pomodoroLongBreakMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Interface & Experience */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" />
            Display & Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={formData.userName || ''}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Your Name (Used in PDF Reports)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Time Format
              </label>
              <select
                value={formData.timeFormat}
                onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="12h">12-Hour (e.g. 7:00 PM)</option>
                <option value="24h">24-Hour (e.g. 19:00)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Week Starts On
              </label>
              <select
                value={formData.weekStartDay}
                onChange={(e) => setFormData({ ...formData, weekStartDay: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.darkMode}
                onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Dark Mode Theme</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Audio Chimes & Timer Beeps</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="py-3 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all"
          >
            Save All Preferences
          </button>
        </div>
      </form>

      {/* Section 4: Data Management (Backup, Restore & Reset) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          Data Backup & Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export your complete workspace as a JSON file or restore from a previous backup.
        </p>

        {importStatus && (
          <div className={`p-3 rounded-xl text-xs font-semibold ${
            importStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {importStatus.message}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export JSON Backup */}
          <button
            type="button"
            onClick={exportBackup}
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            Export JSON Backup
          </button>

          {/* Import Backup */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-blue-500" />
            Import JSON Backup
          </button>
        </div>

        {/* Section 48: RESET ALL DATA */}
        <div className="mt-8 pt-6 border-t border-rose-100 dark:border-rose-950/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
            <div>
              <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Reset All Data
              </div>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                Permanently purge all courses, study plans, subjects, topics, timetable, sessions, and attendance. Returns StudyFlow to a 100% fresh zero-data state.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all shrink-0"
            >
              Reset Everything
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset Everything */}
      <ConfirmDeleteModal
        isOpen={isResetConfirmOpen}
        title="Reset All StudyFlow Data?"
        message="Are you sure? This will permanently remove all study data (courses, subjects, timer sessions, attendance, targets, and goals). Application will return to fresh zero-data state."
        onConfirm={resetAllData}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
