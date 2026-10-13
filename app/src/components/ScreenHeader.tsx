import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

export function ScreenHeader({
  title,
  onBack,
  closeIcon,
  action,
  compact,
  onPressTitle,
  titleHint,
}: {
  title: string;
  onBack?: () => void;
  // Create/edit forms and multi-select bars close instead of navigating back (F2, F5).
  closeIcon?: boolean;
  action?: ReactNode;
  // Mockup `.topbar` (8 / 12 padding) — screens with no title, e.g. event detail.
  compact?: boolean;
  // Create form: the title is a "Todo ▾" button that reopens the `+` popup (S5).
  onPressTitle?: () => void;
  titleHint?: string;
}) {
  return (
    <View style={[styles.bar, compact && styles.compact]}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} hitSlop={8} style={styles.back}>
            <Icon name={closeIcon ? 'close' : 'back'} size={closeIcon ? 22 : 24} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
      {onPressTitle ? (
        <View style={styles.titleSlot}>
          <Pressable accessibilityRole="button" accessibilityHint={titleHint} onPress={onPressTitle} hitSlop={8} style={styles.titleButton}>
            <AppText variant="title" numberOfLines={1}>
              {title}
            </AppText>
            <Icon name="chevronDown" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <AppText variant="title" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
      )}
      <View style={styles.side}>{action}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingTop: 14, paddingBottom: space.md },
  compact: { paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.sm },
  side: { width: 40 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
  titleSlot: { flex: 1, alignItems: 'center' },
  titleButton: { flexDirection: 'row', alignItems: 'center', gap: space.xs, height: 40, paddingLeft: space.lg, paddingRight: space.md },
});
