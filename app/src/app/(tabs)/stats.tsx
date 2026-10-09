import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';

export default function StatsScreen() {
  const { t } = useTranslation();
  return <EmptyState title={t('tabs.stats')} icon="stats-chart-outline" />;
}
