import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/Card';
import { ChoiceDialog } from '@/components/Dialog';
import { SettingRow } from '@/components/SettingRow';
import { Switch } from '@/components/Switch';
import { useAuth } from '@/features/auth/AuthProvider';
import { timeZoneLabel } from '@/lib/timezones';
import { TimeZonePicker } from './TimeZonePicker';
import { useSettingSaver } from './useSettingSaver';

// F6 nhóm Lịch: week start · time zone · 24-hour · lunar dates · holidays.
export function CalendarSettings() {
  const { t, i18n } = useTranslation();
  const { settings } = useAuth();
  const save = useSettingSaver();
  const [weekOpen, setWeekOpen] = useState(false);
  const [zoneOpen, setZoneOpen] = useState(false);
  const lang = i18n.language === 'vi' ? 'vi' : 'en';
  const weekOptions = [
    { value: '1', label: t('settings.monday') },
    { value: '0', label: t('settings.sunday') },
  ] as const;

  return (
    <>
      <Card>
        <SettingRow
          first
          icon="week"
          label={t('settings.weekStart')}
          value={settings.weekStart === 0 ? t('settings.sunday') : t('settings.monday')}
          onPress={() => setWeekOpen(true)}
        />
        <SettingRow icon="clock" label={t('settings.timeZone')} value={timeZoneLabel(settings.timeZone, lang)} onPress={() => setZoneOpen(true)} />
        <SettingRow
          icon="time24"
          label={t('settings.use24h')}
          trailing={<Switch value={settings.use24h} onValueChange={(v) => save({ use24h: v })} />}
        />
        <SettingRow
          icon="moon"
          label={t('settings.showLunar')}
          trailing={<Switch value={settings.showLunar} onValueChange={(v) => save({ showLunar: v })} />}
        />
        <SettingRow
          icon="flag"
          label={t('settings.showHolidays')}
          trailing={<Switch value={settings.showHolidays} onValueChange={(v) => save({ showHolidays: v })} />}
        />
      </Card>
      <ChoiceDialog
        visible={weekOpen}
        title={t('settings.weekStart')}
        options={weekOptions}
        selected={String(settings.weekStart) as '0' | '1'}
        onSelect={(v) => {
          setWeekOpen(false);
          save({ weekStart: v === '0' ? 0 : 1 });
        }}
        onClose={() => setWeekOpen(false)}
      />
      <TimeZonePicker
        visible={zoneOpen}
        selected={settings.timeZone}
        onSelect={(timeZone) => {
          setZoneOpen(false);
          save({ timeZone });
        }}
        onClose={() => setZoneOpen(false)}
      />
    </>
  );
}
