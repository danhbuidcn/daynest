import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { colors, radius, space } from '@/theme';

const ROW = 48;

// A pick-one list too long for ChoiceDialog (cycle length 21–45): scrolls to the current value.
export function NumberPickerDialog({
  visible,
  title,
  values,
  selected,
  label,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  values: readonly number[];
  selected: number;
  label: (value: number) => string;
  onSelect: (value: number) => void;
  onClose: () => void;
}) {
  const list = useRef<ScrollView>(null);
  const index = Math.max(0, values.indexOf(selected));
  return (
    <DialogShell visible={visible} onClose={onClose} compact>
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      <ScrollView ref={list} style={styles.list} onLayout={() => list.current?.scrollTo({ y: Math.max(0, index - 2) * ROW, animated: false })}>
        {values.map((v) => {
          const on = v === selected;
          return (
            <Pressable
              key={v}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => onSelect(v)}
              style={[styles.option, on && { backgroundColor: colors.primarySoft }]}>
              <AppText weight={on ? 'extrabold' : undefined} style={styles.flex}>
                {label(v)}
              </AppText>
              {on ? <Icon name="check" size={22} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', marginBottom: space.md },
  list: { maxHeight: ROW * 6 },
  flex: { flex: 1 },
  option: { height: ROW, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, borderRadius: radius.button },
});
