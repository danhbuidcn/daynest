import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { toLunar, type SolarDate } from '@/lib/lunar';
import { makeStyles, radius, space, useTheme } from '@/theme';
import type { RepeatKind } from './event';
import { clampInterval } from './eventFormState';
import { shortDate } from './format';

const KINDS: RepeatKind[] = ['none', 'daily', 'weekly', 'monthly', 'yearly', 'lunar_yearly'];

export type RepeatValue = { repeat: RepeatKind; interval: number; until: SolarDate | null };

export function RepeatPicker({
  visible,
  value,
  startDate,
  onCancel,
  onDone,
}: {
  visible: boolean;
  value: RepeatValue;
  startDate: SolarDate;
  onCancel: () => void;
  onDone: (value: RepeatValue) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const [repeat, setRepeat] = useState(value.repeat);
  const [interval, setIntervalValue] = useState(String(value.interval));
  const [until, setUntil] = useState(value.until);
  const [showUntilPicker, setShowUntilPicker] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setRepeat(value.repeat);
      setIntervalValue(String(value.interval));
      setUntil(value.until);
      setShowUntilPicker(false);
    }
  }

  const lunar = toLunar(startDate);

  const confirm = () => onDone({ repeat, interval: repeat === 'lunar_yearly' ? 1 : clampInterval(interval), until });

  return (
    <DialogShell visible={visible} onClose={onCancel}>
      <AppText variant="heading" style={styles.center}>
        {t('events.repeatDialog.title')}
      </AppText>
      <View style={styles.list}>
        {KINDS.map((k) => {
          const on = k === repeat;
          return (
            <Pressable
              key={k}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => setRepeat(k)}
              style={[styles.option, on && styles.optionOn]}>
              <AppText weight={on ? 'extrabold' : undefined} style={styles.flex}>
                {t(`events.repeat.tab${toKey(k)}`)}
              </AppText>
              {on ? <Icon name="check" size={20} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>

      {repeat === 'lunar_yearly' ? (
        <View style={styles.hint}>
          <Icon name="moon" size={16} color={colors.textMuted} />
          <AppText variant="caption" color={colors.textMuted}>
            {t('events.repeatDialog.lunarHint', { day: lunar.day, month: lunar.month })}
          </AppText>
        </View>
      ) : null}

      {repeat !== 'none' && repeat !== 'lunar_yearly' ? (
        <View style={styles.everyRow}>
          <AppText>{t('events.repeatDialog.every')}</AppText>
          <TextInput
            value={interval}
            onChangeText={setIntervalValue}
            onBlur={() => setIntervalValue(String(clampInterval(interval)))}
            keyboardType="number-pad"
            maxLength={2}
            style={styles.numBox}
          />
          <AppText>{t(`events.repeatDialog.unit${toKey(repeat)}`)}</AppText>
        </View>
      ) : null}

      {repeat !== 'none' ? (
        <View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: until !== null }}
            onPress={() => (until === null ? setShowUntilPicker(true) : setUntil(null))}
            style={styles.untilRow}>
            <View style={[styles.checkbox, until !== null && styles.checkboxOn]}>
              {until !== null ? <Icon name="check" size={14} color={colors.white} /> : null}
            </View>
            <AppText style={styles.flex}>{t('events.repeatDialog.until')}</AppText>
            {until !== null ? (
              <Pressable onPress={() => setShowUntilPicker(true)}>
                <AppText weight="bold">
                  {shortDate(until)}
                </AppText>
              </Pressable>
            ) : null}
          </Pressable>
        </View>
      ) : null}

      {showUntilPicker ? (
        <UntilPicker
          value={until ?? startDate}
          minimumDate={startDate}
          onCancel={() => setShowUntilPicker(false)}
          onChange={(d) => {
            setUntil(d);
            setShowUntilPicker(false);
          }}
        />
      ) : null}

      <View style={styles.actions}>
        <Button label={t('common.cancel')} variant="secondary" onPress={onCancel} style={styles.flex} />
        <Button label={t('common.done')} onPress={confirm} style={styles.flex} />
      </View>
    </DialogShell>
  );
}

function toKey(k: RepeatKind): string {
  return k
    .split('_')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');
}

// Minimal wrapper around the native date picker, used only while editing "đến ngày".
function UntilPicker({
  value,
  minimumDate,
  onChange,
  onCancel,
}: {
  value: SolarDate;
  minimumDate: SolarDate;
  onChange: (d: SolarDate) => void;
  onCancel: () => void;
}) {
  return (
    <DateTimePicker
      value={new Date(value.year, value.month - 1, value.day)}
      minimumDate={new Date(minimumDate.year, minimumDate.month - 1, minimumDate.day)}
      mode="date"
      onChange={(event: { type: string }, date?: Date) => {
        if (event.type !== 'set' || !date) return onCancel();
        onChange({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
      }}
    />
  );
}

const useStyles = makeStyles(({ colors, type }) => ({
  center: { textAlign: 'center', marginBottom: space.md },
  list: { gap: 2 },
  option: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm, borderRadius: radius.button },
  optionOn: { backgroundColor: colors.primarySoft },
  flex: { flex: 1 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.sm, marginHorizontal: space.sm },
  everyRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md, marginHorizontal: space.sm },
  numBox: {
    width: 44,
    height: 36,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.border,
    textAlign: 'center',
    ...type.body,
    color: colors.text,
  },
  untilRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md, marginHorizontal: space.sm, height: 40 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.primary },
  actions: { flexDirection: 'row', gap: 10, marginTop: space.lg },
}));
