import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { SEARCH_MAX } from '@/lib/notes';
import { makeStyles, space, useTheme } from '@/theme';

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.box, { borderColor: focused ? colors.primary : colors.border }]}>
      <Icon name="search" size={16} color={colors.textMuted} />
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
          <Icon name="close" size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, type }) => ({
  box: {
    height: 38,
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: 14,
  },
  input: { flex: 1, ...type.body, fontSize: 14, color: colors.text, paddingVertical: 0 },
}));
