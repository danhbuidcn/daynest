import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { CycleDrop } from '@/components/CycleDrop';
import { colors, radius, space } from '@/theme';
import type { CycleDay } from '@/lib/cycle';

export function cycleRowText(t: TFunction, c: CycleDay): string {
  return c.kind === 'period' ? t('cycle.periodDay', { n: c.dayNumber }) : t('cycle.predictedRow');
}

export function cycleSummaryText(t: TFunction, c: CycleDay): string {
  if (c.kind === 'period') return t('cycle.summaryDay', { n: c.dayNumber });
  if (!c.isStart) return t('cycle.predictedRow');
  if (c.lateDays > 0) return t('cycle.late', { count: c.lateDays });
  return c.daysUntil > 0 ? t('cycle.summaryIn', { count: c.daysUntil }) : t('cycle.summaryToday');
}

// One line under the date in the Day and List views.
export function CycleLine({ cycle }: { cycle: CycleDay }) {
  const { t } = useTranslation();
  return (
    <View style={styles.line}>
      <CycleDrop predicted={cycle.kind === 'predicted'} size={14} />
      <AppText variant="caption" color={colors.error} weight="bold">
        {cycleRowText(t, cycle)}
      </AppText>
    </View>
  );
}

// Day popup: summary on the left, "Kỳ kinh" button opening the logging screen.
export function CycleSummary({ cycle, onOpen }: { cycle: CycleDay | null; onOpen: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.summary}>
      <CycleDrop predicted={cycle?.kind === 'predicted'} size={16} />
      <AppText variant="caption" color={colors.text} style={styles.flex} numberOfLines={1}>
        {cycle ? cycleSummaryText(t, cycle) : t('cycle.title')}
      </AppText>
      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.button}>
        <AppText variant="caption" weight="extrabold" color={colors.primaryDark}>
          {t('cycle.title')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.lg, paddingBottom: 6 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: space.lg, marginBottom: space.sm, paddingVertical: 6, paddingLeft: space.md, paddingRight: 6, borderRadius: radius.button, backgroundColor: colors.errorSoft },
  flex: { flex: 1, minWidth: 0 },
  button: { height: 28, paddingHorizontal: space.md, borderRadius: radius.pill, backgroundColor: colors.white, justifyContent: 'center' },
});
