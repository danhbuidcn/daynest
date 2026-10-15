import { useRouter } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TabBar } from '@/components/TabBar';
import { useAuth } from '@/features/auth/AuthProvider';
import { QuickAddDialog } from '@/features/calendar/QuickAddDialog';
import { newNoteHref } from '@/features/notes/newNote';
import { useNotificationTap } from '@/features/reminders/useNotificationTap';
import { isoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { settings } = useAuth();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  useNotificationTap();

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
        tabBar={(props) => <TabBar {...props} onPlus={() => setQuickAddOpen(true)} />}>
        <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar') }} />
        <Tabs.Screen name="manage" options={{ title: t('tabs.manage') }} />
        <Tabs.Screen name="expenses" options={{ title: t('tabs.expenses') }} />
        <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
      </Tabs>
      <QuickAddDialog
        visible={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreateEvent={() => {
          setQuickAddOpen(false);
          router.push({ pathname: '/event/edit', params: { date: isoDate(todayIn(settings.timeZone)) } });
        }}
        onCreateTodo={() => {
          setQuickAddOpen(false);
          router.push({ pathname: '/todo/edit', params: { date: isoDate(todayIn(settings.timeZone)) } });
        }}
        onCreateNote={() => {
          setQuickAddOpen(false);
          router.push(newNoteHref());
        }}
        onCreateExpense={() => {
          setQuickAddOpen(false);
          router.push('/expense/edit');
        }}
      />
    </>
  );
}
