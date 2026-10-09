import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';

function Shell({ visible, onClose, children, compact }: { visible: boolean; onClose: () => void; children: React.ReactNode; compact?: boolean }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={[styles.box, compact && styles.compact]} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Hộp xác nhận: icon + tiêu đề + mô tả + Huỷ / hành động. */
export function ConfirmDialog({
  visible,
  title,
  text,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  text: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Shell visible={visible} onClose={onCancel}>
      <View style={styles.dangerIcon}>
        <Ionicons name="log-out-outline" size={28} color={colors.error} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {title}
      </AppText>
      <AppText color={colors.textMuted} style={[styles.center, styles.text]}>
        {text}
      </AppText>
      <View style={styles.actions}>
        <Button label={cancelLabel} variant="secondary" onPress={onCancel} style={styles.flex} />
        <Button label={confirmLabel} variant="danger" onPress={onConfirm} style={styles.flex} />
      </View>
    </Shell>
  );
}

/** Hộp chọn: bấm 1 dòng là chọn + đóng, không có nút xác nhận. */
export function ChoiceDialog<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: readonly { value: T; label: string; tag?: string }[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  return (
    <Shell visible={visible} onClose={onClose} compact>
      <AppText variant="heading" style={[styles.center, { marginBottom: space.md }]}>
        {title}
      </AppText>
      {options.map((o) => {
        const on = o.value === selected;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(o.value)}
            style={[styles.option, on && { backgroundColor: colors.primarySoft }]}>
            {o.tag ? (
              <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.tag}>
                {o.tag}
              </AppText>
            ) : null}
            <AppText weight={on ? 'extrabold' : undefined} style={styles.flex}>
              {o.label}
            </AppText>
            {on ? <Ionicons name="checkmark" size={22} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </Shell>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'center', padding: space.xl },
  box: { backgroundColor: colors.surface, borderRadius: radius.dialog, paddingTop: space.xl, paddingHorizontal: 20, paddingBottom: 20 },
  compact: { paddingTop: 20, paddingHorizontal: space.md, paddingBottom: space.md },
  dangerIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.errorSoft,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  center: { textAlign: 'center' },
  text: { marginTop: 6, marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  option: { height: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, borderRadius: radius.button },
  tag: { width: 28 },
});
