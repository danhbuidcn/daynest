import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, space } from '@/theme';

export const VIEW_MODES = ['month', 'list', 'week', 'day'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export function ViewModeBar({ value, onChange }: { value: ViewMode; onChange: (mode: ViewMode) => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {VIEW_MODES.map((mode) => {
        const on = mode === value;
        return (
          <Pressable
            key={mode}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(mode)}
            style={[styles.item, on && styles.on]}>
            <AppText weight={on ? 'bold' : undefined} color={on ? colors.white : colors.text} numberOfLines={1}>
              {t(`calendar.modes.${mode}`)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 40,
    marginTop: space.xs,
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    padding: 3,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  on: { backgroundColor: colors.primary },
});
