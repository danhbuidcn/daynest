import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { isDeviceOnline } from '@/lib/connection';
import { classifyError } from '@/lib/errors/classifyError';
import { makeStyles, radius, space, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Icon } from './Icon';

const titleKey = (error: unknown) => {
  const kind = classifyError(error, isDeviceOnline());
  return kind === 'offline' ? 'errors.offline' : kind === 'server' ? 'errors.server' : 'errors.loadFailed';
};

// Nothing on the device to show and the load failed.
export function LoadErrorCard({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.bubble}>
        <Icon name="alert" size={36} color={colors.error} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {t(titleKey(error))}
      </AppText>
      <Button label={t('errors.retry')} onPress={onRetry} />
    </View>
  );
}

// The copy on the device stays on screen; the refresh failed.
export function StaleLine({ onRetry }: { onRetry: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="button" onPress={onRetry} style={styles.stale}>
      <AppText variant="caption" color={colors.textMuted}>
        {t('errors.stale')} ·{' '}
      </AppText>
      <AppText variant="caption" weight="bold" color={colors.primaryDark}>
        {t('errors.retry')}
      </AppText>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  card: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: 40, paddingBottom: 40 },
  bubble: { width: 72, height: 72, borderRadius: radius.card, backgroundColor: colors.errorSoft, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  stale: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: space.xs },
}));
