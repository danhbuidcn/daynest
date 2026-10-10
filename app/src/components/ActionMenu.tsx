import { Pressable, StyleSheet } from 'react-native';

import { colors, space } from '@/theme';
import { AppText } from './AppText';
import { DialogShell } from './Dialog';
import { Icon, type IconName } from './Icon';

export type MenuAction = { icon: IconName; label: string; danger?: boolean; onPress: () => void };

// Menu behind a `⋯` button (event detail: Sửa / Xoá; note card: Xoá / Di chuyển đến).
export function ActionMenu({ visible, actions, onClose }: { visible: boolean; actions: MenuAction[]; onClose: () => void }) {
  return (
    <DialogShell visible={visible} onClose={onClose} compact>
      {actions.map((a) => (
        <Pressable
          key={a.label}
          accessibilityRole="button"
          onPress={() => {
            onClose();
            a.onPress();
          }}
          style={styles.row}>
          <Icon name={a.icon} size={18} color={a.danger ? colors.error : colors.text} />
          <AppText color={a.danger ? colors.error : colors.text}>{a.label}</AppText>
        </Pressable>
      ))}
    </DialogShell>
  );
}

export function MoreButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="More" onPress={onPress} hitSlop={8} style={styles.more}>
      <Icon name="more" size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { height: 48, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.sm },
  more: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
