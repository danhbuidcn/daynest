import { Icon } from '@/components/Icon';
import { useTheme } from '@/theme';
import type { EventOccurrence } from './occurrences';

// Small status icon on event cards/rows (F4 § Mô tả): synced with Google, or waiting to push.
export function SyncIcon({ occurrence }: { occurrence: EventOccurrence }) {
  const { colors } = useTheme();
  const g = occurrence.google;
  if (g?.status === 'pending') return <Icon name="clock" size={14} color={colors.textMuted} />;
  if (g?.linked) return <Icon name="google" size={14} color={colors.textMuted} />;
  return null;
}
