import type { TripBlueprint } from './types';

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
  if (timeNow > timeItem) return 'past';
  if (timeNow >= timeItem && timeNow <= timeItem + 30) return 'current';
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

/** Format amount with currency symbol */
export const formatAmount = (amount: number, currency: 'thb' | 'jpy'): string =>
  currency === 'jpy' ? `¥${amount.toLocaleString()}` : `฿${amount.toLocaleString()}`;

/**
 * Migrate old Firestore item format  { thb: number, jpy: number }
 * to new format                      { amount: number, currency: 'thb' | 'jpy' }
 * Items already in new format are returned as-is.
 */
const migrateItem = (raw: any): any => {
  if (typeof raw.amount === 'number' && raw.currency) return raw;
  const currency: 'thb' | 'jpy' = raw.jpy > 0 && raw.thb === 0 ? 'jpy' : 'thb';
  const { thb: _t, jpy: _j, ...rest } = raw;
  return { ...rest, amount: currency === 'jpy' ? (raw.jpy ?? 0) : (raw.thb ?? 0), currency };
};

/**
 * Migrate a raw Firestore trip document to TripBlueprint.
 * Handles:
 *   - old { thb, jpy } item format → { amount, currency }
 *   - old { days } top-level key   → planMains
 */
export const migrateTripBlueprint = (raw: any): TripBlueprint => {
  const rawMains = raw.planMains ?? raw.days ?? [];
  return {
    trip: raw.trip,
    summary: (raw.summary ?? []).map(migrateItem),
    planMains: rawMains.map((pm: any) => ({
      id: pm.id,
      title: pm.title ?? pm.date,
      date: pm.date,
      type: pm.type ?? 'activity',
      desc: pm.desc,
      image: pm.image,
      mapUrl: pm.mapUrl,
      guide: pm.guide,
      schedules: (pm.schedules ?? pm.items ?? []).map(migrateItem),
    })),
  };
};
