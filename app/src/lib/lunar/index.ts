// Ho Ngoc Duc's algorithm (https://www.informatik.uni-leipzig.de/~duc/amlich/), fixed at UTC+7:
// the Vietnamese lunar calendar does not follow the device time zone.
const TZ = 7;
const SYNODIC_MONTH = 29.530588853;
const NEW_MOON_EPOCH = 2415021.076998695;

export type SolarDate = { year: number; month: number; day: number };
export type LunarDate = { year: number; month: number; day: number; leap: boolean };

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

export function jdFromDate({ year, month, day }: SolarDate): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function jdToDate(jd: number): SolarDate {
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let c1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  c1 = c1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  c1 = c1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  c1 = c1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  c1 = c1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  c1 = c1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  c1 = c1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltaT =
    T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return jd1 + c1 - deltaT;
}

function newMoonDay(k: number): number {
  return Math.floor(newMoon(k) + 0.5 + TZ / 24);
}

function sunLongitudeSector(jdn: number): number {
  const T = (jdn - 0.5 - TZ / 24 - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let dl = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  dl += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let l = (L0 + dl) * dr;
  l -= 2 * Math.PI * Math.floor(l / (2 * Math.PI));
  return Math.floor((l / Math.PI) * 6);
}

// Start (JDN) of the lunar month containing the winter solstice of `year`.
function lunarMonth11(year: number): number {
  const off = jdFromDate({ year, month: 12, day: 31 }) - 2415021;
  const k = Math.floor(off / SYNODIC_MONTH);
  const nm = newMoonDay(k);
  return sunLongitudeSector(nm) >= 9 ? newMoonDay(k - 1) : nm;
}

// Index (from month 11) of the leap month: the first month with no major solar term.
function leapMonthOffset(a11: number): number {
  const k = Math.floor((a11 - NEW_MOON_EPOCH) / SYNODIC_MONTH + 0.5);
  let i = 1;
  let arc = sunLongitudeSector(newMoonDay(k + i));
  let last: number;
  do {
    last = arc;
    i++;
    arc = sunLongitudeSector(newMoonDay(k + i));
  } while (arc !== last && i < 14);
  return i - 1;
}

export function toLunar(date: SolarDate): LunarDate {
  const dayNumber = jdFromDate(date);
  // The mean-month estimate of k can overshoot by one near a new moon (e.g. 7/5/2054), so step back.
  let k = Math.floor((dayNumber - NEW_MOON_EPOCH) / SYNODIC_MONTH) + 1;
  let monthStart = newMoonDay(k);
  while (monthStart > dayNumber) monthStart = newMoonDay(--k);
  let a11 = lunarMonth11(date.year);
  let b11 = a11;
  let year: number;
  if (a11 >= monthStart) {
    year = date.year;
    a11 = lunarMonth11(date.year - 1);
  } else {
    year = date.year + 1;
    b11 = lunarMonth11(date.year + 1);
  }
  const day = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let leap = false;
  let month = diff + 11;
  if (b11 - a11 > 365) {
    const leapDiff = leapMonthOffset(a11);
    if (diff >= leapDiff) {
      month = diff + 10;
      leap = diff === leapDiff;
    }
  }
  if (month > 12) month -= 12;
  if (month >= 11 && diff < 4) year -= 1;
  return { year, month, day, leap };
}

// New-moon index k of the given lunar month, or null if that leap month does not exist.
function lunarMonthIndex(month: number, year: number, leap: boolean): number | null {
  const [a11, b11] =
    month < 11 ? [lunarMonth11(year - 1), lunarMonth11(year)] : [lunarMonth11(year), lunarMonth11(year + 1)];
  const k = Math.floor(0.5 + (a11 - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  let off = month - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = leapMonthOffset(a11);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (leap && month !== leapMonth) return null;
    if (leap || off >= leapOff) off += 1;
  } else if (leap) {
    return null;
  }
  return k + off;
}

export function toSolar(day: number, month: number, year: number, leap = false): SolarDate | null {
  const k = lunarMonthIndex(month, year, leap);
  if (k === null) return null;
  return jdToDate(newMoonDay(k) + day - 1);
}

export function lunarMonthLength(month: number, year: number, leap = false): 29 | 30 {
  const k = lunarMonthIndex(month, year, leap);
  if (k === null) throw new RangeError(`No leap month ${month} in lunar year ${year}`);
  return newMoonDay(k + 1) - newMoonDay(k) === 30 ? 30 : 29;
}

// 0 = no leap month in that lunar year.
export function leapMonthOf(year: number): number {
  for (let m = 1; m <= 12; m++) if (lunarMonthIndex(m, year, true) !== null) return m;
  return 0;
}

// Indexes into the 10 heavenly stems (Giáp…Quý) and 12 earthly branches (Tý…Hợi); names live in locales.
export function canChiYear(year: number): { stem: number; branch: number } {
  return { stem: (year + 6) % 10, branch: (year + 8) % 12 };
}
