import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/features/auth/AuthProvider';
import type { EventColor } from '@/features/events/event';
import { todayIn } from '@/lib/calendar/timeZone';
import { checklistProgress, noteHeadline } from '@/lib/notes';
import { colors, eventColors, radius, shadow, space } from '@/theme';
import type { Note } from './note';

const pad = (n: number) => String(n).padStart(2, '0');

// Thẻ note (màn 16): viền trái màu danh mục · tiêu đề 1 dòng · 3 dòng nội dung, or "2/5 mục" when the
// note has a checklist · ngày · ghim · `⋯`. `onMore` gets the window position of `⋯` to anchor the menu.
export function NoteCard({
  note,
  color,
  dateLabel,
  onPress,
  onMore,
}: {
  note: Note;
  color: EventColor | null;
  dateLabel?: (date: string) => string;
  onPress?: () => void;
  onMore?: (anchor: { x: number; y: number; width: number; height: number }) => void;
}) {
  const { t } = useTranslation();
  const { settings } = useAuth();
  const moreRef = useRef<View>(null);
  const progress = checklistProgress(note.checklist);
  const changed = todayIn(settings.timeZone, new Date(note.deletedAt ?? note.updatedAt));
  const thisYear = changed.year === todayIn(settings.timeZone).year;
  const date = `${pad(changed.day)}/${pad(changed.month)}${thisYear ? '' : `/${changed.year}`}`;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderLeftColor: color ? eventColors[color] : colors.border }, pressed && styles.pressed]}>
      {note.pinned ? (
        <View style={styles.pin}>
          <Icon name="pin" size={16} color={colors.primaryDark} />
        </View>
      ) : null}
      <AppText variant="heading" numberOfLines={1} style={styles.title}>
        {noteHeadline(note) || t('notes.untitled')}
      </AppText>
      {progress.total === 0 && note.title.trim() && note.body.trim() ? (
        <AppText color={colors.textMuted} numberOfLines={3}>
          {note.body.trim()}
        </AppText>
      ) : null}
      {progress.total > 0 ? (
        <View style={styles.progress}>
          <Icon name="checklist" size={14} color={colors.primaryDark} />
          <AppText variant="caption" weight="extrabold" color={colors.primaryDark}>
            {t('notes.progress', { done: progress.done, total: progress.total })}
          </AppText>
        </View>
      ) : null}
      <View style={styles.foot}>
        <AppText variant="caption" color={colors.textMuted}>
          {dateLabel ? dateLabel(date) : date}
        </AppText>
        {onMore ? (
          <Pressable
            ref={moreRef}
            accessibilityRole="button"
            accessibilityLabel="More"
            hitSlop={10}
            onPress={() => moreRef.current?.measureInWindow((x, y, width, height) => onMore({ x, y, width, height }))}>
            <Icon name="more" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderLeftWidth: 4,
    paddingTop: space.md,
    paddingRight: space.md,
    paddingBottom: 10,
    paddingLeft: 14,
    gap: 6,
    ...shadow,
  },
  pressed: { opacity: 0.7 },
  pin: { position: 'absolute', right: 10, top: space.md },
  title: { paddingRight: 18 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
