import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ColorPickerDialog } from '@/components/ColorPickerDialog';
import { SegmentedBar } from '@/components/SegmentedBar';
import { buildCustomPalette } from '@/lib/theme/resolveTheme';
import { PALETTES, THEME_IDS } from '@/lib/theme/palettes';
import type { ThemeChoice } from '@/lib/theme/appearance';
import { eventColors, makeStyles, space, useAppearance, useTheme } from '@/theme';

const RAINBOW = ['#E9787B', eventColors.lemon, eventColors.mint, eventColors.sky, eventColors.lavender, eventColors.pink];
const DEFAULT_CUSTOM = '#FF7A59';
const SIZE = 44;

function Swatch({ choice, primary, dark }: { choice: ThemeChoice; primary: string | null; dark: boolean }) {
  const styles = useStyles();
  let face;
  if (choice === 'system') {
    face = (
      <Svg width={SIZE} height={SIZE}>
        <Rect width={SIZE} height={SIZE} fill={PALETTES.mint.bg} />
        <Path d={`M${SIZE} 0V${SIZE}H0Z`} fill={PALETTES.dark.bg} />
      </Svg>
    );
  } else if (choice === 'custom' && !primary) {
    face = (
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id="r" x1="0" y1="0" x2="1" y2="1">
            {RAINBOW.map((c, i) => (
              <Stop key={c} offset={i / (RAINBOW.length - 1)} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width={SIZE} height={SIZE} fill="url(#r)" />
      </Svg>
    );
  }
  const bg = choice === 'system' || (choice === 'custom' && !primary) ? undefined : choice === 'custom' ? buildCustomPalette(primary as string, dark).bg : PALETTES[choice].bg;
  const dot = choice === 'custom' ? (primary ?? '#FFFFFF') : choice === 'system' ? PALETTES.mint.primary : PALETTES[choice].primary;
  return (
    <View style={[styles.swatch, bg ? { backgroundColor: bg } : null]}>
      {face}
      <View style={[styles.dot, { backgroundColor: dot }]} />
    </View>
  );
}

// 8 colour sets, "Theo hệ thống" and "Tự chọn" (any colour + light / dark).
export function ThemeSection() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const { appearance, setAppearance } = useAppearance();
  const [picking, setPicking] = useState(false);
  const choices: ThemeChoice[] = [...THEME_IDS, 'system', 'custom'];

  const onPress = (c: ThemeChoice) => {
    if (c === 'custom') {
      if (appearance.theme === 'custom' || !appearance.themePrimary) setPicking(true);
      else setAppearance({ theme: 'custom' });
      return;
    }
    setAppearance({ theme: c });
  };

  return (
    <>
      <Card style={styles.card}>
        {choices.map((c) => {
          const on = appearance.theme === c;
          return (
            <Pressable
              key={c}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => onPress(c)}
              style={styles.item}>
              <View style={[styles.ring, on && { borderColor: colors.primary }]}>
                <Swatch choice={c} primary={appearance.themePrimary} dark={appearance.themeDark} />
              </View>
              <AppText variant="caption" weight={on ? 'bold' : undefined} numberOfLines={2} style={styles.name}>
                {t(`appearance.themes.${c}`)}
              </AppText>
            </Pressable>
          );
        })}
        {appearance.theme === 'custom' ? (
          <View style={styles.dark}>
            <SegmentedBar
              options={[
                { value: 'light', label: t('appearance.light') },
                { value: 'dark', label: t('appearance.darkMode') },
              ]}
              value={appearance.themeDark ? 'dark' : 'light'}
              onChange={(v) => setAppearance({ themeDark: v === 'dark' })}
            />
          </View>
        ) : null}
      </Card>
      {picking ? (
        <ColorPickerDialog
          initial={(appearance.themePrimary ?? DEFAULT_CUSTOM) as `#${string}`}
          onClose={() => setPicking(false)}
          onPick={(hex) => {
            setPicking(false);
            setAppearance({ theme: 'custom', themePrimary: hex });
          }}
        />
      ) : null}
    </>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  card: { flexDirection: 'row', flexWrap: 'wrap', padding: space.md },
  item: { width: '20%', alignItems: 'center', paddingVertical: space.sm, gap: space.xs },
  ring: { padding: 3, borderRadius: 999, borderWidth: 2, borderColor: 'transparent' },
  swatch: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  dot: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.white },
  name: { textAlign: 'center' },
  dark: { width: '100%', paddingTop: space.sm },
}));
