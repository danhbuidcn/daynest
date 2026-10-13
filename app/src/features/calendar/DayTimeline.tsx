import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View, type RefreshControlProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { clockLabel } from '@/features/events/format';
import type { EventOccurrence } from '@/features/events/occurrences';
import { layoutDay } from '@/lib/calendar/dayLayout';
import { timeOfDayIn } from '@/lib/calendar/timeZone';
import { toHex } from '@/lib/colors';
import { colors, space } from '@/theme';
import type { OccurrenceSpan } from './dayOccurrences';

const HOUR_HEIGHT = 56;
export const LABEL_WIDTH = 56;
const TOP_PAD = space.sm;
const DEFAULT_SCROLL_HOUR = 8;
// 30% of the event colour over the surface, as in mockup màn 3.
const BLOCK_ALPHA = '4D';
// Below this a `body` title (22) plus 4+4 padding no longer fits, so it drops to `caption`.
const COMPACT_BLOCK = 30;
// Title (22) + time line (16) + padding (8): any shorter and the time line would be cut in half.
const TWO_LINE_BLOCK = 46;

const yOf = (minutes: number) => TOP_PAD + (minutes / 60) * HOUR_HEIGHT;

// Màn 3 hour grid 0–23: timed blocks (overlaps side by side) and the current-time line on today.
export function DayTimeline({
  spans,
  isToday,
  use24h,
  timeZone,
  onPressOccurrence,
  onPressHour,
  refreshControl,
}: {
  spans: OccurrenceSpan[];
  isToday: boolean;
  use24h: boolean;
  timeZone: string;
  onPressOccurrence: (o: EventOccurrence) => void;
  // Empty part of an hour row → new event at that hour (F1).
  onPressHour: (hour: number) => void;
  refreshControl?: ReactElement<RefreshControlProps>;
}) {
  const { t } = useTranslation();
  const scroll = useRef<ScrollView>(null);
  const [nowMinutes, setNowMinutes] = useState(() => minutesNow(timeZone));
  const blocks = useMemo(() => layoutDay(spans), [spans]);
  const byId = useMemo(() => new Map(spans.map((s) => [s.id, s.occurrence])), [spans]);

  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => setNowMinutes(minutesNow(timeZone)), 60_000);
    return () => clearInterval(id);
  }, [isToday, timeZone]);

  // Open at the current hour on today, otherwise at the first event (or 08:00).
  const firstStart = blocks.length > 0 ? Math.min(...blocks.map((b) => b.top)) : DEFAULT_SCROLL_HOUR * 60;
  const scrollMinutes = isToday ? nowMinutes - 60 : firstStart - 30;
  useEffect(() => {
    scroll.current?.scrollTo({ y: Math.max(0, yOf(scrollMinutes) - TOP_PAD), animated: false });
    // Only when the shown day changes, not on every minute tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spans, isToday]);

  return (
    <ScrollView ref={scroll} style={styles.flex} contentContainerStyle={styles.content} refreshControl={refreshControl}>
      {Array.from({ length: 24 }, (_, hour) => (
        <Pressable
          key={hour}
          accessibilityRole="button"
          onPress={() => onPressHour(hour)}
          style={({ pressed }) => [styles.hour, pressed && styles.hourPressed]}>
          <AppText variant="caption" color={colors.textMuted} style={styles.hourLabel}>
            {clockLabel(t, { hour, minute: 0, second: 0 }, use24h)}
          </AppText>
        </Pressable>
      ))}
      <View style={styles.blocks} pointerEvents="box-none">
        {blocks.map((b) => {
          const occ = byId.get(b.id)!;
          const color = toHex(occ.color);
          const height = Math.max((b.height / 60) * HOUR_HEIGHT - 4, 20);
          const compact = height < COMPACT_BLOCK;
          return (
            <Pressable
              key={b.id}
              accessibilityRole="button"
              accessibilityLabel={occ.title}
              onPress={() => onPressOccurrence(occ)}
              style={({ pressed }) => [
                styles.block,
                {
                  top: yOf(b.top),
                  height,
                  left: `${(b.column / b.columns) * 100}%`,
                  width: `${100 / b.columns}%`,
                },
                pressed && styles.pressed,
              ]}>
              <View
                style={[
                  styles.blockInner,
                  compact && styles.blockCompact,
                  b.height <= 60 && styles.blockCentered,
                  { backgroundColor: color + BLOCK_ALPHA, borderLeftColor: color },
                ]}>
                <AppText variant={compact ? 'caption' : 'body'} numberOfLines={1} ellipsizeMode="clip">
                  {occ.title}
                </AppText>
                {height >= TWO_LINE_BLOCK ? (
                  <AppText variant="caption" color={colors.textMuted} numberOfLines={1} ellipsizeMode="clip">
                    {`${clockLabel(t, timeOfDayIn(new Date(occ.startsAt!), timeZone), use24h)} – ${clockLabel(t, timeOfDayIn(new Date(occ.endsAt!), timeZone), use24h)}`}
                  </AppText>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {isToday ? (
        <View style={[styles.now, { top: yOf(nowMinutes) - 1 }]} pointerEvents="none">
          <View style={styles.nowDot} />
        </View>
      ) : null}
    </ScrollView>
  );
}

function minutesNow(timeZone: string): number {
  const now = timeOfDayIn(new Date(), timeZone);
  return now.hour * 60 + now.minute;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: TOP_PAD, paddingBottom: space.lg, marginHorizontal: space.lg },
  hour: { height: HOUR_HEIGHT, borderTopWidth: 1, borderTopColor: colors.border },
  hourPressed: { backgroundColor: colors.primarySoft },
  hourLabel: { width: LABEL_WIDTH - 4, marginTop: -8, backgroundColor: colors.bg },
  blocks: { position: 'absolute', top: 0, bottom: 0, left: LABEL_WIDTH + 6, right: 0 },
  block: { position: 'absolute', paddingRight: 4 },
  blockInner: { flex: 1, borderRadius: 12, borderLeftWidth: 4, paddingVertical: 4, paddingHorizontal: space.sm, overflow: 'hidden' },
  blockCompact: { paddingVertical: 2 },
  blockCentered: { justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  now: { position: 'absolute', left: LABEL_WIDTH, right: 0, height: 2, backgroundColor: colors.error },
  nowDot: { position: 'absolute', left: -4, top: -4, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error },
});
