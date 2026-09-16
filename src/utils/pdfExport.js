import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDuration, formatDate, formatTime } from './dateUtils';

/**
 * Generate a professional StudyFlow PDF report with custom selectable sections
 */
export function exportStudyReportToPDF({
  courses = [],
  studyPlans = [],
  subjects = [],
  topics = [],
  resources = [],
  timetable = [],
  studySessions = [],
  attendance = [],
  settings = {},
  selectedSections = {
    summary: true,
    attendance: true,
    breaks: true,
    timetable: true,
    resources: true,
    topics: true,
    daily: true,
    subjects: true,
    courses: true,
  },
  dateRange = { from: '', to: '' },
}) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // Header Banner
  doc.setFillColor(79, 70, 229); // Brand Indigo
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('StudyFlow – Personal Study Control Center', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student: ${settings.userName || 'Student'} | Period: ${dateRange.from && dateRange.to ? `${dateRange.from} to ${dateRange.to}` : 'All Time'} | Generated: ${new Date().toLocaleDateString()}`, 14, 20);

  currentY = 36;
  doc.setTextColor(30, 41, 59);

  // Helper maps
  const courseMap = new Map(courses.map(c => [c.id, c.name]));
  const planMap = new Map(studyPlans.map(p => [p.id, p.name]));
  const subjectMap = new Map(subjects.map(s => [s.id, s.name]));
  const topicMap = new Map(topics.map(t => [t.id, t.name]));

  // Section 1: Summary Statistics
  if (selectedSections.summary) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Executive Study Summary', 14, currentY);
    currentY += 4;

    const totalStudyMinutes = studySessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
    const totalBreakMinutes = studySessions.reduce((acc, s) => acc + (s.breakDuration || 0), 0);
    const completedTopics = topics.filter(t => t.status === 'Completed').length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const partialDays = attendance.filter(a => a.status === 'Partial').length;

    const summaryBody = [
      ['Total Courses', `${courses.length}`, 'Total Actual Study Time', formatDuration(totalStudyMinutes)],
      ['Total Study Plans', `${studyPlans.length}`, 'Total Break Time', formatDuration(totalBreakMinutes)],
      ['Total Subjects', `${subjects.length}`, 'Study Sessions Count', `${studySessions.length}`],
      ['Total Topics', `${topics.length}`, 'Attendance (Present/Partial)', `${presentDays} Present / ${partialDays} Partial`],
      ['Completed Topics', `${completedTopics}`, 'Topic Completion %', topics.length > 0 ? `${Math.round((completedTopics / topics.length) * 100)}%` : '0%'],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Value', 'Productivity Metric', 'Value']],
      body: summaryBody,
      theme: 'grid',
      headStyles: { fillColor: [67, 56, 202], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Section 2: Course Performance
  if (selectedSections.courses && courses.length > 0) {
    if (currentY > 240) { doc.addPage(); currentY = 18; }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Course Performance & Targets', 14, currentY);
    currentY += 4;

    const courseRows = courses.map(c => {
      const courseSessions = studySessions.filter(s => s.courseId === c.id);
      const actualMins = courseSessions.reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
      const targetMins = (c.totalTargetHours || 0) * 60;
      const remainingMins = Math.max(0, targetMins - actualMins);
      const progress = targetMins > 0 ? Math.min(100, Math.round((actualMins / targetMins) * 100)) : 0;
      return [c.name, c.status || 'Active', `${c.totalTargetHours || 0}h`, formatDuration(actualMins), formatDuration(remainingMins), `${progress}%`];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Course Name', 'Status', 'Target Hours', 'Actual Study', 'Remaining', 'Progress']],
      body: courseRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8, cellPadding: 2.5 },
      margin: { left: 14, right: 14 },
    });
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Section 3: Subject & Topic Progress
  if (selectedSections.topics && topics.length > 0) {
    if (currentY > 240) { doc.addPage(); currentY = 18; }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Topics Progress & Study Time', 14, currentY);
    currentY += 4;

    const topicRows = topics.map(t => {
      const tSessions = studySessions.filter(s => s.topicId === t.id);
      const actualMins = tSessions.reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);
      return [
        t.name,
        subjectMap.get(t.subjectId) || '—',
        courseMap.get(t.courseId) || '—',
        formatDuration(actualMins),
        t.status || 'Pending',
        t.priority || 'Medium',
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Topic', 'Subject', 'Course', 'Actual Study Time', 'Status', 'Priority']],
      body: topicRows.slice(0, 50), // Cap for neat display
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Section 4: Attendance Summary
  if (selectedSections.attendance && attendance.length > 0) {
    if (currentY > 240) { doc.addPage(); currentY = 18; }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Attendance Log', 14, currentY);
    currentY += 4;

    const attendanceRows = attendance.map(a => [
      a.date,
      courseMap.get(a.courseId) || 'All Courses',
      a.status,
      formatDuration(a.studyMinutes || 0),
      a.remarks || '',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Course', 'Status', 'Study Time', 'Notes']],
      body: attendanceRows.slice(0, 40),
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Section 5: Break Analysis
  if (selectedSections.breaks) {
    const breakItems = [];
    studySessions.forEach(s => {
      if (s.breaks && s.breaks.length > 0) {
        s.breaks.forEach(b => {
          breakItems.push([
            s.date,
            topicMap.get(s.topicId) || subjectMap.get(s.subjectId) || 'Session',
            b.reason || 'Rest',
            formatDuration(b.durationMinutes || (b.durationSeconds ? b.durationSeconds / 60 : 0)),
          ]);
        });
      } else if (s.breakDuration > 0) {
        breakItems.push([
          s.date,
          topicMap.get(s.topicId) || subjectMap.get(s.subjectId) || 'Session',
          'Break',
          formatDuration(s.breakDuration),
        ]);
      }
    });

    if (breakItems.length > 0) {
      if (currentY > 240) { doc.addPage(); currentY = 18; }
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('5. Break Analysis & Rest Periods', 14, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Topic/Session', 'Reason', 'Duration']],
        body: breakItems.slice(0, 30),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 14, right: 14 },
      });
      currentY = doc.lastAutoTable.finalY + 10;
    }
  }

  // Section 6: Resources
  if (selectedSections.resources && resources.length > 0) {
    if (currentY > 240) { doc.addPage(); currentY = 18; }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('6. Saved Study Resources', 14, currentY);
    currentY += 4;

    const resourceRows = resources.map(r => [
      r.name,
      r.type,
      subjectMap.get(r.subjectId) || '—',
      r.status || 'Not Started',
      r.url || '',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Resource Name', 'Type', 'Subject', 'Status', 'Link']],
      body: resourceRows.slice(0, 30),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 7.5, cellPadding: 2 },
      columnStyles: { 4: { cellWidth: 55 } },
      margin: { left: 14, right: 14 },
    });
  }

  // Add Page Numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages} — StudyFlow Personal Study Control Center`, pageWidth / 2, 290, { align: 'center' });
  }

  const fromStr = dateRange.from || '01-09-2026';
  const toStr = dateRange.to || '16-09-2026';
  doc.save(`Study_Report_${fromStr}_to_${toStr}.pdf`);
}
