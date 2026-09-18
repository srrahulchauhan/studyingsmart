import React from 'react';
import PapaStudyCycleTimer from '../components/timer/PapaStudyCycleTimer';

export default function StudyTimerView() {
  return (
    <div className="space-y-2.5 animate-fadeIn pb-4 max-w-3xl mx-auto">
      <PapaStudyCycleTimer />
    </div>
  );
}
