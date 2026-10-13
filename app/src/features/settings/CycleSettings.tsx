import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/Card';
import { SettingRow } from '@/components/SettingRow';
import { Switch } from '@/components/Switch';
import { useAuth } from '@/features/auth/AuthProvider';
import { fetchPeriodDays } from '@/features/cycle/api';
import { NumberPickerDialog } from './NumberPickerDialog';
import { PeriodReminderDialog } from './PeriodReminderDialog';
import { useSettingSaver } from './useSettingSaver';

const CYCLE_LENGTHS = Array.from({ length: 25 }, (_, i) => 21 + i);
const PERIOD_LENGTHS = Array.from({ length: 9 }, (_, i) => 2 + i);

// Nhóm "Chu kỳ kinh nguyệt" (màn 10, 10c): tracking switch, lengths, reminder before the next period.
export function CycleSettings() {
  const { t } = useTranslation();
  const router = useRouter();
  const { settings } = useAuth();
  const save = useSettingSaver();
  const [cycleOpen, setCycleOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [remindOpen, setRemindOpen] = useState(false);
  const days = (count: number) => t('cycle.days', { count });

  const onTrack = async (on: boolean) => {
    await save({ cycleEnabled: on });
    if (!on) return;
    // First time on: nothing to predict from yet, so ask for the latest period straight away.
    const logged = await fetchPeriodDays('2000-01-01').catch(() => null);
    if (logged?.length === 0) router.push('/settings/period');
  };

  const onRemind = (on: boolean) => {
    if (on) setRemindOpen(true);
    else save({ periodReminder: false });
  };

  return (
    <>
      <Card>
        <SettingRow first icon="cycle" label={t('cycle.track')} trailing={<Switch value={settings.cycleEnabled} onValueChange={onTrack} />} />
        {settings.cycleEnabled ? (
          <>
            <SettingRow icon="calendar" label={t('cycle.logPeriod')} onPress={() => router.push('/settings/period')} />
            <SettingRow icon="repeat" label={t('cycle.cycleLength')} value={days(settings.cycleLength)} onPress={() => setCycleOpen(true)} />
            <SettingRow icon="ruler" label={t('cycle.periodLength')} value={days(settings.periodLength)} onPress={() => setPeriodOpen(true)} />
            <SettingRow
              icon="bell"
              label={t('cycle.remind')}
              sublabel={
                settings.periodReminder ? t('cycle.remindSub', { count: settings.periodReminderDays, time: settings.periodReminderTime }) : undefined
              }
              onPress={settings.periodReminder ? () => setRemindOpen(true) : undefined}
              trailing={<Switch value={settings.periodReminder} onValueChange={onRemind} />}
            />
          </>
        ) : null}
      </Card>
      <NumberPickerDialog
        visible={cycleOpen}
        title={t('cycle.cycleLength')}
        values={CYCLE_LENGTHS}
        selected={settings.cycleLength}
        label={days}
        onSelect={(v) => {
          setCycleOpen(false);
          save({ cycleLength: v });
        }}
        onClose={() => setCycleOpen(false)}
      />
      <NumberPickerDialog
        visible={periodOpen}
        title={t('cycle.periodLength')}
        values={PERIOD_LENGTHS}
        selected={settings.periodLength}
        label={days}
        onSelect={(v) => {
          setPeriodOpen(false);
          save({ periodLength: v });
        }}
        onClose={() => setPeriodOpen(false)}
      />
      <PeriodReminderDialog
        visible={remindOpen}
        days={settings.periodReminderDays}
        time={settings.periodReminderTime}
        onSave={(d, time) => {
          setRemindOpen(false);
          save({ periodReminder: true, periodReminderDays: d, periodReminderTime: time });
        }}
        onClose={() => setRemindOpen(false)}
      />
    </>
  );
}
