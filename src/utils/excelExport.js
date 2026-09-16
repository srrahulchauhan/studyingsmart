import * as XLSX from 'xlsx';
import { formatDuration, formatDate, formatTime } from './dateUtils';

/**
 * Generate 13-sheet comprehensive StudyFlow Excel report
 */
export function exportStudyReportToExcel({
  courses = [],
  studyPlans = [],
  subjects = [],
  topics = [],
  resources = [],
  timetable = [],
  studySessions = [],
  attendance = [],
  targets = [],
  goals = [],
  settings = {},
  dateRange = { from: '', to: '' },
}) {
  const wb = XLSX.utils.book_new();

  // Helper maps for relational lookup
  const courseMap = new Map(courses.map(c => [c.id, c.name]));
  const planMap = new Map(studyPlans.map(p => [p.id, p.name]));
  const subjectMap = new Map(subjects.map(s => [s.id, s.name]));
  const topicMap = new Map(topics.map(t => [t.id, t.name]));

  // 1. Summary Sheet
  const totalStudyMinutes = studySessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
  const totalBreakMinutes = studySessions.reduce((acc, s) => acc + (s.breakDuration || 0), 0);
  const completedTopicsCount = topics.filter(t => t.status === 'Completed').length;
  const pendingTopicsCount = topics.filter(t => t.status !== 'Completed').length;
  const presentDaysCount = attendance.filter(a => a.status === 'Present').length;
  const partialDaysCount = attendance.filter(a => a.status === 'Partial').length;
  const absentDaysCount = attendance.filter(a => a.status === 'Absent').length;

  const summaryData = [
    { Metric: 'Report Title', Value: 'StudyFlow – Personal Study Control Center Report' },
    { Metric: 'Generated On', Value: new Date().toLocaleString() },
    { Metric: 'User Name', Value: settings.userName || 'Student' },
    { Metric: 'Report Period', Value: dateRange.from && dateRange.to ? `${dateRange.from} to ${dateRange.to}` : 'All Time' },
    { Metric: '', Value: '' },
    { Metric: 'Total Courses', Value: courses.length },
    { Metric: 'Total Study Plans', Value: studyPlans.length },
    { Metric: 'Total Subjects', Value: subjects.length },
    { Metric: 'Total Topics', Value: topics.length },
    { Metric: 'Completed Topics', Value: completedTopicsCount },
    { Metric: 'Pending Topics', Value: pendingTopicsCount },
    { Metric: 'Total Study Sessions', Value: studySessions.length },
    { Metric: 'Total Actual Study Time', Value: formatDuration(totalStudyMinutes) },
    { Metric: 'Total Actual Study Minutes', Value: totalStudyMinutes },
    { Metric: 'Total Break Time', Value: formatDuration(totalBreakMinutes) },
    { Metric: 'Present Days', Value: presentDaysCount },
    { Metric: 'Partial Days', Value: partialDaysCount },
    { Metric: 'Absent Days', Value: absentDaysCount },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // 2. Daily Report Sheet
  // Group study sessions by date
  const sessionsByDate = {};
  studySessions.forEach(s => {
    const d = s.date || 'Unknown';
    if (!sessionsByDate[d]) {
      sessionsByDate[d] = {
        date: d,
        studyMinutes: 0,
        breakMinutes: 0,
        sessionCount: 0,
        topicsStudied: new Set(),
      };
    }
    sessionsByDate[d].studyMinutes += (s.actualStudyDuration || 0);
    sessionsByDate[d].breakMinutes += (s.breakDuration || 0);
    sessionsByDate[d].sessionCount += 1;
    if (s.topicId) sessionsByDate[d].topicsStudied.add(topicMap.get(s.topicId) || 'Topic');
  });

  const dailyReportData = Object.values(sessionsByDate).map(item => ({
    'Date': item.date,
    'Total Study Duration': formatDuration(item.studyMinutes),
    'Study Minutes': item.studyMinutes,
    'Break Duration': formatDuration(item.breakMinutes),
    'Sessions Count': item.sessionCount,
    'Topics Studied': Array.from(item.topicsStudied).join(', '),
  }));
  const wsDaily = XLSX.utils.json_to_sheet(dailyReportData.length ? dailyReportData : [{ Date: 'No data', 'Total Study Duration': '0m', 'Study Minutes': 0, 'Break Duration': '0m', 'Sessions Count': 0, 'Topics Studied': '' }]);
  wsDaily['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Report');

  // 3. Study Sessions Sheet
  const sessionsData = studySessions.map(s => ({
    'Session ID': s.id,
    'Date': s.date,
    'Course': courseMap.get(s.courseId) || '—',
    'Study Plan': planMap.get(s.studyPlanId) || '—',
    'Subject': subjectMap.get(s.subjectId) || '—',
    'Topic': topicMap.get(s.topicId) || '—',
    'Start Time': s.startTime ? formatTime(s.startTime) : '—',
    'End Time': s.endTime ? formatTime(s.endTime) : '—',
    'Session Duration': formatDuration(s.sessionDuration),
    'Break Duration': formatDuration(s.breakDuration),
    'Actual Study Duration': formatDuration(s.actualStudyDuration),
    'Status': s.status || 'Completed',
  }));
  const wsSessions = XLSX.utils.json_to_sheet(sessionsData.length ? sessionsData : [{ 'Session ID': 'No sessions recorded yet' }]);
  wsSessions['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 22 }, { wch: 22 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 22 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsSessions, 'Study Sessions');

  // 4. Courses Sheet
  const coursesData = courses.map(c => {
    const courseSessions = studySessions.filter(s => s.courseId === c.id);
    const actualMins = courseSessions.reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
    const targetMins = (c.totalTargetHours || 0) * 60;
    const remainingMins = Math.max(0, targetMins - actualMins);
    const progress = targetMins > 0 ? Math.min(100, Math.round((actualMins / targetMins) * 100)) : 0;

    return {
      'Course Name': c.name,
      'Category': c.category || 'General',
      'Status': c.status || 'In Progress',
      'Priority': c.priority || 'Medium',
      'Daily Target (Hours)': c.dailyTarget || 0,
      'Weekly Target (Hours)': c.weeklyTarget || 0,
      'Total Target (Hours)': c.totalTargetHours || 0,
      'Actual Study Time': formatDuration(actualMins),
      'Remaining Time': formatDuration(remainingMins),
      'Progress %': `${progress}%`,
      'Start Date': c.startDate || '—',
      'Target Completion Date': c.targetDate || '—',
      'Purpose / Motivation': c.purpose || '',
      'Description': c.description || '',
    };
  });
  const wsCourses = XLSX.utils.json_to_sheet(coursesData.length ? coursesData : [{ 'Course Name': 'No courses created yet' }]);
  wsCourses['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 22 }, { wch: 30 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsCourses, 'Courses');

  // 5. Study Plans Sheet
  const plansData = studyPlans.map(p => {
    const planSessions = studySessions.filter(s => s.studyPlanId === p.id);
    const actualMins = planSessions.reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
    return {
      'Plan Name': p.name,
      'Course': courseMap.get(p.courseId) || '—',
      'Start Date': p.startDate || '—',
      'End Date': p.endDate || '—',
      'Daily Target (Hours)': p.dailyTarget || 0,
      'Weekly Target (Hours)': p.weeklyTarget || 0,
      'Total Target (Hours)': p.totalTargetHours || 0,
      'Actual Study Time': formatDuration(actualMins),
      'Study Days': p.studyDays || 'All',
      'Status': p.status || 'In Progress',
      'Description': p.description || '',
    };
  });
  const wsPlans = XLSX.utils.json_to_sheet(plansData.length ? plansData : [{ 'Plan Name': 'No study plans created yet' }]);
  wsPlans['!cols'] = [{ wch: 25 }, { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsPlans, 'Study Plans');

  // 6. Subjects Sheet
  const subjectsData = subjects.map(s => {
    const subjSessions = studySessions.filter(sess => sess.subjectId === s.id);
    const actualMins = subjSessions.reduce((sum, sess) => sum + (sess.actualStudyDuration || 0), 0);
    const subjTopics = topics.filter(t => t.subjectId === s.id);
    const completed = subjTopics.filter(t => t.status === 'Completed').length;
    const targetMins = (s.targetHours || 0) * 60;
    const remainingMins = Math.max(0, targetMins - actualMins);
    const progress = targetMins > 0 ? Math.min(100, Math.round((actualMins / targetMins) * 100)) : (subjTopics.length > 0 ? Math.round((completed / subjTopics.length) * 100) : 0);

    return {
      'Subject Name': s.name,
      'Course': courseMap.get(s.courseId) || '—',
      'Study Plan': planMap.get(s.studyPlanId) || '—',
      'Total Topics': subjTopics.length,
      'Completed Topics': completed,
      'Pending Topics': subjTopics.length - completed,
      'Target Hours': s.targetHours || 0,
      'Actual Study Time': formatDuration(actualMins),
      'Remaining Time': formatDuration(remainingMins),
      'Progress %': `${progress}%`,
      'Status': s.status || 'In Progress',
      'Priority': s.priority || 'Medium',
    };
  });
  const wsSubjects = XLSX.utils.json_to_sheet(subjectsData.length ? subjectsData : [{ 'Subject Name': 'No subjects created yet' }]);
  wsSubjects['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsSubjects, 'Subjects');

  // 7. Topics Sheet
  const topicsData = topics.map(t => {
    const topicSessions = studySessions.filter(s => s.topicId === t.id);
    const actualMins = topicSessions.reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
    return {
      'Topic Name': t.name,
      'Subject': subjectMap.get(t.subjectId) || '—',
      'Course': courseMap.get(t.courseId) || '—',
      'Estimated Minutes': t.estimatedMinutes || 0,
      'Actual Study Time': formatDuration(actualMins),
      'Sessions Count': topicSessions.length,
      'Target Date': t.targetDate || '—',
      'Status': t.status || 'Pending',
      'Priority': t.priority || 'Medium',
      'Description': t.description || '',
    };
  });
  const wsTopics = XLSX.utils.json_to_sheet(topicsData.length ? topicsData : [{ 'Topic Name': 'No topics created yet' }]);
  wsTopics['!cols'] = [{ wch: 25 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 15 }, { wch: 14 }, { wch: 12 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsTopics, 'Topics');

  // 8. Resources Sheet
  const resourcesData = resources.map(r => ({
    'Resource Name': r.name,
    'Type': r.type,
    'URL': r.url,
    'Course': courseMap.get(r.courseId) || '—',
    'Subject': subjectMap.get(r.subjectId) || '—',
    'Topic': topicMap.get(r.topicId) || '—',
    'Status': r.status || 'Not Started',
    'Tags': Array.isArray(r.tags) ? r.tags.join(', ') : (r.tags || ''),
    'Date Added': r.addedDate || '—',
    'Description': r.description || '',
  }));
  const wsResources = XLSX.utils.json_to_sheet(resourcesData.length ? resourcesData : [{ 'Resource Name': 'No resources saved yet' }]);
  wsResources['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 20 }, { wch: 15 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsResources, 'Resources');

  // 9. Attendance Sheet
  const attendanceData = attendance.map(a => ({
    'Date': a.date,
    'Course': courseMap.get(a.courseId) || '—',
    'Status': a.status,
    'Study Minutes': a.studyMinutes || 0,
    'Study Duration': formatDuration(a.studyMinutes || 0),
    'Remarks': a.remarks || '',
  }));
  const wsAttendance = XLSX.utils.json_to_sheet(attendanceData.length ? attendanceData : [{ 'Date': 'No attendance records yet' }]);
  wsAttendance['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsAttendance, 'Attendance');

  // 10. Timetable Sheet
  const timetableData = timetable.map(tt => ({
    'Day': tt.day,
    'Start Time': tt.startTime,
    'End Time': tt.endTime,
    'Target Duration': formatDuration(tt.targetDuration),
    'Course': courseMap.get(tt.courseId) || '—',
    'Subject': subjectMap.get(tt.subjectId) || '—',
    'Topic': topicMap.get(tt.topicId) || '—',
    'Repeat': tt.repeat || 'None',
  }));
  const wsTimetable = XLSX.utils.json_to_sheet(timetableData.length ? timetableData : [{ 'Day': 'No timetable slots scheduled yet' }]);
  wsTimetable['!cols'] = [{ wch: 15 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 22 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsTimetable, 'Timetable');

  // 11. Break Report Sheet
  const breakRows = [];
  studySessions.forEach(s => {
    if (s.breaks && s.breaks.length > 0) {
      s.breaks.forEach(b => {
        breakRows.push({
          'Date': s.date,
          'Course': courseMap.get(s.courseId) || '—',
          'Subject': subjectMap.get(s.subjectId) || '—',
          'Topic': topicMap.get(s.topicId) || '—',
          'Break Start': b.start ? formatTime(b.start) : '—',
          'Break End': b.end ? formatTime(b.end) : '—',
          'Break Duration': formatDuration(b.durationMinutes || (b.durationSeconds ? b.durationSeconds / 60 : 0)),
          'Reason': b.reason || 'Rest',
        });
      });
    } else if (s.breakDuration > 0) {
      breakRows.push({
        'Date': s.date,
        'Course': courseMap.get(s.courseId) || '—',
        'Subject': subjectMap.get(s.subjectId) || '—',
        'Topic': topicMap.get(s.topicId) || '—',
        'Break Start': '—',
        'Break End': '—',
        'Break Duration': formatDuration(s.breakDuration),
        'Reason': 'General Break',
      });
    }
  });
  const wsBreaks = XLSX.utils.json_to_sheet(breakRows.length ? breakRows : [{ 'Date': 'No breaks recorded yet' }]);
  wsBreaks['!cols'] = [{ wch: 15 }, { wch: 22 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 16 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsBreaks, 'Break Report');

  // 12. Targets Sheet
  const targetsData = targets.map(t => ({
    'Target Name': t.name || 'Target',
    'Course': courseMap.get(t.courseId) || '—',
    'Period': t.period || 'Daily',
    'Target Hours': t.targetHours || 0,
    'Date': t.date || '—',
    'Status': t.status || 'Active',
  }));
  const wsTargets = XLSX.utils.json_to_sheet(targetsData.length ? targetsData : [{ 'Target Name': 'No custom targets configured' }]);
  wsTargets['!cols'] = [{ wch: 25 }, { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsTargets, 'Targets');

  // 13. Goals Sheet
  const goalsData = goals.map(g => ({
    'Goal Name': g.name,
    'Course': courseMap.get(g.courseId) || '—',
    'Study Plan': planMap.get(g.studyPlanId) || '—',
    'Target Date': g.targetDate || '—',
    'Target Hours': g.targetHours || 0,
    'Progress %': `${g.progress || 0}%`,
    'Status': g.status || 'In Progress',
  }));
  const wsGoals = XLSX.utils.json_to_sheet(goalsData.length ? goalsData : [{ 'Goal Name': 'No goals created yet' }]);
  wsGoals['!cols'] = [{ wch: 25 }, { wch: 22 }, { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 14 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsGoals, 'Goals');

  // Download filename formatting
  const fromStr = dateRange.from || '01-09-2026';
  const toStr = dateRange.to || '16-09-2026';
  const fileName = `Study_Report_${fromStr}_to_${toStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Export table data to CSV file
 */
export function exportTableToCSV(tableData, fileName = 'StudyFlow_Export.csv') {
  if (!tableData || !tableData.length) return;
  const ws = XLSX.utils.json_to_sheet(tableData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy data as TSV (Tab Separated Values) for direct Paste into Google Sheets or Excel
 */
export function copyForGoogleSheets(tableData) {
  if (!tableData || !tableData.length) return false;
  const keys = Object.keys(tableData[0]);
  const header = keys.join('\t');
  const rows = tableData.map(row => keys.map(k => String(row[k] ?? '')).join('\t'));
  const tsv = [header, ...rows].join('\n');
  navigator.clipboard.writeText(tsv);
  return true;
}
