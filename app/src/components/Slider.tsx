import { useState } from 'react';
import { View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

const THUMB = 24;

// Whole-number slider from `min` to `max`. Plain touch responders, like the colour picker, so it also works inside a Modal.
export function Slider({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const [width, setWidth] = useState(0);
  const span = Math.max(width - THUMB, 1);
  const fraction = (value - min) / (max - min);

  const move = (e: GestureResponderEvent) => {
    if (!width) return;
    const f = Math.min(1, Math.max(0, (e.nativeEvent.locationX - THUMB / 2) / span));
    onChange(Math.round(min + f * (max - min)));
  };

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={move}
      onResponderMove={move}
      style={styles.hit}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: THUMB / 2 + fraction * span }]} />
      </View>
      <View style={[styles.thumb, { left: fraction * span, borderColor: colors.primary }]} />
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  hit: { flex: 1, height: 40, justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: colors.primary },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.surface,
    borderWidth: 3,
  },
}));
