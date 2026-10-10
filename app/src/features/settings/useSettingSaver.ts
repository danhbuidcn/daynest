import { useTranslation } from 'react-i18next';

import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import type { SettingsPatch } from '@/features/auth/authService';

// F6: the change shows right away; a failed save is rolled back by AuthProvider and toasted here.
export function useSettingSaver() {
  const { t } = useTranslation();
  const toast = useToast();
  const { saveSettings } = useAuth();
  return (patch: SettingsPatch) => saveSettings(patch).catch(() => toast(t('settings.saveFailed'), 'error'));
}
