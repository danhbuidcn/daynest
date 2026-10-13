import type { AppColor } from '@/lib/colors';

// Google Calendar API v3 event — only the fields Daynest reads or writes (F4).
export type GoogleTime = { date?: string; dateTime?: string; timeZone?: string };

export type GoogleReminders = { useDefault?: boolean; overrides?: { method: string; minutes: number }[] };

export type GoogleEvent = {
  id: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  etag?: string;
  updated?: string;
  summary?: string;
  description?: string;
  colorId?: string;
  start?: GoogleTime;
  end?: GoogleTime;
  recurrence?: string[];
  recurringEventId?: string;
  originalStartTime?: GoogleTime;
  reminders?: GoogleReminders;
};

export type DaynestRepeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lunar_yearly';

// Same shape as `EventInput` (features/events/event.ts), restated so lib/ doesn't import features/.
export type EventFields = {
  title: string;
  note: string;
  color: AppColor;
  allDay: boolean;
  startsAt: string | null;
  endsAt: string | null;
  startDate: string | null;
  endDate: string | null;
  repeat: DaynestRepeat;
  repeatInterval: number;
  repeatUntil: string | null;
  lunarMonth: number | null;
  lunarDay: number | null;
  reminderMinutes: number[];
};
