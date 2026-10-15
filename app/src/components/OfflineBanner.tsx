import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnline } from '@/features/network/useOnline';
import { makeStyles, space, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

// Top of every screen while the device is offline or the server is down. It lies over the status
// bar and the empty top inset of the screen below, which RootStack moves down by BANNER_ROW.
export const BANNER_ROW = 32;

export function OfflineBanner() {
  const { issue } = useOnline();
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  if (!issue) return null;
  return (
    <View accessibilityRole="alert" style={[styles.bar, { height: insets.top + BANNER_ROW, paddingTop: insets.top }]}>
      <Icon name={issue === 'offline' ? 'wifi' : 'alert'} size={16} color={colors.error} />
      <AppText variant="caption" weight="bold" color={colors.error}>
        {t(issue === 'offline' ? 'errors.offline' : 'errors.bannerServer')}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    backgroundColor: colors.errorSoft,
  },
}));
