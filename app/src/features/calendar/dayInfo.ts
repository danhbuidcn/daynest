import { holidaysOn, type HolidayId } from '@/lib/holidays';
import { monthGrid, sameDay, type GridDay, type WeekStart } from '@/lib/calendar/monthGrid';
import { toLunar, type LunarDate, type SolarDate } from '@/lib/lunar';

export type DayDetails = SolarDate & {
  lunar: LunarDate;
  lunarLabel: string;
  lunarKey: boolean;
  holidays: HolidayId[];
  isToday: boolean;
};

export type DayInfo = GridDay & DayDetails;

// Mùng 1 and rằm show the lunar month ("1/9", "15/8", leap: "1/6N"); other days only the day number.
export function lunarLabel(lunar: LunarDate): string {
  if (lunar.day !== 1 && lunar.day !== 15) return String(lunar.day);
  return `${lunar.day}/${lunar.month}${lunar.leap ? 'N' : ''}`;
}

// "29/8", leap month "1/6N" — week rows and the list strip show the lunar month every day.
export function lunarDayMonth(lunar: LunarDate): string {
  return `${lunar.day}/${lunar.month}${lunar.leap ? 'N' : ''}`;
}

export function dayDetails(d: SolarDate, today: SolarDate): DayDetails {
  const lunar = toLunar(d);
  return {
    year: d.year,
    month: d.month,
    day: d.day,
    lunar,
    lunarLabel: lunarLabel(lunar),
    lunarKey: lunar.day === 1 || lunar.day === 15,
    holidays: holidaysOn(d, lunar),
    isToday: sameDay(d, today),
  };
}

export function monthDays(year: number, month: number, weekStart: WeekStart, today: SolarDate): DayInfo[] {
  return monthGrid(year, month, weekStart).map((d) => ({ ...d, ...dayDetails(d, today) }));
}
