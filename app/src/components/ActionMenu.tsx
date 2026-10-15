import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnline } from '@/features/network/useOnline';
import { makeStyles, radius, space, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type MenuAction = { icon: IconName; label: string; danger?: boolean; write?: boolean; onPress: () => void };

// An action that writes (`write`, or any `danger` one) is dimmed and does nothing while offline.
// Drop-down menu behind a `⋯` button, under the top bar on the right (mockup `.menu`).
// `top` / `right` override the position (window coordinates) — e.g. under a note card's `⋯`.
export function ActionMenu({
  visible,
  actions,
  onClose,
  top,
  right,
}: {
  visible: boolean;
  actions: MenuAction[];
  onClose: () => void;
  top?: number;
  right?: number;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { canWrite } = useOnline();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose}>
        <View style={[styles.menu, { top: top ?? insets.top + 60, right: right ?? space.lg }]}>
          {actions.map((a) => {
            const locked = !canWrite && (a.write ?? a.danger);
            return (
              <Pressable
                key={a.label}
                accessibilityRole="button"
                disabled={locked}
                onPress={() => {
                  onClose();
                  a.onPress();
                }}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.bg }, locked && { opacity: 0.4 }]}>
                <Icon name={a.icon} size={20} color={a.danger ? colors.error : colors.text} />
                <AppText color={a.danger ? colors.error : colors.text} numberOfLines={1}>
                  {a.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

export function MoreButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={onPress} hitSlop={8} style={styles.more}>
      <Icon name="more" size={24} color={colors.text} />
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  scrim: { flex: 1 },
  menu: {
    position: 'absolute',
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
}));
