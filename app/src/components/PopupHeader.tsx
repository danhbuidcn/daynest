import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles, space, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

// "Pop-up có tiêu đề" (day popup, quick-add popup, month/year picker): ✕ left, title centered,
// optional round `+` button right.
export function PopupHeader({ title, onClose, onAdd }: { title: ReactNode; onClose: () => void; onAdd?: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.head}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8} style={styles.side}>
        <Icon name="close" size={24} color={colors.text} />
      </Pressable>
      <View style={styles.title}>
        {typeof title === 'string' ? (
          <AppText variant="heading" numberOfLines={1}>
            {title}
          </AppText>
        ) : (
          title
        )}
      </View>
      {onAdd ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Add" onPress={onAdd} hitSlop={8} style={[styles.side, styles.add]}>
          <Icon name="plus" size={18} color={colors.white} />
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: space.md },
  side: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, alignItems: 'center' },
  add: { backgroundColor: colors.primary, borderRadius: 18, width: 36, height: 36, marginHorizontal: 2 },
}));
