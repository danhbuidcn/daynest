import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { BackgroundArt } from '@/components/ScreenBackground';
import { eventColors, makeStyles, radius, space, useAppearance, useTheme } from '@/theme';

const SAMPLE_DAYS = Array.from({ length: 14 }, (_, i) => i + 5);

// What the choices below look like: a small month with two event bars and a card, on the chosen background.
export function AppearancePreview() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles();
  const { appearance, photo } = useAppearance();
  return (
    <View style={styles.frame}>
      <BackgroundArt value={appearance.background} custom={appearance.backgroundColor} photo={photo} />
      <View style={styles.month}>
        <AppText variant="caption" weight="bold">
          {t('calendar.months.10')}
        </AppText>
        <View style={styles.grid}>
          {SAMPLE_DAYS.map((d) => (
            <View key={d} style={styles.cell}>
              <AppText variant="micro" weight={d === 13 ? 'extrabold' : undefined} color={d === 13 ? colors.white : colors.text} style={d === 13 ? styles.today : undefined}>
                {d}
              </AppText>
            </View>
          ))}
        </View>
        <View style={[styles.bar, { backgroundColor: eventColors.mint }]} />
        <View style={[styles.bar, styles.barWide, { backgroundColor: eventColors.pink }]} />
      </View>
      <Card style={styles.card}>
        <AppText weight="bold">{t('appearance.previewTitle')}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {t('appearance.previewNote')}
        </AppText>
        <Button label={t('appearance.previewSave')} />
      </Card>
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  frame: { flexDirection: 'row', gap: space.md, padding: space.md, borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  month: { flex: 1, gap: space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  today: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 4, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4, width: '60%' },
  barWide: { width: '85%' },
  card: { flex: 1, padding: space.md, gap: space.xs, justifyContent: 'center' },
}));
