import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { formatDuration, formatDate, formatTime, getTodayDateString } from '../utils/dateUtils';
import { exportStudyReportToExcel, exportTableToCSV, copyForGoogleSheets } from '../utils/excelExport';
import { exportStudyReportToPDF } from '../utils/pdfExport';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Copy,
  ExternalLink,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Coffee,
  CheckSquare,
} from 'lucide-react';

export default function ReportsExportView() {
  const {
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
    pendingTasks,
    settings,
  } = useStudy();

  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });

  const [filterCourseId, setFilterCourseId] = useState('All');
  const [filterSubjectId, setFilterSubjectId] = useState('All');

  const [activeReportTab, setActiveReportTab] = useState('summary'); // 'summary' | 'datewise' | 'subjectwise' | 'coursewise' | 'breaks' | 'timetable'
  const [copiedNotification, setCopiedNotification] = useState(false);

  // PDF Export Sections Picker Modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfSections, setPdfSections] = useState({
    summary: true,
    attendance: true,
    breaks: true,
    timetable: true,
    resources: true,
    topics: true,
    courses: true,
  });

  // Quick Date Range helper
  const applyQuickFilter = (type) => {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toDateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    let from = new Date();
    if (type === 'today') {
      from = today;
    } else if (type === 'yesterday') {
      from.setDate(today.getDate() - 1);
      const yestStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
      setDateRange({ from: yestStr, to: yestStr });
      return;
    } else if (type === '7days') {
      from.setDate(today.getDate() - 7);
    } else if (type === '30days') {
      from.setDate(today.getDate() - 30);
    } else if (type === 'thisMonth') {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (type === 'thisYear') {
      from = new Date(today.getFullYear(), 0, 1);
    }

    const fromDateStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
    setDateRange({ from: fromDateStr, to: toDateStr });
  };

  // Filter study sessions
  const filteredSessions = studySessions.filter((s) => {
    if (filterCourseId !== 'All' && s.courseId !== filterCourseId) return false;
    if (filterSubjectId !== 'All' && s.subjectId !== filterSubjectId) return false;
    if (dateRange.from && new Date(s.date) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(s.date) > new Date(dateRange.to)) return false;
    return true;
  });

  // Summary Metrics
  const totalStudyMinutes = filteredSessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
  const totalBreakMinutes = filteredSessions.reduce((acc, s) => acc + (s.breakDuration || 0), 0);
  const longestSession = filteredSessions.reduce((max, s) => Math.max(max, s.actualStudyDuration || 0), 0);

  const distinctDays = new Set(filteredSessions.map((s) => s.date)).size;
  const avgDailyMinutes = distinctDays > 0 ? Math.round(totalStudyMinutes / distinctDays) : 0;

  // Filtered Attendance
  const filteredAttendance = attendance.filter((a) => {
    if (filterCourseId !== 'All' && a.courseId !== filterCourseId) return false;
    if (dateRange.from && new Date(a.date) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(a.date) > new Date(dateRange.to)) return false;
    return true;
  });

  const presentDays = filteredAttendance.filter((a) => a.status === 'Present').length;
  const partialDays = filteredAttendance.filter((a) => a.status === 'Partial').length;
  const absentDays = filteredAttendance.filter((a) => a.status === 'Absent').length;

  // Helper maps
  const courseMap = new Map(courses.map((c) => [c.id, c.name]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const topicMap = new Map(topics.map((t) => [t.id, t.name]));

  // Handlers for Exports
  const handleExportExcel = () => {
    exportStudyReportToExcel({
      courses,
      studyPlans,
      subjects,
      topics,
      pendingTasks,
      resources,
      timetable,
      studySessions: filteredSessions,
      attendance: filteredAttendance,
      targets,
      goals,
      settings,
      dateRange,
    });
  };

  const handleExportPDF = () => {
    exportStudyReportToPDF({
      courses,
      studyPlans,
      subjects,
      topics,
      resources,
      timetable,
      studySessions: filteredSessions,
      attendance: filteredAttendance,
      settings,
      selectedSections: pdfSections,
      dateRange,
    });
    setIsPdfModalOpen(false);
  };

  const handleExportCSV = () => {
    const csvData = filteredSessions.map((s) => ({
      Date: s.date,
      Course: courseMap.get(s.courseId) || '—',
      Subject: subjectMap.get(s.subjectId) || '—',
      Topic: topicMap.get(s.topicId) || '—',
      'Start Time': formatTime(s.startTime),
      'End Time': formatTime(s.endTime),
      'Elapsed Duration': formatDuration(s.sessionDuration),
      'Break Duration': formatDuration(s.breakDuration),
      'Actual Study Duration': formatDuration(s.actualStudyDuration),
      Status: s.status || 'Completed',
    }));
    exportTableToCSV(csvData, `Study_Report_${getTodayDateString()}.csv`);
  };

  const handleCopyForSheets = () => {
    const sheetData = filteredSessions.map((s) => ({
      Date: s.date,
      Course: courseMap.get(s.courseId) || '—',
      Subject: subjectMap.get(s.subjectId) || '—',
      Topic: topicMap.get(s.topicId) || '—',
      'Start Time': formatTime(s.startTime),
      'End Time': formatTime(s.endTime),
      'Session (mins)': s.sessionDuration,
      'Break (mins)': s.breakDuration,
      'Actual Study (mins)': s.actualStudyDuration,
      Status: s.status || 'Completed',
    }));
    const success = copyForGoogleSheets(sheetData);
    if (success) {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            Audit & Compliance
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Reports & Export Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generate custom date-wise reports, export formatted 13-sheet Excel workbooks, or download custom PDFs.
          </p>
        </div>

        {/* Primary Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Excel (.xlsx)
          </button>

          {/* PDF Button */}
          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>

          {/* CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
          >
            Export CSV
          </button>

          {/* Google Sheets button */}
          <button
            type="button"
            onClick={handleCopyForSheets}
            className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1 transition-colors relative"
            title="Copy TSV formatted data for direct Paste into Google Sheets"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy for Sheets
            {copiedNotification && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-bold animate-fadeIn">
                Copied TSV!
              </span>
            )}
          </button>

          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            title="Open Google Sheets (New Spreadsheet)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Date Range & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Quick Date Range Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium text-[11px] mr-1">Quick Filters:</span>
          {[
            { label: 'Today', key: 'today' },
            { label: 'Yesterday', key: 'yesterday' },
            { label: 'Last 7 Days', key: '7days' },
            { label: 'Last 30 Days', key: '30days' },
            { label: 'This Month', key: 'thisMonth' },
            { label: 'This Year', key: 'thisYear' },
          ].map((qf) => (
            <button
              key={qf.key}
              type="button"
              onClick={() => applyQuickFilter(qf.key)}
              className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-medium transition-colors text-[11px]"
            >
              {qf.label}
            </button>
          ))}
          {(dateRange.from || dateRange.to) && (
            <button
              type="button"
              onClick={() => setDateRange({ from: '', to: '' })}
              className="text-xs text-rose-500 hover:underline ml-2"
            >
              Reset Range
            </button>
          )}
        </div>

        {/* Custom Date Pickers & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Course Filter
            </label>
            <select
              value={filterCourseId}
              onChange={(e) => setFilterCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
            >
              <option value="All">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Subject Filter
            </label>
            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
            >
              <option value="All">All Subjects</option>
              {subjects
                .filter((s) => filterCourseId === 'All' || s.courseId === filterCourseId)
                .map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 38: REPORT SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block mb-0.5">Total Study</span>
          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
            {formatDuration(totalStudyMinutes)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block mb-0.5">Total Sessions</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100">
            {filteredSessions.length}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block mb-0.5">Daily Average</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {formatDuration(avgDailyMinutes)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block mb-0.5">Longest Session</span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400">
            {formatDuration(longestSession)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block mb-0.5">Total Break Time</span>
          <span className="text-lg font-black text-rose-600 dark:text-rose-400">
            {formatDuration(totalBreakMinutes)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block mb-0.5">Attendance</span>
          <span className="text-lg font-black text-teal-600 dark:text-teal-400">
            {presentDays}P / {partialDays}Part
          </span>
        </div>
      </div>

      {/* Report Table Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-xs">
          {[
            { id: 'datewise', label: 'Date-Wise Sessions' },
            { id: 'subjectwise', label: 'Subject-Wise Report' },
            { id: 'coursewise', label: 'Course-Wise Report' },
            { id: 'breaks', label: 'Break Log' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReportTab(tab.id)}
              className={`py-2 px-3.5 font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                activeReportTab === tab.id
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto p-4">
          {activeReportTab === 'datewise' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Start / End</th>
                  <th className="p-3">Total Duration</th>
                  <th className="p-3">Break</th>
                  <th className="p-3">Actual Study</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      No study sessions match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{formatDate(s.date)}</td>
                      <td className="p-3">{courseMap.get(s.courseId) || '—'}</td>
                      <td className="p-3">{subjectMap.get(s.subjectId) || '—'}</td>
                      <td className="p-3 font-medium">{topicMap.get(s.topicId) || '—'}</td>
                      <td className="p-3 text-slate-400">{formatTime(s.startTime)} – {formatTime(s.endTime)}</td>
                      <td className="p-3 font-mono">{formatDuration(s.sessionDuration)}</td>
                      <td className="p-3 font-mono text-amber-600">{s.breakDuration > 0 ? formatDuration(s.breakDuration) : '0m'}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatDuration(s.actualStudyDuration)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeReportTab === 'subjectwise' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Target Hours</th>
                  <th className="p-3">Actual Study</th>
                  <th className="p-3">Remaining</th>
                  <th className="p-3">Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {subjects.map((sub) => {
                  const subSessions = filteredSessions.filter((s) => s.subjectId === sub.id);
                  const actualMins = subSessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
                  const targetMins = (sub.targetHours || 0) * 60;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{sub.name}</td>
                      <td className="p-3">{courseMap.get(sub.courseId) || '—'}</td>
                      <td className="p-3">{sub.targetHours || 0}h</td>
                      <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">{formatDuration(actualMins)}</td>
                      <td className="p-3 font-mono">{formatDuration(Math.max(0, targetMins - actualMins))}</td>
                      <td className="p-3">{subSessions.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeReportTab === 'coursewise' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Course Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Target Hours</th>
                  <th className="p-3">Actual Study</th>
                  <th className="p-3">Remaining</th>
                  <th className="p-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {courses.map((c) => {
                  const cSessions = filteredSessions.filter((s) => s.courseId === c.id);
                  const actualMins = cSessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
                  const targetMins = (c.totalTargetHours || 0) * 60;
                  const progress = targetMins > 0 ? Math.min(100, Math.round((actualMins / targetMins) * 100)) : 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{c.name}</td>
                      <td className="p-3">{c.status}</td>
                      <td className="p-3">{c.totalTargetHours || 0}h</td>
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatDuration(actualMins)}</td>
                      <td className="p-3 font-mono">{formatDuration(Math.max(0, targetMins - actualMins))}</td>
                      <td className="p-3 font-bold text-indigo-600">{progress}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeReportTab === 'breaks' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Course / Topic</th>
                  <th className="p-3">Break Reason</th>
                  <th className="p-3">Break Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredSessions.filter((s) => s.breakDuration > 0).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">
                      No breaks recorded in the selected period.
                    </td>
                  </tr>
                ) : (
                  filteredSessions
                    .filter((s) => s.breakDuration > 0)
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3">{formatDate(s.date)}</td>
                        <td className="p-3 font-medium">{topicMap.get(s.topicId) || courseMap.get(s.courseId) || 'Session'}</td>
                        <td className="p-3 text-slate-500">
                          {s.breaks && s.breaks.length > 0 ? s.breaks.map((b) => b.reason).join(', ') : 'Rest'}
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {formatDuration(s.breakDuration)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* PDF Export Section Picker Modal (Section 44) */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Configure PDF Export Sections
              </h3>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Select which sections to include in the generated PDF report:
            </p>

            <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              {Object.keys(pdfSections).map((secKey) => (
                <label key={secKey} className="flex items-center gap-2.5 cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={pdfSections[secKey]}
                    onChange={(e) => setPdfSections({ ...pdfSections, [secKey]: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {secKey} Report Section
                  </span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
