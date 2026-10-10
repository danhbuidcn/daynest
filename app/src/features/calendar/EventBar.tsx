import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import type { BarItem } from '@/lib/calendar/eventBars';
import { colors, eventColors } from '@/theme';

export function EventBar({ item }: { item: BarItem }) {
  const background = item.kind === 'holiday' ? colors.error : eventColors[item.color as keyof typeof eventColors];
  const textColor = item.kind === 'holiday' ? colors.white : colors.text;
  return (
    <View style={[styles.bar, { backgroundColor: background }]}>
      <AppText variant="caption" color={textColor} numberOfLines={1}>
        {item.title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 16, borderRadius: 6, paddingHorizontal: 4, justifyContent: 'center' },
});
