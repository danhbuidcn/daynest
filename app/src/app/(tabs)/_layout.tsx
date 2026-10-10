import { useRouter } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TabBar } from '@/components/TabBar';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { QuickAddDialog } from '@/features/calendar/QuickAddDialog';
import { isoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const { settings } = useAuth();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
        tabBar={(props) => <TabBar {...props} onPlus={() => setQuickAddOpen(true)} />}>
        <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar') }} />
        <Tabs.Screen name="manage" options={{ title: t('tabs.manage') }} />
        <Tabs.Screen name="stats" options={{ title: t('tabs.stats') }} />
        <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
      </Tabs>
      <QuickAddDialog
        visible={quickAddOpen}
        title={t('events.quickAdd.title')}
        onClose={() => setQuickAddOpen(false)}
        onCreateEvent={() => {
          setQuickAddOpen(false);
          router.push({ pathname: '/event/edit', params: { date: isoDate(todayIn(settings.timeZone)) } });
        }}
        onCreateNote={() => {
          setQuickAddOpen(false);
          toast(t('comingSoon'));
        }}
      />
    </>
  );
}
