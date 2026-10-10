import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/Dialog';
import { SettingRow } from '@/components/SettingRow';
import { Switch } from '@/components/Switch';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { clockLabel } from '@/features/events/format';
import { timeOfDayIn, todayIn } from '@/lib/calendar/timeZone';
import { toRelativeMoment } from '@/lib/relativeDate';
import { colors } from '@/theme';
import { disableSync, enableSync, reconnect, syncNow, type SyncOutcome } from './sync';
import { SyncProgressDialog } from './SyncProgressDialog';
import { useGoogleSync } from './useGoogleSync';

// F6 nhóm Google Calendar (màn 21, 21b, 21c, 22).
export function GoogleSettings() {
  const { t } = useTranslation();
  const toast = useToast();
  const { settings } = useAuth();
  const sync = useGoogleSync();
  const [offOpen, setOffOpen] = useState(false);
  const [turningOn, setTurningOn] = useState(false);

  const report = (outcome: SyncOutcome | 'denied') => {
    if (outcome === 'denied') toast(t('google.denied'), 'error');
    else if (outcome === 'failed') toast(t('google.syncFailed'), 'error');
  };

  const turnOn = async () => {
    setTurningOn(true);
    try {
      report(await enableSync());
    } finally {
      setTurningOn(false);
    }
  };

  const turnOff = async () => {
    setOffOpen(false);
    await disableSync().catch(() => toast(t('settings.saveFailed'), 'error'));
  };

  const lastSynced = () => {
    if (!sync.lastSyncedAt) return '';
    const at = new Date(sync.lastSyncedAt);
    const time = clockLabel(t, timeOfDayIn(at, settings.timeZone), settings.use24h);
    const moment = toRelativeMoment(at);
    if (moment.kind === 'today') return t('google.today', { time });
    if (moment.kind === 'yesterday') return t('google.yesterday', { time });
    return `${moment.day}/${moment.month}/${moment.year}`;
  };

  return (
    <>
      <Card>
        <SettingRow
          first
          icon="google"
          label={t('google.toggle')}
          trailing={
            turningOn ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Switch value={sync.enabled} onValueChange={(on) => (on ? void turnOn() : setOffOpen(true))} />
            )
          }
        />
        {sync.enabled && sync.needsReconnect ? (
          <SettingRow danger icon="alert" label={t('google.reconnect')} onPress={() => void reconnect().then(report)} />
        ) : null}
        {sync.enabled ? (
          <>
            <SettingRow
              icon="sync"
              label={t('google.syncNow')}
              onPress={sync.syncing ? undefined : () => void syncNow().then(report)}
              trailing={sync.syncing ? <ActivityIndicator color={colors.primary} /> : undefined}
            />
            <SettingRow icon="clock" label={t('google.lastSynced')} value={lastSynced()} />
          </>
        ) : null}
      </Card>
      <ConfirmDialog
        visible={offOpen}
        tone="warning"
        icon="google"
        title={t('google.offTitle')}
        text={t('google.offText')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('google.offConfirm')}
        onCancel={() => setOffOpen(false)}
        onConfirm={() => void turnOff()}
      />
      <SyncProgressDialog progress={sync.progress} year={todayIn(settings.timeZone).year} />
    </>
  );
}
