import React, { useState, useMemo } from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatDuration, formatDate } from '../../utils/dateUtils';
import { Flame, Calendar, Sparkles } from 'lucide-react';

export default function ProductivityHeatmap() {
  const { studySessions, activeCourseId } = useStudy();
  const [hoveredDay, setHoveredDay] = useState(null);

  // Group study sessions by date
  const dayStatsMap = useMemo(() => {
    const map = {};
    studySessions.forEach((s) => {
      if (activeCourseId && s.courseId !== activeCourseId) return;
      if (!s.date) return;

      if (!map[s.date]) {
        map[s.date] = {
          minutes: 0,
          sessions: 0,
          topicsSet: new Set(),
        };
      }
      map[s.date].minutes += (s.actualStudyDuration || 0);
      map[s.date].sessions += 1;
      if (s.topicId) {
        map[s.date].topicsSet.add(s.topicId);
      }
    });
    return map;
  }, [studySessions, activeCourseId]);

  // Generate grid for past 26 weeks (~6 months) or 52 weeks for compact desktop
  // Let's generate past 28 weeks (196 days) so it fits beautifully without horizontal clutter
  const weeks = useMemo(() => {
    const result = [];
    const today = new Date();
    // Start on Monday, 28 weeks ago
    const totalDays = 28 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + (7 - today.getDay()));

    let currentWeek = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];

      const stats = dayStatsMap[dateKey];
      const mins = stats ? stats.minutes : 0;
      const count = stats ? stats.sessions : 0;
      const topicsCount = stats ? stats.topicsSet.size : 0;

      // Intensity level: 0: 0h, 1: <1h, 2: 1-2h, 3: 2-4h, 4: 4h+
      let level = 0;
      if (mins > 0 && mins < 60) level = 1;
      else if (mins >= 60 && mins < 120) level = 2;
      else if (mins >= 120 && mins < 240) level = 3;
      else if (mins >= 240) level = 4;

      currentWeek.push({
        date: d,
        dateKey,
        minutes: mins,
        sessionsCount: count,
        topicsCount,
        level,
      });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }
    return result;
  }, [dayStatsMap]);

  const levelColors = {
    0: 'bg-slate-100 dark:bg-white/[0.04]',
    1: 'bg-emerald-500/30',
    2: 'bg-emerald-500/60',
    3: 'bg-emerald-500/80',
    4: 'bg-emerald-500 shadow-sm shadow-emerald-500/30',
  };

  const dayLabels = ['M', '', 'W', '', 'F', '', 'S'];

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Productivity Heatmap
            </h3>
            <p className="text-[11px] text-slate-400">
              Consistency matrix based on actual study duration (Past 28 Weeks)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-white/[0.04]"></span>
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30"></span>
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60"></span>
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80"></span>
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
          <span>More (4h+)</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="pt-4 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max pb-2">
          {/* Day of week labels */}
          <div className="grid grid-rows-7 gap-1 text-[9px] font-mono text-slate-400 pr-1 select-none">
            {dayLabels.map((lbl, idx) => (
              <span key={idx} className="h-3 w-3 flex items-center justify-center">
                {lbl}
              </span>
            ))}
          </div>

          {/* Week Columns */}
          <div className="flex gap-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-rows-7 gap-1">
                {week.map((day) => (
                  <div
                    key={day.dateKey}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-3.5 h-3.5 rounded-sm transition-all cursor-pointer ${
                      levelColors[day.level]
                    } hover:ring-2 hover:ring-indigo-400`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating or fixed Tooltip info */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-xs min-h-[30px]">
        {hoveredDay ? (
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {formatDate(hoveredDay.date)}:
            </span>
            <span>
              Study Time:{' '}
              <strong className="text-slate-900 dark:text-white">
                {formatDuration(hoveredDay.minutes)}
              </strong>
            </span>
            <span>•</span>
            <span>Sessions: {hoveredDay.sessionsCount}</span>
            <span>•</span>
            <span>Topics: {hoveredDay.topicsCount}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">
            Hover over any date square to inspect focus time and sessions.
          </span>
        )}
      </div>
    </div>
  );
}
