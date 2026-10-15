import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionMenu, MoreButton } from '@/components/ActionMenu';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/Dialog';
import { Icon, type IconName } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { clockLabel, lunarLabel, occurrenceStartDate, reminderLabel, whenLabel } from '@/features/events/format';
import { OccurrenceActionDialog } from '@/features/events/OccurrenceDialogs';
import { repeatLabel } from '@/features/events/repeatLabel';
import { TodoTick } from '@/features/todos/TodoTick';
import { useTodoDelete } from '@/features/todos/useTodoDelete';
import { useSetTodoStatus, useTodosInRange } from '@/features/todos/useTodos';
import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { subtaskProgress, toggleSubtask, toggleTodo, type TodoStatus } from '@/lib/todos';
import { makeStyles, radius, space, useTheme } from '@/theme';

// Chi tiết Todo (S5) — `/todo/[id]?occurrenceDate=YYYY-MM-DD`: one lap of a (possibly repeating) todo.
export default function TodoDetailScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { settings } = useAuth();
  const params = useLocalSearchParams<{ id: string; occurrenceDate: string }>();
  const occDate = parseIsoDate(params.occurrenceDate);
  const loaded = useTodosInRange({ from: occDate, to: occDate }, settings.timeZone);
  const todo = loaded.data?.todos.find((x) => x.id === params.id);
  const occ = loaded.occurrences.find((o) => o.eventId === params.id && o.occurrenceDate === params.occurrenceDate);
  const setStatus = useSetTodoStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const deleter = useTodoDelete({ todo, occurrence: occ, onDone: () => router.back(), onError: () => toast(t('events.detail.deleteFailed'), 'error') });

  if (loaded.isLoading || (loaded.isPlaceholderData && (!todo || !occ))) return null;
  if (!todo || !occ) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <ScreenHeader title="" onBack={() => router.back()} compact />
      </SafeAreaView>
    );
  }

  const tick = (status: TodoStatus) =>
    setStatus.mutate({ todo, occurrenceDate: occ.occurrenceDate, status }, { onError: () => toast(t('todos.tickFailed'), 'error') });
  const repeat = repeatLabel(t, occ.repeat, todo.repeatInterval, occDate, true);
  const reminders = reminderLabel(t, occ.reminderMinutes);
  const progress = subtaskProgress(occ.subtasks, occ.status);

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader title="" onBack={() => router.back()} compact action={<MoreButton onPress={() => setMenuOpen(true)} />} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <TodoTick done={occ.status.done} size={28} onPress={() => tick(toggleTodo(occ.subtasks, occ.status))} label={occ.title} />
          <AppText variant="title" style={[styles.flex, occ.status.done && styles.doneText]}>
            {occ.title}
          </AppText>
        </View>

        {occ.subtasks.length > 0 ? (
          <Card>
            <View style={[styles.detailRow, styles.subHeader]}>
              <RowIcon icon="checklist" />
              <AppText weight="bold" style={styles.flex}>
                {t('todos.subtasks')}
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>{`${progress.done}/${progress.total}`}</AppText>
            </View>
            {occ.subtasks.map((s) => {
              const done = occ.status.doneSubtasks.includes(s.id);
              return (
                <View key={s.id} style={styles.subRow}>
                  <TodoTick square done={done} onPress={() => tick(toggleSubtask(occ.subtasks, occ.status, s.id))} label={s.text} />
                  <AppText style={[styles.flex, done && styles.doneText]}>{s.text}</AppText>
                </View>
              );
            })}
          </Card>
        ) : null}

        <Card>
          <DetailRow first icon="calendar" label={whenLabel(t, occ, settings.use24h, settings.timeZone)} detail={settings.showLunar ? lunarLabel(t, occurrenceStartDate(occ, settings.timeZone)) : undefined} />
          {occ.repeat !== 'none' ? <DetailRow icon="repeat" label={repeat.title} detail={repeat.detail} /> : null}
          {reminders ? (
            <DetailRow
              icon="bell"
              label={reminders}
              detail={occ.allDay ? t('events.detail.allDayReminder', { time: clockLabel(t, { hour: 9, minute: 0, second: 0 }, settings.use24h) }) : undefined}
            />
          ) : null}
          {occ.note ? <DetailRow icon="note" label={occ.note} multiline /> : null}
        </Card>
      </ScrollView>

      <ActionMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        actions={[
          { icon: 'pen', label: t('events.detail.edit'), onPress: () => router.push({ pathname: '/todo/edit', params: { todoId: todo.id, occurrenceDate: occ.occurrenceDate } }) },
          { icon: 'trash', label: t('events.detail.delete'), danger: true, onPress: deleter.start },
        ]}
      />
      <OccurrenceActionDialog title={t('todos.occurrenceTitle')} {...deleter.scope} />
      <ConfirmDialog
        visible={deleter.confirm.visible}
        icon="trash"
        title={t('todos.deleteTitle')}
        text={t('events.detail.deleteText')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('events.detail.delete')}
        onCancel={deleter.confirm.onCancel}
        onConfirm={deleter.confirm.onConfirm}
      />
    </SafeAreaView>
  );
}

function RowIcon({ icon }: { icon: IconName }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.rowIcon}>
      <Icon name={icon} size={20} color={colors.primaryDark} />
    </View>
  );
}

function DetailRow({ icon, label, detail, multiline, first }: { icon: IconName; label: string; detail?: string | null; multiline?: boolean; first?: boolean }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.detailRow, !first && styles.divider]}>
      <RowIcon icon={icon} />
      <View style={styles.flex}>
        <AppText numberOfLines={multiline ? undefined : 2}>{label}</AppText>
        {detail ? (
          <AppText variant="caption" color={colors.textMuted}>
            {detail}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.lg, paddingTop: space.xs, paddingBottom: space.lg, gap: space.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.xs, paddingVertical: space.sm },
  flex: { flex: 1 },
  doneText: { textDecorationLine: 'line-through', color: colors.textMuted },
  detailRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.sm },
  subHeader: { paddingBottom: 0 },
  subRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.xs },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  rowIcon: { width: 34, height: 34, borderRadius: radius.icon, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
}));
