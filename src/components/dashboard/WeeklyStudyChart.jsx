import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { formatDuration, getCurrentWeekDates, formatDate } from '../../utils/dateUtils';
import { BarChart3, TrendingUp, Target, Info } from 'lucide-react';

export default function WeeklyStudyChart() {
  const { studySessions, activeCourse, activeCourseId } = useStudy();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const weekDays = getCurrentWeekDates('Monday');
  const dailyTargetHours = activeCourse ? activeCourse.dailyTarget || 4 : 4;
  const targetMinutes = dailyTargetHours * 60;

  // Compute actual minutes for each day
  const data = weekDays.map((day) => {
    const actualMinutes = studySessions
      .filter((s) => s.date === day.dateString && (!activeCourseId || s.courseId === activeCourseId))
      .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);

    const diffMinutes = actualMinutes - targetMinutes;

    return {
      dayName: day.name,
      displayDate: day.displayDate,
      dateString: day.dateString,
      actualMinutes,
      actualHours: (actualMinutes / 60).toFixed(1),
      targetMinutes,
      targetHours: dailyTargetHours,
      diffMinutes,
    };
  });

  // Determine max value for Y-axis scale
  const maxMinutes = Math.max(
    targetMinutes * 1.3,
    ...data.map((d) => d.actualMinutes),
    120 // minimum 2h scale
  );

  const chartHeight = 160;

  return (
    <div className="rounded-3xl bg-white/80 dark:bg-[#0f1629]/80 border border-slate-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-sm backdrop-blur-xl command-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Weekly Study Analytics
            </h3>
            <p className="text-[11px] text-slate-400">
              Actual Focus vs Daily Target ({dailyTargetHours}h target)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 dark:bg-indigo-500"></span>
            <span className="text-slate-400 font-medium">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-400"></span>
            <span className="text-slate-400 font-medium">Target ({dailyTargetHours}h)</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart Area */}
      <div className="pt-6 relative">
        {/* Target Benchmark Line */}
        <div
          className="absolute left-0 right-0 border-b border-dashed border-rose-400/50 flex items-center justify-end pr-1 pointer-events-none z-10"
          style={{
            bottom: `${(targetMinutes / maxMinutes) * chartHeight + 28}px`,
          }}
        >
          <span className="text-[9px] font-mono font-bold text-rose-400 bg-white/80 dark:bg-[#0f1629]/90 px-1 rounded">
            {dailyTargetHours}h
          </span>
        </div>

        {/* Chart Columns */}
        <div
          className="grid grid-cols-7 gap-2 sm:gap-4 items-end"
          style={{ height: chartHeight }}
        >
          {data.map((item, idx) => {
            const barHeightPercent = Math.min(100, Math.max(4, (item.actualMinutes / maxMinutes) * 100));
            const isHovered = hoveredIndex === idx;
            const reachedTarget = item.actualMinutes >= item.targetMinutes && item.targetMinutes > 0;

            return (
              <div
                key={item.dayName}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Bar */}
                <div
                  className={`w-full max-w-[32px] rounded-t-xl transition-all duration-300 relative ${
                    reachedTarget
                      ? 'bg-gradient-to-t from-indigo-600 to-emerald-400 shadow-sm shadow-emerald-500/20'
                      : item.actualMinutes > 0
                      ? 'bg-gradient-to-t from-indigo-700 to-indigo-500'
                      : 'bg-slate-100 dark:bg-white/[0.04]'
                  } ${isHovered ? 'scale-105 filter brightness-110' : ''}`}
                  style={{ height: `${barHeightPercent}%` }}
                />

                {/* Day Label */}
                <span
                  className={`text-[10px] font-mono font-bold mt-2 transition-colors ${
                    isHovered
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400'
                  }`}
                >
                  {item.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip / Details Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.05] min-h-[34px] flex items-center justify-between text-xs">
        {hoveredIndex !== null ? (
          <div className="flex flex-wrap items-center gap-3 w-full">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {data[hoveredIndex].displayDate} ({data[hoveredIndex].dayName}):
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              Actual: {formatDuration(data[hoveredIndex].actualMinutes)}
            </span>
            <span className="text-slate-400">
              Target: {data[hoveredIndex].targetHours}h
            </span>
            <span
              className={`font-semibold ${
                data[hoveredIndex].diffMinutes >= 0
                  ? 'text-emerald-500'
                  : 'text-rose-400'
              }`}
            >
              {data[hoveredIndex].diffMinutes >= 0 ? '+' : '-'}
              {formatDuration(Math.abs(data[hoveredIndex].diffMinutes))}{' '}
              {data[hoveredIndex].diffMinutes >= 0 ? 'surplus' : 'deficit'}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">
            Hover over any day bar for exact duration and goal variance.
          </span>
        )}
      </div>
    </div>
  );
}
