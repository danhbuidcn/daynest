import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, space, type as typeScale } from '@/theme';
import { AppText } from './AppText';

// Title/note-style input that grows up to `maxLines` then scrolls — F2/F5's "ô nhập nhiều dòng"
// (design-system § Chữ dài). Shows a "n/max" counter once the text passes 80% of `maxLength`.
export function AutoGrowField({
  value,
  maxLength,
  maxLines,
  variant = 'body',
  style,
  ...input
}: Omit<TextInputProps, 'style' | 'multiline' | 'onContentSizeChange'> & {
  value: string;
  maxLength: number;
  maxLines: number;
  variant?: keyof typeof typeScale;
  style?: object;
}) {
  const lineHeight: number = typeScale[variant].lineHeight;
  const [contentHeight, setContentHeight] = useState<number>(lineHeight);
  const nearLimit = value.length >= maxLength * 0.8;

  return (
    <View>
      <TextInput
        {...input}
        value={value}
        multiline
        maxLength={maxLength}
        onContentSizeChange={(e) => setContentHeight(e.nativeEvent.contentSize.height)}
        scrollEnabled={contentHeight > lineHeight * maxLines}
        placeholderTextColor={colors.textMuted}
        style={[typeScale[variant], styles.input, { height: Math.min(Math.max(contentHeight, lineHeight), lineHeight * maxLines) }, style]}
      />
      {nearLimit ? (
        <AppText variant="caption" color={value.length >= maxLength ? colors.error : colors.textMuted} style={styles.counter}>
          {value.length}/{maxLength}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { color: colors.text, textAlignVertical: 'top', padding: 0 },
  counter: { textAlign: 'right', marginTop: space.xs },
});
