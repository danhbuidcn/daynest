import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useErrorToast } from '@/features/network/useErrorToast';
import { useAuth } from '@/features/auth/AuthProvider';
import { WeekdayRow } from '@/features/calendar/MonthView';
import { usePeriodDays, useSavePeriodDays } from '@/features/cycle/usePeriodDays';
import { useOnline } from '@/features/network/useOnline';
import { addMonths, isoDate, weekdayOf } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { autoTickDays, groupPeriods, periodLength } from '@/lib/cycle';
import { tapLight } from '@/lib/haptics';
import { jdFromDate, jdToDate } from '@/lib/lunar';
import { makeStyles, space, useTheme } from '@/theme';

const MONTHS_SHOWN = 12;

// Màn 9 / 9b — Kỳ kinh: months scroll down to this one; tap a day to tick or untick it.
export default function PeriodScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const failed = useErrorToast();
  const { canWrite } = useOnline();
  const { settings } = useAuth();
  const today = useMemo(() => todayIn(settings.timeZone), [settings.timeZone]);
  const todayIso = isoDate(today);
  const { data, isPending, isError, refetch } = usePeriodDays(settings.timeZone);
  const save = useSavePeriodDays();
  // Null until the first tap: the saved days are shown as they are, even if they load after the screen opens.
  const [edited, setEdited] = useState<Set<string> | null>(null);
  const ticked = useMemo(() => edited ?? (data ? new Set(data) : null), [edited, data]);
  const scroller = useRef<ScrollView>(null);

  const length = useMemo(() => periodLength(groupPeriods([...(ticked ?? [])]), settings.periodLength), [ticked, settings.periodLength]);
  const months = useMemo(
    () => Array.from({ length: MONTHS_SHOWN }, (_, i) => addMonths(today.year, today.month, i - (MONTHS_SHOWN - 1))),
    [today],
  );

  const onTap = (iso: string) => {
    if (!ticked || iso > todayIso) return;
    tapLight();
    const next = new Set(ticked);
    if (next.has(iso)) next.delete(iso);
    else for (const day of autoTickDays(iso, ticked, todayIso, length)) next.add(day);
    setEdited(next);
  };

  const onSave = () => {
    if (!ticked || !data) return;
    const before = new Set(data);
    save.mutate(
      { add: [...ticked].filter((d) => !before.has(d)), remove: data.filter((d) => !ticked.has(d)) },
      {
        onSuccess: () => router.back(),
        onError: failed('settings.saveFailed'),
      },
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader title={t('cycle.title')} onBack={() => router.back()} />
      <View style={styles.weekdays}>
        <WeekdayRow weekStart={settings.weekStart} />
      </View>
      {isError ? (
        <View style={styles.center}>
          <AppText color={colors.textMuted}>{t('cycle.loadFailed')}</AppText>
          <Button label={t('cycle.retry')} variant="secondary" onPress={() => refetch()} />
        </View>
      ) : isPending || !ticked ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView ref={scroller} style={styles.flex} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}>
          {months.map((m) => (
            <MonthBlock key={`${m.year}-${m.month}`} year={m.year} month={m.month} weekStart={settings.weekStart} todayIso={todayIso} ticked={ticked} onTap={onTap} />
          ))}
        </ScrollView>
      )}
      <View style={styles.footer}>
        <Button label={t('cycle.save')} onPress={onSave} disabled={!ticked || save.isPending || !canWrite} />
      </View>
    </SafeAreaView>
  );
}

function MonthBlock({
  year,
  month,
  weekStart,
  todayIso,
  ticked,
  onTap,
}: {
  year: number;
  month: number;
  weekStart: 0 | 1;
  todayIso: string;
  ticked: Set<string>;
  onTap: (iso: string) => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const first = jdFromDate({ year, month, day: 1 });
  const lead = (weekdayOf({ year, month, day: 1 }) - weekStart + 7) % 7;
  const count = jdFromDate({ ...addMonths(year, month, 1), day: 1 }) - first;
  const cells = [
    ...Array.from({ length: lead }, (_, i) => <View key={`lead-${i}`} style={styles.cell} />),
    ...Array.from({ length: count }, (_, i) => {
      const date = jdToDate(first + i);
      const iso = isoDate(date);
      return <DayCell key={iso} day={date.day} iso={iso} todayIso={todayIso} on={ticked.has(iso)} onTap={onTap} />;
    }),
  ];
  return (
    <View>
      <AppText variant="heading" style={styles.monthTitle}>
        {t('calendar.monthTitle', { month: t(`calendar.months.${month}`), year })}
      </AppText>
      <View style={styles.grid}>{cells}</View>
    </View>
  );
}

function DayCell({ day, iso, todayIso, on, onTap }: { day: number; iso: string; todayIso: string; on: boolean; onTap: (iso: string) => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const future = iso > todayIso;
  const isToday = iso === todayIso;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on, disabled: future }}
      disabled={future}
      onPress={() => onTap(iso)}
      style={[styles.cell, future && styles.future]}>
      <AppText weight={isToday ? 'extrabold' : 'semibold'} color={isToday ? colors.primaryDark : colors.text}>
        {day}
      </AppText>
      {future ? (
        <View style={styles.circle} />
      ) : (
        <View style={[styles.circle, styles.circleBorder, on && styles.circleOn]}>{on ? <Icon name="check" size={14} color={colors.white} /> : null}</View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  weekdays: { paddingHorizontal: space.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  monthTitle: { textAlign: 'center', paddingTop: 14, paddingBottom: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: space.md },
  cell: { width: '14.28%', alignItems: 'center', gap: 3, paddingBottom: 6 },
  future: { opacity: 0.45 },
  circle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  circleBorder: { borderWidth: 2, borderColor: colors.border },
  circleOn: { backgroundColor: colors.error, borderColor: colors.error },
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.lg },
}));
