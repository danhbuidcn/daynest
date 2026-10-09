import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';

export default function CalendarScreen() {
  const { t } = useTranslation();
  return <EmptyState title={t('tabs.calendar')} icon="calendar" />;
}
