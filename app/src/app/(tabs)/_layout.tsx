import { Tabs } from 'expo-router/tabs';
import { useTranslation } from 'react-i18next';

import { TabBar } from '@/components/TabBar';
import { useToast } from '@/components/Toast';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const toast = useToast();
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
      tabBar={(props) => <TabBar {...props} onPlus={() => toast(t('comingSoon'))} />}>
      <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar') }} />
      <Tabs.Screen name="manage" options={{ title: t('tabs.manage') }} />
      <Tabs.Screen name="stats" options={{ title: t('tabs.stats') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
    </Tabs>
  );
}
