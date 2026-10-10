import { lunarMonthLength, toLunar, type LunarDate, type SolarDate } from '@/lib/lunar';

export type HolidayId =
  | 'newYear'
  | 'partyFounding'
  | 'valentine'
  | 'womensDay'
  | 'reunification'
  | 'labourDay'
  | 'childrensDay'
  | 'nationalDay'
  | 'vietnameseWomensDay'
  | 'teachersDay'
  | 'christmasEve'
  | 'christmas'
  | 'lunarNewYearEve'
  | 'lunarNewYear'
  | 'lanternFestival'
  | 'hungKings'
  | 'buddhasBirthday'
  | 'doubleFifth'
  | 'vuLan'
  | 'midAutumn'
  | 'kitchenGods';

type Fixed = { month: number; day: number; id: HolidayId };

const SOLAR: Fixed[] = [
  { month: 1, day: 1, id: 'newYear' },
  { month: 2, day: 3, id: 'partyFounding' },
  { month: 2, day: 14, id: 'valentine' },
  { month: 3, day: 8, id: 'womensDay' },
  { month: 4, day: 30, id: 'reunification' },
  { month: 5, day: 1, id: 'labourDay' },
  { month: 6, day: 1, id: 'childrensDay' },
  { month: 9, day: 2, id: 'nationalDay' },
  { month: 10, day: 20, id: 'vietnameseWomensDay' },
  { month: 11, day: 20, id: 'teachersDay' },
  { month: 12, day: 24, id: 'christmasEve' },
  { month: 12, day: 25, id: 'christmas' },
];

const LUNAR: Fixed[] = [
  { month: 1, day: 1, id: 'lunarNewYear' },
  { month: 1, day: 2, id: 'lunarNewYear' },
  { month: 1, day: 3, id: 'lunarNewYear' },
  { month: 1, day: 15, id: 'lanternFestival' },
  { month: 3, day: 10, id: 'hungKings' },
  { month: 4, day: 15, id: 'buddhasBirthday' },
  { month: 5, day: 5, id: 'doubleFifth' },
  { month: 7, day: 15, id: 'vuLan' },
  { month: 8, day: 15, id: 'midAutumn' },
  { month: 12, day: 23, id: 'kitchenGods' },
];

export function holidaysOn(date: SolarDate, lunar: LunarDate = toLunar(date)): HolidayId[] {
  const ids = SOLAR.filter((h) => h.month === date.month && h.day === date.day).map((h) => h.id);
  if (lunar.leap) return ids;
  for (const h of LUNAR) if (h.month === lunar.month && h.day === lunar.day) ids.push(h.id);
  if (lunar.month === 12 && lunar.day === lunarMonthLength(12, lunar.year)) ids.push('lunarNewYearEve');
  return ids;
}
