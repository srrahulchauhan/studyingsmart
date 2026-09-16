// Date and Time Helper Functions for StudyFlow

/**
 * Format minutes into "Xh Ym" or "Ym" or "0m"
 */
export function formatDuration(minutes) {
  if (!minutes || isNaN(minutes) || minutes <= 0) return '0m';
  const totalMins = Math.round(minutes);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Format seconds into HH:MM:SS or MM:SS
 */
export function formatSeconds(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00:00';
  const total = Math.floor(totalSeconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format ISO date string or Date object to readable "16 Sep 2026"
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format ISO string to time e.g. "7:00 PM"
 */
export function formatTime(dateInput, format24 = false) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !format24,
  });
}

/**
 * Get Today's date string YYYY-MM-DD
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string or timestamp is today
 */
export function isToday(dateInput) {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Get dates for current week
 */
export function getCurrentWeekDates(weekStartDay = 'Monday') {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ...
  let diff = now.getDate() - currentDay;
  if (weekStartDay === 'Monday') {
    diff += currentDay === 0 ? -6 : 1; // Adjust when day is Sunday
  }
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  const days = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push({
      name: dayNames[i],
      dateString: `${y}-${m}-${day}`,
      date: d,
      displayDate: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
    });
  }
  return days;
}

/**
 * Get greeting based on current local hour
 */
export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
