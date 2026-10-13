import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { MAX_YEAR, MIN_YEAR } from '@/lib/lunar';
import { colors, radius, space } from '@/theme';

export function MonthYearPicker({
  visible,
  year,
  month,
  onSelect,
  onClose,
  current,
}: {
  visible: boolean;
  year: number;
  month: number;
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
  // "Tháng này" under the grid (Chi tiêu, S4 mockup 1b).
  current?: { label: string; onPress: () => void };
}) {
  const { t } = useTranslation();
  const [shownYear, setShownYear] = useState(year);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setShownYear(year);
  }

  return (
    <DialogShell visible={visible} onClose={onClose}>
      <View style={styles.head}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.previous')}
          disabled={shownYear <= MIN_YEAR}
          onPress={() => setShownYear((y) => y - 1)}
          hitSlop={8}
          style={styles.nav}>
          <Icon name="back" size={22} color={shownYear <= MIN_YEAR ? colors.border : colors.text} />
        </Pressable>
        <AppText variant="heading">{shownYear}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.next')}
          disabled={shownYear >= MAX_YEAR}
          onPress={() => setShownYear((y) => y + 1)}
          hitSlop={8}
          style={styles.nav}>
          <Icon name="chevron" size={22} color={shownYear >= MAX_YEAR ? colors.border : colors.text} />
        </Pressable>
      </View>
      <View style={styles.grid}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
          const on = shownYear === year && m === month;
          return (
            <Pressable
              key={m}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => onSelect(shownYear, m)}
              style={[styles.option, on && styles.on]}>
              <AppText weight={on ? 'extrabold' : undefined}>{t(`calendar.monthsShort.${m}`)}</AppText>
            </Pressable>
          );
        })}
      </View>
      {current ? <Button variant="secondary" label={current.label} onPress={current.onPress} style={styles.current} /> : null}
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg },
  nav: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  option: { width: '31%', flexGrow: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.button },
  on: { backgroundColor: colors.primarySoft },
  current: { marginTop: space.lg },
});
