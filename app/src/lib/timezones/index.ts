import { tzOffsetMinutesAt } from '@/lib/calendar/timeZone';

// F6 — fixed list (not the device's full IANA database): one well-known zone per region users pick from.
export type TimeZoneEntry = { id: string; vi: string; en: string };

export const TIME_ZONES: readonly TimeZoneEntry[] = [
  { id: 'Pacific/Honolulu', vi: 'Hawaii', en: 'Hawaii' },
  { id: 'America/Anchorage', vi: 'Alaska', en: 'Alaska' },
  { id: 'America/Los_Angeles', vi: 'Los Angeles', en: 'Los Angeles' },
  { id: 'America/Denver', vi: 'Denver', en: 'Denver' },
  { id: 'America/Chicago', vi: 'Chicago', en: 'Chicago' },
  { id: 'America/New_York', vi: 'New York', en: 'New York' },
  { id: 'America/Toronto', vi: 'Toronto', en: 'Toronto' },
  { id: 'America/Mexico_City', vi: 'Mexico City', en: 'Mexico City' },
  { id: 'America/Bogota', vi: 'Bogotá', en: 'Bogotá' },
  { id: 'America/Sao_Paulo', vi: 'São Paulo', en: 'São Paulo' },
  { id: 'America/Argentina/Buenos_Aires', vi: 'Buenos Aires', en: 'Buenos Aires' },
  { id: 'Atlantic/Reykjavik', vi: 'Iceland', en: 'Iceland' },
  { id: 'UTC', vi: 'Giờ quốc tế (UTC)', en: 'Coordinated Universal Time' },
  { id: 'Europe/London', vi: 'Anh', en: 'United Kingdom' },
  { id: 'Europe/Lisbon', vi: 'Bồ Đào Nha', en: 'Portugal' },
  { id: 'Europe/Paris', vi: 'Pháp', en: 'France' },
  { id: 'Europe/Berlin', vi: 'Đức', en: 'Germany' },
  { id: 'Europe/Amsterdam', vi: 'Hà Lan', en: 'Netherlands' },
  { id: 'Europe/Madrid', vi: 'Tây Ban Nha', en: 'Spain' },
  { id: 'Europe/Rome', vi: 'Ý', en: 'Italy' },
  { id: 'Europe/Prague', vi: 'Séc', en: 'Czechia' },
  { id: 'Europe/Warsaw', vi: 'Ba Lan', en: 'Poland' },
  { id: 'Europe/Stockholm', vi: 'Thuỵ Điển', en: 'Sweden' },
  { id: 'Europe/Athens', vi: 'Hy Lạp', en: 'Greece' },
  { id: 'Europe/Kyiv', vi: 'Ukraina', en: 'Ukraine' },
  { id: 'Europe/Istanbul', vi: 'Thổ Nhĩ Kỳ', en: 'Türkiye' },
  { id: 'Europe/Moscow', vi: 'Nga (Moscow)', en: 'Russia (Moscow)' },
  { id: 'Africa/Cairo', vi: 'Ai Cập', en: 'Egypt' },
  { id: 'Africa/Johannesburg', vi: 'Nam Phi', en: 'South Africa' },
  { id: 'Africa/Lagos', vi: 'Nigeria', en: 'Nigeria' },
  { id: 'Asia/Dubai', vi: 'UAE', en: 'United Arab Emirates' },
  { id: 'Asia/Riyadh', vi: 'Ả Rập Xê Út', en: 'Saudi Arabia' },
  { id: 'Asia/Tehran', vi: 'Iran', en: 'Iran' },
  { id: 'Asia/Karachi', vi: 'Pakistan', en: 'Pakistan' },
  { id: 'Asia/Kolkata', vi: 'Ấn Độ', en: 'India' },
  { id: 'Asia/Kathmandu', vi: 'Nepal', en: 'Nepal' },
  { id: 'Asia/Dhaka', vi: 'Bangladesh', en: 'Bangladesh' },
  { id: 'Asia/Yangon', vi: 'Myanmar', en: 'Myanmar' },
  { id: 'Asia/Bangkok', vi: 'Thái Lan', en: 'Thailand' },
  { id: 'Asia/Ho_Chi_Minh', vi: 'Việt Nam', en: 'Vietnam' },
  { id: 'Asia/Phnom_Penh', vi: 'Campuchia', en: 'Cambodia' },
  { id: 'Asia/Vientiane', vi: 'Lào', en: 'Laos' },
  { id: 'Asia/Jakarta', vi: 'Indonesia (Jakarta)', en: 'Indonesia (Jakarta)' },
  { id: 'Asia/Kuala_Lumpur', vi: 'Malaysia', en: 'Malaysia' },
  { id: 'Asia/Singapore', vi: 'Singapore', en: 'Singapore' },
  { id: 'Asia/Manila', vi: 'Philippines', en: 'Philippines' },
  { id: 'Asia/Shanghai', vi: 'Trung Quốc', en: 'China' },
  { id: 'Asia/Hong_Kong', vi: 'Hồng Kông', en: 'Hong Kong' },
  { id: 'Asia/Taipei', vi: 'Đài Loan', en: 'Taiwan' },
  { id: 'Asia/Seoul', vi: 'Hàn Quốc', en: 'South Korea' },
  { id: 'Asia/Tokyo', vi: 'Nhật Bản', en: 'Japan' },
  { id: 'Australia/Perth', vi: 'Úc (Perth)', en: 'Australia (Perth)' },
  { id: 'Australia/Adelaide', vi: 'Úc (Adelaide)', en: 'Australia (Adelaide)' },
  { id: 'Australia/Sydney', vi: 'Úc (Sydney)', en: 'Australia (Sydney)' },
  { id: 'Pacific/Auckland', vi: 'New Zealand', en: 'New Zealand' },
];

// "GMT+7", "GMT-3:30", "GMT+0" — the offset right now (DST zones shift during the year).
export function gmtLabel(timeZone: string, now: Date = new Date()): string {
  const minutes = tzOffsetMinutesAt(now, timeZone);
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const rest = abs % 60;
  return `GMT${sign}${Math.floor(abs / 60)}${rest ? `:${String(rest).padStart(2, '0')}` : ''}`;
}

export function timeZoneName(timeZone: string, lang: 'vi' | 'en'): string {
  const entry = TIME_ZONES.find((z) => z.id === timeZone);
  return entry ? entry[lang] : timeZone;
}

// "Việt Nam (GMT+7)"
export function timeZoneLabel(timeZone: string, lang: 'vi' | 'en', now: Date = new Date()): string {
  return `${timeZoneName(timeZone, lang)} (${gmtLabel(timeZone, now)})`;
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

// Matches either language's name, the IANA id ("saigon" won't match, "ho_chi" will) or "gmt+7", ignoring accents.
export function searchTimeZones(query: string, now: Date = new Date()): TimeZoneEntry[] {
  const q = fold(query.trim());
  if (!q) return [...TIME_ZONES];
  return TIME_ZONES.filter((z) => [z.vi, z.en, z.id, gmtLabel(z.id, now)].some((s) => fold(s).includes(q)));
}
