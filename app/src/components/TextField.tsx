import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, space, type as typeScale } from '@/theme';
import { AppText } from './AppText';

export function TextField({
  label,
  hint,
  error,
  locked,
  ...input
}: TextInputProps & { label: string; hint?: string; error?: string | null; locked?: boolean }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;
  return (
    <View>
      <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.label}>
        {label}
      </AppText>
      <View style={[styles.box, { borderColor }, locked && styles.locked]}>
        <TextInput
          {...input}
          editable={!locked}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[styles.input, { color: locked ? colors.textMuted : colors.text }]}
          placeholderTextColor={colors.textMuted}
        />
        {locked ? <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} /> : null}
      </View>
      {error || hint ? (
        <AppText variant="caption" color={error ? colors.error : colors.textMuted} style={styles.hint}>
          {error || hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginHorizontal: space.xs, marginBottom: 6 },
  box: {
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    gap: space.sm,
  },
  locked: { backgroundColor: colors.bg },
  input: { flex: 1, ...typeScale.body, paddingVertical: 0 },
  hint: { marginHorizontal: space.xs, marginTop: 6 },
});
