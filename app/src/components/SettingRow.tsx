import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { makeStyles, radius, space, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export function SettingRow({
  icon,
  label,
  sublabel,
  value,
  onPress,
  danger,
  first,
  trailing,
}: {
  icon: IconName;
  label: string;
  // Second line under the label (e.g. reminder time).
  sublabel?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  first?: boolean;
  // Right-side control (a Switch) instead of value + chevron.
  trailing?: ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !first && styles.divider, pressed && { opacity: 0.6 }]}>
      <View style={[styles.icon, { backgroundColor: danger ? colors.errorSoft : colors.primarySoft }]}>
        <Icon name={icon} size={20} color={danger ? colors.error : colors.primaryDark} />
      </View>
      <View style={styles.label}>
        <AppText color={danger ? colors.error : colors.text}>{label}</AppText>
        {sublabel ? (
          <AppText variant="caption" color={colors.textMuted}>
            {sublabel}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText color={colors.textMuted} numberOfLines={1}>
          {value}
        </AppText>
      ) : null}
      {trailing}
      {onPress && !trailing ? <Icon name="chevron" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  row: { height: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: { width: 34, height: 34, borderRadius: radius.icon, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1 },
}));
