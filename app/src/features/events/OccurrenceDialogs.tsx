import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DialogShell } from '@/components/Dialog';
import { colors, radius, space } from '@/theme';

// "Hỏi lần lặp" (màn 14) — sửa/xoá một event đang lặp: chỉ lần này hay cả chuỗi.
export function OccurrenceActionDialog({
  visible,
  title,
  onThisOccurrence,
  onAllOccurrences,
  onCancel,
}: {
  visible: boolean;
  title?: string;
  onThisOccurrence: () => void;
  onAllOccurrences: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <DialogShell visible={visible} onClose={onCancel} compact>
      <AppText variant="heading" style={styles.center}>
        {title ?? t('events.occurrenceDialog.title')}
      </AppText>
      <View style={styles.options}>
        <Pressable accessibilityRole="button" onPress={onThisOccurrence} style={styles.option}>
          <AppText>{t('events.occurrenceDialog.thisOccurrence')}</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onAllOccurrences} style={styles.option}>
          <AppText>{t('events.occurrenceDialog.allOccurrences')}</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.option}>
          <AppText color={colors.textMuted}>{t('common.cancel')}</AppText>
        </Pressable>
      </View>
    </DialogShell>
  );
}

// Khoá lạc quan thất bại (màn 15) — ai đó đã lưu event này trên máy khác trước.
export function ConflictDialog({ visible, onReload, onOverwrite }: { visible: boolean; onReload: () => void; onOverwrite: () => void }) {
  const { t } = useTranslation();
  return (
    <DialogShell visible={visible} onClose={onReload} compact>
      <AppText variant="heading" style={styles.center}>
        {t('events.conflictDialog.title')}
      </AppText>
      <AppText color={colors.textMuted} style={[styles.center, styles.text]}>
        {t('events.conflictDialog.text')}
      </AppText>
      <View style={styles.actions}>
        <Button label={t('events.conflictDialog.reload')} variant="secondary" onPress={onReload} style={styles.flex} />
        <Button label={t('events.conflictDialog.overwrite')} variant="danger" onPress={onOverwrite} style={styles.flex} />
      </View>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  text: { marginTop: 6, marginBottom: space.md },
  options: { marginTop: space.md },
  option: { height: 56, justifyContent: 'center', paddingHorizontal: space.lg, borderRadius: radius.button },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
});
