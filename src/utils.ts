/** Parse "DD/MM" date string and compare to today */
export const getDayStatus = (dateStr?: string): 'past' | 'today' | 'future' => {
  if (!dateStr) return 'future';
  const [d, m] = dateStr.split('/').map(Number);
  if (!d || !m) return 'future';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const planDate = new Date(now.getFullYear(), m - 1, d);
  if (planDate.getTime() === today.getTime()) return 'today';
  if (planDate < today) return 'past';
  return 'future';
};

/** Get status of a schedule item considering both day-level and time-level */
export const getItemStatus = (
  dayStatus: 'past' | 'today' | 'future',
  itemTime: string
): 'past' | 'current' | 'future' => {
  if (dayStatus === 'past') return 'past';
  if (dayStatus === 'future') return 'future';
  // today → use time-based logic
  const now = new Date();
  const timeNow = now.getHours() * 60 + now.getMinutes();
  const [h, mn] = itemTime.split(':').map(Number);
  const timeItem = h * 60 + mn;
  if (timeNow > timeItem + 30) return 'past';
  if (timeNow >= timeItem - 15 && timeNow <= timeItem + 30) return 'current';
  return 'future';
};

/** Find which planMain tab to auto-select:
 *  today's day → nearest upcoming → first planMain */
export const getAutoTab = (planMains: { id: string; date?: string }[]): string => {
  const today = planMains.find(pm => getDayStatus(pm.date) === 'today');
  if (today) return today.id;
  const upcoming = planMains.find(pm => getDayStatus(pm.date) === 'future');
  if (upcoming) return upcoming.id;
  return planMains[planMains.length - 1]?.id || 'summary';
};
