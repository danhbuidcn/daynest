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
}: {
  title: string;
  onBack?: () => void;
  // Create/edit forms and multi-select bars close instead of navigating back (F2, F5).
  closeIcon?: boolean;
  action?: ReactNode;
  // Mockup `.topbar` (8 / 12 padding) — screens with no title, e.g. event detail.
  compact?: boolean;
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
      <AppText variant="title" style={styles.title} numberOfLines={1}>
        {title}
      </AppText>
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
});
