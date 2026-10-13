import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { toHex } from '@/lib/colors';
import { colors, radius, space } from '@/theme';
import type { Category } from './note';

// Chip lọc (màn 16): "Tất cả" + one chip per category. `null` = Tất cả.
export function CategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.scroll}>
      <Chip label={t('notes.all')} on={selected === null} onPress={() => onSelect(null)} />
      {categories.map((c) => (
        <Chip
          key={c.id}
          label={c.name}
          dot={toHex(c.color)}
          count={c.noteCount}
          on={selected === c.id}
          onPress={() => onSelect(c.id)}
        />
      ))}
    </ScrollView>
  );
}

export function Chip({
  label,
  dot,
  count,
  on,
  onPress,
}: {
  label: string;
  dot?: string;
  count?: number;
  on?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.chip, on && styles.chipOn]}>
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      <AppText color={on ? colors.white : colors.text} numberOfLines={1} style={styles.label}>
        {label}
      </AppText>
      {count !== undefined ? (
        <AppText variant="caption" color={on ? colors.white : colors.textMuted} style={on && styles.countOn}>
          {count}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm },
  chip: {
    height: 28,
    maxWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { flexShrink: 1, fontSize: 13, lineHeight: 18 },
  countOn: { opacity: 0.85 },
});
