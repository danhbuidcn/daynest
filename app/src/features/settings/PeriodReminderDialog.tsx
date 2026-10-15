import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DialogShell } from '@/components/Dialog';
import { makeStyles, radius, space, useTheme } from '@/theme';

const ROW = 40;
const DAYS = [1, 2, 3, 4, 5, 6, 7];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const pad = (n: number) => String(n).padStart(2, '0');

export const formatReminderTime = (hour: number, minute: number) => `${pad(hour)}:${pad(minute)}`;

// Màn 10c — "N days before" + time of day (5-minute steps).
export function PeriodReminderDialog(props: {
  visible: boolean;
  days: number;
  time: string;
  onSave: (days: number, time: string) => void;
  onClose: () => void;
}) {
  // Mounted only while open, so every opening starts from the saved values.
  return props.visible ? <ReminderPicker {...props} /> : null;
}

function ReminderPicker({
  visible,
  days,
  time,
  onSave,
  onClose,
}: {
  visible: boolean;
  days: number;
  time: string;
  onSave: (days: number, time: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const [hour, minute] = time.split(':').map(Number);
  const [d, setD] = useState(days);
  const [h, setH] = useState(hour);
  const [m, setM] = useState((Math.round(minute / 5) * 5) % 60);

  return (
    <DialogShell visible={visible} onClose={onClose}>
      <AppText variant="heading" style={styles.title}>
        {t('cycle.remind')}
      </AppText>
      <View style={styles.heads}>
        <AppText variant="caption" color={colors.textMuted} style={styles.headDays}>
          {t('cycle.before')}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} style={styles.headTime}>
          {t('cycle.at')}
        </AppText>
      </View>
      <View style={styles.columns}>
        <Column values={DAYS} value={d} format={(v) => t('cycle.days', { count: v })} onChange={setD} flex={1.4} />
        <Column values={HOURS} value={h} format={pad} onChange={setH} flex={1} />
        <AppText weight="extrabold" style={styles.colon}>
          :
        </AppText>
        <Column values={MINUTES} value={m} format={pad} onChange={setM} flex={1} />
      </View>
      <View style={styles.actions}>
        <Button label={t('cycle.cancel')} variant="secondary" onPress={onClose} style={styles.flex} />
        <Button label={t('cycle.save')} onPress={() => onSave(d, formatReminderTime(h, m))} style={styles.flex} />
      </View>
    </DialogShell>
  );
}

function Column({
  values,
  value,
  format,
  onChange,
  flex,
}: {
  values: number[];
  value: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  flex: number;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const list = useRef<ScrollView>(null);
  const index = Math.max(0, values.indexOf(value));
  return (
    <ScrollView
      ref={list}
      style={[styles.column, { flex }]}
      nestedScrollEnabled
      onLayout={() => list.current?.scrollTo({ y: Math.max(0, index - 2) * ROW, animated: false })}>
      {values.map((v) => {
        const on = v === value;
        return (
          <Pressable key={v} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => onChange(v)} style={[styles.option, on && styles.optionOn]}>
            <AppText weight={on ? 'extrabold' : undefined} color={on ? colors.primaryDark : colors.text}>
              {format(v)}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  title: { marginBottom: space.md },
  heads: { flexDirection: 'row', marginBottom: space.xs },
  headDays: { flex: 1.4 },
  headTime: { flex: 2.4 },
  columns: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  column: { height: ROW * 5 },
  colon: { width: 10, textAlign: 'center' },
  option: { height: ROW, alignItems: 'center', justifyContent: 'center', borderRadius: radius.button },
  optionOn: { backgroundColor: colors.primarySoft },
  actions: { flexDirection: 'row', gap: 10, marginTop: space.md },
  flex: { flex: 1 },
}));
