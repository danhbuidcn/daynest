import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { SEARCH_MAX } from '@/lib/notes';
import { colors, space, type as typeScale } from '@/theme';

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.box, { borderColor: focused ? colors.primary : colors.border }]}>
      <Icon name="search" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        maxLength={SEARCH_MAX}
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.input}
      />
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear" hitSlop={10} onPress={() => onChange('')}>
          <Icon name="close" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 44,
    marginHorizontal: space.lg,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: 14,
  },
  input: { flex: 1, ...typeScale.body, color: colors.text, paddingVertical: 0 },
});
