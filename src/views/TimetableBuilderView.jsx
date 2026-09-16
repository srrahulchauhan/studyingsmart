import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useTimer } from '../context/TimerContext';
import { formatDuration, formatTime, getTodayDateString } from '../utils/dateUtils';
import {
  CalendarRange,
  Plus,
  Play,
  Edit2,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import TimetableModal from '../components/modals/TimetableModal';
import TargetGoalModal from '../components/modals/TargetGoalModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

export default function TimetableBuilderView({ onNavigate }) {
  const {
    courses,
    subjects,
    topics,
    activeCourseId,
    timetable,
    targets,
    studySessions,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    addTarget,
    deleteTarget,
  } = useStudy();

  const { startStudy } = useTimer();

  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState(null);
  const [slotToDelete, setSlotToDelete] = useState(null);

  const [isTomorrowModalOpen, setIsTomorrowModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('All'); // 'All' | 'Monday' | ...

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredSlots = timetable.filter(tt => {
    if (activeCourseId && tt.courseId !== activeCourseId) return false;
    if (selectedDay !== 'All' && tt.day !== selectedDay) return false;
    return true;
  });

  const tomorrowTargets = targets.filter(t => t.period === 'Tomorrow' && (!activeCourseId || t.courseId === activeCourseId));

  // Timetable vs Actual comparison for the current day / week
  const comparisonData = timetable
    .filter(tt => !activeCourseId || tt.courseId === activeCourseId)
    .map(slot => {
      const course = courses.find(c => c.id === slot.courseId);
      const subj = subjects.find(s => s.id === slot.subjectId);
      const topic = topics.find(t => t.id === slot.topicId);

      // Sum of actual study sessions matching this course/subject/topic
      const actualMins = studySessions
        .filter(s => s.courseId === slot.courseId && (!slot.subjectId || s.subjectId === slot.subjectId))
        .reduce((sum, s) => sum + (s.actualStudyDuration || 0), 0);

      const plannedMins = slot.targetDuration || 60;
      const diffMins = actualMins - plannedMins;

      return {
        id: slot.id,
        slot,
        courseName: course ? course.name : 'Course',
        subjectName: subj ? subj.name : '—',
        topicName: topic ? topic.name : '—',
        plannedMins,
        actualMins,
        diffMins,
      };
    });

  const handleDuplicateSlot = (slot) => {
    addTimetableSlot({
      ...slot,
      day: slot.day === 'Sunday' ? 'Monday' : daysOfWeek[daysOfWeek.indexOf(slot.day) + 1] || 'Monday',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <CalendarRange className="w-4 h-4" />
            Schedule & Discipline
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Timetable Builder
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Plan recurring study slots across Monday–Sunday and compare planned vs actual study time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsTomorrowModalOpen(true)}
            className="py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            + Tomorrow's Target
          </button>

          <button
            type="button"
            onClick={() => {
              setSlotToEdit(null);
              setIsSlotModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            + Add Schedule Slot
          </button>
        </div>
      </div>

      {/* Tomorrow's Target Callout Section (Section 25) */}
      {tomorrowTargets.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 dark:border-amber-800/60 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tomorrow's Focus Targets
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsTomorrowModalOpen(true)}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              + Add Another Target
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tomorrowTargets.map((tgt) => {
              const c = courses.find(item => item.id === tgt.courseId);
              const s = subjects.find(item => item.id === tgt.subjectId);
              const t = topics.find(item => item.id === tgt.topicId);
              return (
                <div
                  key={tgt.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 shadow-xs flex items-center justify-between"
                >
                  <div className="text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {t ? t.name : s ? s.name : tgt.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {c ? c.name : 'Course'} • Target: {tgt.targetHours}h
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteTarget(tgt.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedDay('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedDay === 'All'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
          }`}
        >
          All Days ({timetable.length})
        </button>
        {daysOfWeek.map((day) => {
          const count = timetable.filter(tt => tt.day === day && (!activeCourseId || tt.courseId === activeCourseId)).length;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDay === day
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              {day} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Timetable Grid or Empty State */}
      {filteredSlots.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CalendarRange className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            No timetable slots scheduled yet.
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
            Build your weekly schedule. Add repeating study slots for Monday to Sunday to maintain consistent study discipline.
          </p>
          <button
            type="button"
            onClick={() => {
              setSlotToEdit(null);
              setIsSlotModalOpen(true);
            }}
            className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-600/25"
          >
            + Schedule First Slot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map((slot) => {
            const course = courses.find(c => c.id === slot.courseId);
            const subj = subjects.find(s => s.id === slot.subjectId);
            const topic = topics.find(t => t.id === slot.topicId);

            return (
              <div
                key={slot.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      {slot.day}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateSlot(slot)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                        title="Duplicate to Next Day"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSlotToEdit(slot);
                          setIsSlotModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlotToDelete(slot)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                    {topic ? topic.name : subj ? subj.name : 'General Study Slot'}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-1">
                    <div>Course: <span className="font-semibold text-slate-700 dark:text-slate-200">{course ? course.name : '—'}</span></div>
                    {subj && <div>Subject: <span className="font-semibold text-slate-700 dark:text-slate-200">{subj.name}</span></div>}
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{slot.startTime} – {slot.endTime}</span>
                    <span className="text-[10px] text-slate-400 font-sans ml-auto">
                      Target: {formatDuration(slot.targetDuration)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {slot.repeat !== 'None' ? `Repeats: ${slot.repeat}` : 'Single Slot'}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      startStudy({
                        courseId: slot.courseId,
                        studyPlanId: slot.studyPlanId,
                        subjectId: slot.subjectId,
                        topicId: slot.topicId,
                      });
                      onNavigate('timer');
                    }}
                    className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Start Session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section 42: TIMETABLE VS ACTUAL TABLE */}
      {comparisonData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 mt-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Timetable Planned vs Actual Analysis
              </h2>
              <p className="text-xs text-slate-400">
                Track whether you met or fell short of scheduled durations.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Day</th>
                  <th className="p-3">Course / Subject</th>
                  <th className="p-3">Planned Time</th>
                  <th className="p-3">Actual Time</th>
                  <th className="p-3">Difference</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {comparisonData.map((item) => {
                  const isBehind = item.diffMins < 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {item.slot.day}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.courseName}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.subjectName}</div>
                      </td>
                      <td className="p-3 font-mono font-medium">
                        {formatDuration(item.plannedMins)}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatDuration(item.actualMins)}
                      </td>
                      <td className={`p-3 font-mono font-bold ${
                        item.diffMins >= 0 ? 'text-emerald-600' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {item.diffMins >= 0 ? `+${formatDuration(item.diffMins)}` : `-${formatDuration(Math.abs(item.diffMins))}`}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.actualMins >= item.plannedMins
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}>
                          {item.actualMins >= item.plannedMins ? 'Goal Met' : 'Behind Schedule'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <TimetableModal
        isOpen={isSlotModalOpen}
        slotToEdit={slotToEdit}
        courseId={activeCourseId}
        onSave={(data) => {
          if (slotToEdit) {
            updateTimetableSlot(slotToEdit.id, data);
          } else {
            addTimetableSlot(data);
          }
        }}
        onClose={() => {
          setIsSlotModalOpen(false);
          setSlotToEdit(null);
        }}
      />

      <TargetGoalModal
        isOpen={isTomorrowModalOpen}
        mode="tomorrow"
        courseId={activeCourseId}
        onSave={(data) => addTarget(data)}
        onClose={() => setIsTomorrowModalOpen(false)}
      />

      <ConfirmDeleteModal
        isOpen={!!slotToDelete}
        title="Delete Schedule Slot?"
        message="Are you sure you want to remove this timetable slot?"
        onConfirm={() => {
          if (slotToDelete) deleteTimetableSlot(slotToDelete.id);
        }}
        onClose={() => setSlotToDelete(null)}
      />
    </div>
  );
}
