import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DialogShell } from '@/components/Dialog';
import { makeStyles, space } from '@/theme';
import { Column, formatReminderTime, HOURS, MINUTES, pad } from './PeriodReminderDialog';

// Time of day (5-minute steps) for the morning / evening todo digest.
export function DailyReminderDialog(props: { visible: boolean; title: string; time: string; onSave: (time: string) => void; onClose: () => void }) {
  // Mounted only while open, so every opening starts from the saved value.
  return props.visible ? <TimePicker {...props} /> : null;
}

function TimePicker({ visible, title, time, onSave, onClose }: { visible: boolean; title: string; time: string; onSave: (time: string) => void; onClose: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  const [hour, minute] = time.split(':').map(Number);
  const [h, setH] = useState(hour);
  const [m, setM] = useState((Math.round(minute / 5) * 5) % 60);

  return (
    <DialogShell visible={visible} onClose={onClose}>
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.columns}>
        <Column values={HOURS} value={h} format={pad} onChange={setH} flex={1} />
        <AppText weight="extrabold" style={styles.colon}>
          :
        </AppText>
        <Column values={MINUTES} value={m} format={pad} onChange={setM} flex={1} />
      </View>
      <View style={styles.actions}>
        <Button label={t('cycle.cancel')} variant="secondary" onPress={onClose} style={styles.flex} />
        <Button label={t('cycle.save')} onPress={() => onSave(formatReminderTime(h, m))} style={styles.flex} />
      </View>
    </DialogShell>
  );
}

const useStyles = makeStyles(() => ({
  title: { marginBottom: space.md },
  columns: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  colon: { width: 10, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: space.md },
  flex: { flex: 1 },
}));
