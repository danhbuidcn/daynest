import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionMenu, MoreButton } from '@/components/ActionMenu';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/Dialog';
import { Icon, type IconName } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { clockLabel, lunarLabel, occurrenceStartDate, reminderLabel, whenLabel } from '@/features/events/format';
import { OccurrenceActionDialog } from '@/features/events/OccurrenceDialogs';
import { repeatLabel } from '@/features/events/repeatLabel';
import { useEventDelete } from '@/features/events/useEventDelete';
import { useEventsInRange } from '@/features/events/useEvents';
import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { colors, eventColors, radius, space } from '@/theme';

// Màn 13 — `/event/[id]?occurrenceDate=YYYY-MM-DD`: one lap of a (possibly repeating) event.
export default function EventDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { settings } = useAuth();
  const params = useLocalSearchParams<{ id: string; occurrenceDate: string }>();
  const occDate = parseIsoDate(params.occurrenceDate);
  const loaded = useEventsInRange({ from: occDate, to: occDate }, settings.timeZone);
  const event = loaded.data?.events.find((e) => e.id === params.id);
  const occ = loaded.occurrences.find((o) => o.eventId === params.id && o.occurrenceDate === params.occurrenceDate);
  const [menuOpen, setMenuOpen] = useState(false);
  const deleter = useEventDelete({ event, occurrence: occ, onDone: () => router.back(), onError: () => toast(t('events.detail.deleteFailed'), 'error') });

  if (loaded.isLoading) return null;
  if (!event || !occ) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <ScreenHeader title="" onBack={() => router.back()} compact />
      </SafeAreaView>
    );
  }

  const repeat = repeatLabel(t, occ.repeat, event.repeatInterval, occDate, true);
  const reminders = reminderLabel(t, occ.reminderMinutes);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader title="" onBack={() => router.back()} compact action={<MoreButton onPress={() => setMenuOpen(true)} />} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View style={[styles.swatch, { backgroundColor: eventColors[occ.color] }]} />
          <AppText variant="title" style={styles.flex}>
            {occ.title}
          </AppText>
        </View>
        <View style={styles.tag}>
          <Icon name="phone" size={12} color={colors.textMuted} />
          <AppText variant="caption" weight="extrabold" color={colors.textMuted}>
            {t('events.detail.onlyDaynest')}
          </AppText>
        </View>
        <Card>
          <DetailRow first icon="calendar" label={whenLabel(t, occ, settings.use24h, settings.timeZone)} detail={settings.showLunar ? lunarLabel(t, occurrenceStartDate(occ, settings.timeZone)) : undefined} />
          {occ.repeat !== 'none' ? <DetailRow icon="repeat" label={repeat.title} detail={repeat.detail} /> : null}
          {reminders ? (
            <DetailRow
              icon="bell"
              label={reminders}
              detail={occ.allDay ? t('events.detail.allDayReminder', { time: clockLabel(t, { hour: 9, minute: 0, second: 0 }, settings.use24h) }) : undefined}
            />
          ) : null}
          {occ.note ? <DetailRow icon="note" label={occ.note} multiline /> : null}
        </Card>
      </ScrollView>

      <ActionMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        actions={[
          { icon: 'pen', label: t('events.detail.edit'), onPress: () => router.push({ pathname: '/event/edit', params: { eventId: event.id, occurrenceDate: occ.occurrenceDate } }) },
          { icon: 'trash', label: t('events.detail.delete'), danger: true, onPress: deleter.start },
        ]}
      />
      <OccurrenceActionDialog {...deleter.scope} />
      <ConfirmDialog
        visible={deleter.confirm.visible}
        icon="trash"
        title={t('events.detail.deleteTitle')}
        text={t('events.detail.deleteText')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('events.detail.delete')}
        onCancel={deleter.confirm.onCancel}
        onConfirm={deleter.confirm.onConfirm}
      />
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  detail,
  multiline,
  first,
}: {
  icon: IconName;
  label: string;
  detail?: string | null;
  multiline?: boolean;
  first?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !first && styles.divider]}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={20} color={colors.primaryDark} />
      </View>
      <View style={styles.flex}>
        <AppText numberOfLines={multiline ? undefined : 2}>{label}</AppText>
        {detail ? (
          <AppText variant="caption" color={colors.textMuted}>
            {detail}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.lg, paddingTop: space.xs, paddingBottom: space.lg, gap: space.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.xs, paddingVertical: space.sm },
  swatch: { width: 20, height: 20, borderRadius: 7 },
  flex: { flex: 1 },
  tag: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: space.xs,
    height: 24,
    marginHorizontal: space.xs,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
  },
  detailRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  rowIcon: { width: 34, height: 34, borderRadius: radius.icon, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});
