import type { TFunction } from 'i18next';

import { toLunar, type SolarDate } from '@/lib/lunar';
import type { RepeatKind } from './event';

function capitalize(k: string): string {
  return k[0].toUpperCase() + k.slice(1);
}

// Human label for a repeat rule — "Hằng tuần" (interval 1) or "Mỗi 2 tuần" (interval > 1), plus a
// detail line for the lunar case ("Mỗi năm vào 12/9 âm lịch"). Used by the form and the detail screen.
export function repeatLabel(t: TFunction, repeat: RepeatKind, interval: number, startDate: SolarDate): { title: string; detail: string | null } {
  if (repeat === 'none') return { title: t('events.repeat.tabNone'), detail: null };
  if (repeat === 'lunar_yearly') {
    const l = toLunar(startDate);
    return { title: t('events.repeat.tabLunarYearly'), detail: t('events.repeatDialog.lunarHint', { day: l.day, month: l.month }) };
  }
  const title = interval === 1 ? t(`events.repeat.single${capitalize(repeat)}`) : t(`events.repeat.every${capitalize(repeat)}`, { n: interval });
  return { title, detail: null };
}
