import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { isNamedColor, NAMED_COLORS, toHex, type AppColor } from '@/lib/colors';
import { eventColors, makeStyles, space, useTheme } from '@/theme';
import { AppText } from './AppText';
import { ColorPickerDialog } from './ColorPickerDialog';

const rainbow = (error: string) => [error, eventColors.lemon, eventColors.mint, eventColors.sky, eventColors.lavender, eventColors.pink];

// Hàng màu (design-system § S4): 6 named colours + "Màu khác". A picked hex shows in that last dot.
export function ColorRow({ value, onChange }: { value: AppColor; onChange: (c: AppColor) => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const [picking, setPicking] = useState(false);
  const { colors } = useTheme();
  const rainbowColors = rainbow(colors.error);
  const custom = !isNamedColor(value);
  return (
    <View style={styles.row}>
      {NAMED_COLORS.map((c) => (
        <Pressable
          key={c}
          accessibilityRole="radio"
          accessibilityLabel={c}
          accessibilityState={{ selected: value === c }}
          onPress={() => onChange(c)}
          style={[styles.ring, value === c && styles.on]}>
          <View style={[styles.dot, { backgroundColor: toHex(c) }]} />
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel={t('colorPicker.other')}
        accessibilityState={{ selected: custom }}
        onPress={() => setPicking(true)}
        style={[styles.ring, custom && styles.on]}>
        {custom ? (
          <View style={[styles.dot, { backgroundColor: toHex(value) }]} />
        ) : (
          <View style={[styles.dot, styles.other]}>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="rainbow" x1="0" y1="0" x2="1" y2="1">
                  {rainbowColors.map((c, i) => (
                    <Stop key={c} offset={i / (rainbowColors.length - 1)} stopColor={c} />
                  ))}
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#rainbow)" />
            </Svg>
            <View style={styles.plus}>
              <AppText variant="micro" weight="extrabold">
                +
              </AppText>
            </View>
          </View>
        )}
      </Pressable>
      {picking ? (
        <ColorPickerDialog
          initial={value}
          onClose={() => setPicking(false)}
          onPick={(hex) => {
            setPicking(false);
            onChange(hex);
          }}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  row: { flexDirection: 'row', gap: 10, paddingVertical: space.sm },
  // Selected: a 2 px ring 3 px outside the 28 px dot (design-system § Hàng màu), visible on any colour.
  // The negative margin keeps the row laid out as 28 px dots.
  ring: { width: 38, height: 38, margin: -5, borderRadius: 19, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  on: { borderColor: colors.text },
  dot: { width: 28, height: 28, borderRadius: 14 },
  other: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  plus: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
}));
