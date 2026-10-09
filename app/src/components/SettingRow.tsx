import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';

type IconName = keyof typeof Ionicons.glyphMap;

export function SettingRow({
  icon,
  label,
  value,
  onPress,
  danger,
  first,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  first?: boolean;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !first && styles.divider, pressed && { opacity: 0.6 }]}>
      <View style={[styles.icon, { backgroundColor: danger ? colors.errorSoft : colors.primarySoft }]}>
        <Ionicons name={icon} size={20} color={danger ? colors.error : colors.primaryDark} />
      </View>
      <AppText style={styles.label} color={danger ? colors.error : colors.text}>
        {label}
      </AppText>
      {value ? <AppText color={colors.textMuted}>{value}</AppText> : null}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { height: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: { width: 34, height: 34, borderRadius: radius.icon, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1 },
});
