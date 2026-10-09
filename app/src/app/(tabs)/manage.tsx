import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';

export default function ManageScreen() {
  const { t } = useTranslation();
  return <EmptyState title={t('tabs.manage')} icon="book" />;
}
