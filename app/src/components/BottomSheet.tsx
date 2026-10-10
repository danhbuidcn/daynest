import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';

// "Sheet từ đáy" — add/edit from a fixed list (reminder thresholds, repeat type), confirmed by
// "Hoàn tất" rather than saved immediately like a ChoiceDialog.
export function BottomSheet({
  visible,
  title,
  cancelLabel,
  doneLabel,
  onCancel,
  onDone,
  children,
}: {
  visible: boolean;
  title: string;
  cancelLabel: string;
  doneLabel: string;
  onCancel: () => void;
  onDone: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.scrim}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={8}>
              <AppText color={colors.textMuted}>{cancelLabel}</AppText>
            </Pressable>
            <AppText variant="heading">{title}</AppText>
            <Pressable accessibilityRole="button" onPress={onDone} hitSlop={8}>
              <AppText weight="extrabold" color={colors.primaryDark}>
                {doneLabel}
              </AppText>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.dialog, borderTopRightRadius: radius.dialog, maxHeight: '80%' },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: space.sm },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
