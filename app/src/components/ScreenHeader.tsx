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
}: {
  title: string;
  onBack?: () => void;
  // Create/edit forms and multi-select bars close instead of navigating back (F2, F5).
  closeIcon?: boolean;
  action?: ReactNode;
}) {
  return (
    <View style={styles.bar}>
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
  side: { width: 40 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
});
