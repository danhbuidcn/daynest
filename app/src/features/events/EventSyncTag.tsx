import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon, type IconName } from '@/components/Icon';
import { makeStyles, radius, space, useTheme } from '@/theme';
import type { EventRow } from './event';

// Màn 13 tag (F4): where this event lives — Google, waiting to sync, view-only, or Daynest only.
export function EventSyncTag({ event }: { event: EventRow }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const g = event.google;
  const [icon, label]: [IconName, string] = g?.readonly
    ? ['google', t('events.detail.editOnGoogle')]
    : g?.status === 'pending'
      ? ['clock', t('events.detail.pending')]
      : g?.linked && event.repeat !== 'lunar_yearly'
        ? ['google', t('events.detail.google')]
        : ['phone', t('events.detail.onlyDaynest')];
  return (
    <View style={styles.tag}>
      <Icon name={icon} size={12} color={colors.textMuted} />
      <AppText variant="caption" weight="extrabold" color={colors.textMuted}>
        {label}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  tag: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: space.xs,
    height: 24,
    marginHorizontal: space.xs,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
  },
}));
