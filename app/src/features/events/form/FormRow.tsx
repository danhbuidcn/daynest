import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { colors, space } from '@/theme';

// One line of the event form card: icon · label · optional trailing control / chevron.
export function FormRow({
  icon,
  label,
  trailing,
  onPress,
  chevron,
  indent,
}: {
  icon: IconName;
  label: string;
  trailing?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  indent?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.row, indent && styles.indent]}>
      <Icon name={icon} size={20} color={colors.textMuted} />
      <AppText style={styles.label} numberOfLines={1}>
        {label}
      </AppText>
      {trailing}
      {chevron ? <Icon name="chevron" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, height: 44 },
  indent: { paddingLeft: space.xl },
  label: { flex: 1 },
});
