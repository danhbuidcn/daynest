import type { SolarDate } from '@/lib/lunar';

export const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

// "Today" follows the user's chosen time zone (F6), not the device's.
export function todayIn(timeZone: string = DEFAULT_TIME_ZONE, now: Date = new Date()): SolarDate {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(now);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return { year: get('year'), month: get('month'), day: get('day') };
  } catch {
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
}
