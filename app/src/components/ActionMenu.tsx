import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type MenuAction = { icon: IconName; label: string; danger?: boolean; onPress: () => void };

// Drop-down menu behind a `⋯` button, under the top bar on the right (mockup `.menu`).
// `top` overrides the position, measured from the top of the screen.
export function ActionMenu({
  visible,
  actions,
  onClose,
  top,
}: {
  visible: boolean;
  actions: MenuAction[];
  onClose: () => void;
  top?: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose}>
        <View style={[styles.menu, { top: top ?? insets.top + 60 }]}>
          {actions.map((a) => (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                a.onPress();
              }}
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.bg }]}>
              <Icon name={a.icon} size={20} color={a.danger ? colors.error : colors.text} />
              <AppText color={a.danger ? colors.error : colors.text} numberOfLines={1}>
                {a.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

export function MoreButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={onPress} hitSlop={8} style={styles.more}>
      <Icon name="more" size={24} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1 },
  menu: {
    position: 'absolute',
    right: space.lg,
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.button,
    padding: 6,
    shadowColor: colors.text,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  row: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: space.md, borderRadius: radius.icon + 2 },
  more: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
