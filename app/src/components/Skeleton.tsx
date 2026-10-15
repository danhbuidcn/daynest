import { useEffect } from 'react';
import { Animated, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, radius, space } from '@/theme';

// One shared pulse for every grey block on screen: it runs only while some block is mounted.
const pulse = new Animated.Value(0.6);
let mounted = 0;
let loop: Animated.CompositeAnimation | null = null;

function usePulse() {
  useEffect(() => {
    if (mounted++ === 0) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.6, duration: 600, useNativeDriver: true }),
        ]),
      );
      loop.start();
    }
    return () => {
      if (--mounted === 0) {
        loop?.stop();
        loop = null;
      }
    };
  }, []);
  return pulse;
}

// Grey placeholder shown while a screen has nothing on the device yet (spec S6 §4).
export function Skeleton({ width, height, round, style }: { width?: DimensionValue; height: number; round?: boolean; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  const opacity = usePulse();
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { width, height, borderRadius: round ? height / 2 : 6, opacity }, style]}
    />
  );
}

// Rows of "tick + two lines": todo lists, event lists.
export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  const styles = useStyles();
  return (
    <View style={styles.rows}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={22} height={22} round />
          <View style={styles.lines}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="35%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

// Two columns of note cards.
export function SkeletonCards({ rows = 3 }: { rows?: number }) {
  const styles = useStyles();
  return (
    <View style={styles.cards}>
      {Array.from({ length: rows * 2 }, (_, i) => (
        <Skeleton key={i} height={i % 3 === 0 ? 150 : 110} style={styles.card} />
      ))}
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  block: { backgroundColor: colors.border },
  rows: { gap: space.lg, paddingVertical: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  lines: { flex: 1, gap: space.xs },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingVertical: space.sm, paddingHorizontal: space.lg },
  card: { width: '47%', borderRadius: radius.card },
}));
