import { useAuth } from '@/features/auth/AuthProvider';
import type { SettingsPatch } from '@/features/auth/authService';
import { useErrorToast } from '@/features/network/useErrorToast';

// F6: the change shows right away; a failed save is rolled back by AuthProvider and toasted here.
export function useSettingSaver() {
  const failed = useErrorToast();
  const { saveSettings } = useAuth();
  return (patch: SettingsPatch) => saveSettings(patch).catch(failed('settings.saveFailed'));
}
