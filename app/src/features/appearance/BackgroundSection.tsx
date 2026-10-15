import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ColorPickerDialog } from '@/components/ColorPickerDialog';
import { Icon } from '@/components/Icon';
import { BackgroundArt } from '@/components/ScreenBackground';
import { Slider } from '@/components/Slider';
import { useToast } from '@/components/Toast';
import {
  BG_COLORS_DARK,
  BG_COLORS_LIGHT,
  GRADIENT_COUNT,
  PATTERN_COUNT,
  PHOTO_FADE_MAX,
  isReadableBackground,
  parseBackground,
} from '@/lib/theme/backgrounds';
import { makeStyles, space, useAppearance, useTheme } from '@/theme';
import { pickPhoto, setPhotoFade } from './photoStore';

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

function Tile({ on, label, onPress, children }: { on: boolean; label: string; onPress: () => void; children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.tile, on && { borderColor: colors.primary }]}>
      {children}
    </Pressable>
  );
}

function ArtTile({ value, on, label, onPress, showLabel }: { value: string; on: boolean; label: string; onPress: () => void; showLabel?: boolean }) {
  const { appearance, photo } = useAppearance();
  return (
    <Tile on={on} label={label} onPress={onPress}>
      <BackgroundArt value={value} custom={appearance.backgroundColor} photo={photo} />
      {showLabel ? <AppText variant="caption" weight="bold">{label}</AppText> : null}
    </Tile>
  );
}

// Plain, your photo, 8 colours (+ any colour), 8 gradients, 6 patterns.
export function BackgroundSection() {
  const { t } = useTranslation();
  const { colors, dark } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const { appearance, photo, setAppearance } = useAppearance();
  const [picking, setPicking] = useState(false);
  const current = parseBackground(appearance.background);
  const set = (background: string) => setAppearance({ background });
  const swatches = dark ? BG_COLORS_DARK : BG_COLORS_LIGHT;

  const choosePhoto = async () => {
    try {
      if (await pickPhoto()) set('photo');
    } catch {
      toast(t('appearance.photoFailed'), 'error');
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <ArtTile showLabel value="plain" on={current.kind === 'plain'} label={t('appearance.plain')} onPress={() => set('plain')} />
        {photo ? <ArtTile value="photo" on={current.kind === 'photo'} label={t('appearance.photo')} onPress={() => set('photo')} /> : null}
        <Tile on={false} label={t('appearance.photo')} onPress={choosePhoto}>
          <Icon name="image" size={22} color={colors.primaryDark} />
        </Tile>
      </View>
      {current.kind === 'photo' && photo ? (
        <View style={styles.fade}>
          <AppText>{t('appearance.fade')}</AppText>
          <Slider value={photo.fade} min={0} max={PHOTO_FADE_MAX} label={t('appearance.fade')} onChange={(v) => void setPhotoFade(v)} />
          <AppText weight="bold" style={styles.percent}>{`${photo.fade}%`}</AppText>
        </View>
      ) : null}

      <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.label}>
        {t('appearance.colors')}
      </AppText>
      <View style={styles.row}>
        {range(8).map((i) => (
          <Pressable
            key={i}
            accessibilityRole="radio"
            accessibilityState={{ selected: appearance.background === `color-${i}` }}
            onPress={() => set(`color-${i}`)}
            style={[styles.dotRing, appearance.background === `color-${i}` && { borderColor: colors.primary }]}>
            <View style={[styles.colorDot, { backgroundColor: swatches[i - 1] }]} />
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="radio"
          accessibilityLabel={t('appearance.pickColor')}
          accessibilityState={{ selected: appearance.background === 'color' }}
          onPress={() => setPicking(true)}
          style={[styles.dotRing, appearance.background === 'color' && { borderColor: colors.primary }]}>
          <View style={[styles.colorDot, { backgroundColor: appearance.backgroundColor ?? colors.primarySoft }]}>
            {!appearance.backgroundColor ? <Icon name="plus" size={14} color={colors.primaryDark} /> : null}
          </View>
        </Pressable>
      </View>

      <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.label}>
        {t('appearance.gradients')}
      </AppText>
      <View style={styles.row}>
        {range(GRADIENT_COUNT).map((i) => (
          <ArtTile key={i} value={`gradient-${i}`} on={appearance.background === `gradient-${i}`} label={`${t('appearance.gradients')} ${i}`} onPress={() => set(`gradient-${i}`)} />
        ))}
      </View>

      <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.label}>
        {t('appearance.patterns')}
      </AppText>
      <View style={styles.row}>
        {range(PATTERN_COUNT).map((i) => (
          <ArtTile key={i} value={`pattern-${i}`} on={appearance.background === `pattern-${i}`} label={`${t('appearance.patterns')} ${i}`} onPress={() => set(`pattern-${i}`)} />
        ))}
      </View>

      {picking ? (
        <ColorPickerDialog
          initial={(appearance.backgroundColor ?? colors.primarySoft) as `#${string}`}
          onClose={() => setPicking(false)}
          onPick={(hex) => {
            if (!isReadableBackground(hex, colors)) {
              toast(t('appearance.unreadable'), 'error');
              return;
            }
            setPicking(false);
            setAppearance({ background: 'color', backgroundColor: hex });
          }}
        />
      ) : null}
    </Card>
  );
}

const TILE = 52;

const useStyles = makeStyles(({ colors }) => ({
  card: { padding: space.lg, gap: space.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, alignItems: 'center' },
  label: { marginTop: space.sm, letterSpacing: 0.6 },
  tile: { width: TILE, height: TILE, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  dotRing: { padding: 3, borderRadius: 999, borderWidth: 2, borderColor: 'transparent' },
  colorDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  fade: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  percent: { width: 44, textAlign: 'right' },
}));
