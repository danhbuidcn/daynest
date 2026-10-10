import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export function DialogShell({
  visible,
  onClose,
  children,
  compact,
  large,
  boxStyle,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  compact?: boolean;
  // Narrower side margins + taller box — day popup, pop-ups with a scrollable list.
  large?: boolean;
  boxStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[styles.scrim, large && styles.scrimLarge]} onPress={onClose}>
        <Pressable style={[styles.box, compact && styles.compact, large && styles.boxLarge, boxStyle]} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ConfirmDialog({
  visible,
  icon = 'logout',
  title,
  text,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  icon?: IconName;
  title: string;
  text: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogShell visible={visible} onClose={onCancel}>
      <View style={styles.dangerIcon}>
        <Icon name={icon} size={28} color={colors.error} />
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
    </DialogShell>
  );
}

export function AlertDialog({
  visible,
  tone = 'primary',
  icon,
  title,
  text,
  buttonLabel,
  onClose,
}: {
  visible: boolean;
  tone?: 'primary' | 'warning';
  icon: IconName;
  title: string;
  text: string;
  buttonLabel: string;
  onClose: () => void;
}) {
  return (
    <DialogShell visible={visible} onClose={onClose}>
      <View style={[styles.alertIcon, tone === 'warning' ? styles.alertIconWarning : styles.alertIconPrimary]}>
        <Icon name={icon} size={28} color={tone === 'warning' ? colors.warning : colors.primaryDark} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {title}
      </AppText>
      <AppText color={colors.textMuted} style={[styles.center, styles.text]}>
        {text}
      </AppText>
      <Button label={buttonLabel} onPress={onClose} />
    </DialogShell>
  );
}

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
    <DialogShell visible={visible} onClose={onClose} compact>
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
            {on ? <Icon name="check" size={22} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'center', padding: space.xl },
  scrimLarge: { padding: space.md },
  box: { backgroundColor: colors.surface, borderRadius: radius.dialog, paddingTop: space.xl, paddingHorizontal: 20, paddingBottom: 20 },
  boxLarge: { maxHeight: '85%', paddingTop: space.lg },
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
  alertIcon: { width: 56, height: 56, borderRadius: 20, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  alertIconPrimary: { backgroundColor: colors.primarySoft },
  alertIconWarning: { backgroundColor: colors.warningSoft },
  center: { textAlign: 'center' },
  text: { marginTop: 6, marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  option: { height: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, borderRadius: radius.button },
  tag: { width: 28 },
});
