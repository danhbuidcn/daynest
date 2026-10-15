import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { makeStyles, radius, space, useTheme } from '@/theme';

// Màn 22 — first sync after turning it on. Not dismissable: it closes itself when done.
export function SyncProgressDialog({ progress, year }: { progress: { done: number; total: number } | null; year: number }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const ratio = progress && progress.total > 0 ? Math.min(1, progress.done / progress.total) : 0;
  return (
    <DialogShell visible={!!progress} onClose={() => {}}>
      <View style={styles.icon}>
        <Icon name="sync" size={28} color={colors.primaryDark} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {t('google.progressTitle')}
      </AppText>
      <AppText color={colors.textMuted} style={[styles.center, styles.text]}>
        {t('google.progressText', { year })}
      </AppText>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%` }]} />
      </View>
      <AppText variant="caption" color={colors.textMuted} style={styles.center}>
        {progress && progress.total > 0 ? `${progress.done} / ${progress.total}` : ' '}
      </AppText>
    </DialogShell>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  icon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  center: { textAlign: 'center' },
  text: { marginTop: 6, marginBottom: space.md },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden', marginTop: space.xs, marginBottom: space.sm },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
}));
