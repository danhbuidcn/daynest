import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { SegmentedBar } from '@/components/SegmentedBar';
import { FONT_IDS, FONT_SCALES } from '@/lib/theme/appearance';
import { FONT_FAMILIES } from '@/theme/fonts';
import { makeStyles, space, useAppearance, useTheme } from '@/theme';

const SCALE_LABELS = { 0.9: 'small', 1: 'medium', 1.15: 'large' } as const;

// 6 fonts, each shown in its own face.
export function FontSection() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const { appearance, setAppearance } = useAppearance();
  return (
    <Card>
      {FONT_IDS.map((id, i) => {
        const on = appearance.font === id;
        const family = FONT_FAMILIES[id].bold;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => setAppearance({ font: id })}
            style={[styles.row, i > 0 && styles.divider]}>
            <AppText style={[styles.aa, { fontFamily: family }]}>Aa</AppText>
            <AppText style={[styles.name, { fontFamily: family }]}>{t(`appearance.fonts.${id}`)}</AppText>
            {on ? <Icon name="check" size={20} color={colors.primaryDark} /> : null}
          </Pressable>
        );
      })}
    </Card>
  );
}

export function FontScaleSection() {
  const { t } = useTranslation();
  const { appearance, setAppearance } = useAppearance();
  return (
    <View>
      <SegmentedBar
        options={FONT_SCALES.map((s) => ({ value: String(s), label: t(`appearance.scales.${SCALE_LABELS[s]}`) }))}
        value={String(appearance.fontScale)}
        onChange={(v) => setAppearance({ fontScale: Number(v) })}
      />
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  row: { height: 52, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  aa: { width: 36, fontSize: 20 },
  name: { flex: 1 },
}));
