import { useRouter } from 'expo-router';
import type { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/features/auth/AuthProvider';
import type { DeviceRow } from '@/features/auth/authService';
import { getDeviceId } from '@/features/auth/device';
import { toRelativeMoment } from '@/lib/relativeDate';
import { makeStyles, space, useTheme } from '@/theme';

function formatAbsoluteDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatLastSeen(iso: string, t: TFunction) {
  const m = toRelativeMoment(new Date(iso));
  if (m.kind === 'date') return formatAbsoluteDate(iso);
  const time = `${String(m.hour).padStart(2, '0')}:${String(m.minute).padStart(2, '0')}`;
  return t(`devices.${m.kind}`, { time });
}

export default function DevicesScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const { listDevices } = useAuth();
  const [devices, setDevices] = useState<DeviceRow[] | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    listDevices().then(setDevices).catch(() => setDevices([]));
    getDeviceId().then(setCurrentId);
  }, [listDevices]);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader title={t('settings.devices')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          {(devices ?? []).map((d, i) => (
            <View key={d.deviceId} style={[styles.row, i > 0 && styles.divider]}>
              <View style={styles.icon}>
                <Icon name="phone" size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.who}>
                <View style={styles.nameRow}>
                  <AppText numberOfLines={1} style={styles.flexShrink}>
                    {d.deviceName}
                  </AppText>
                  {d.deviceId === currentId ? (
                    <View style={styles.tag}>
                      <AppText variant="micro" weight="extrabold" color={colors.primaryDark}>
                        {t('devices.current')}
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <AppText variant="caption" color={colors.textMuted}>
                  {t('devices.caption', {
                    signedIn: formatAbsoluteDate(d.signedInAt),
                    lastSeen: formatLastSeen(d.lastSeenAt, t),
                  })}
                </AppText>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg },
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  who: { flex: 1, minWidth: 0, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flexShrink: { flexShrink: 1 },
  tag: { backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: space.sm, paddingVertical: 2 },
}));
