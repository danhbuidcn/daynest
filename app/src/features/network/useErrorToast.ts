import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useToast } from '@/components/Toast';
import { isDeviceOnline } from '@/lib/connection';
import { classifyError, errorMessageKey } from '@/lib/errors/classifyError';

// `const failed = useErrorToast(); … onError: failed('events.form.saveFailed')` — a lost
// connection or a server fault gets its own sentence, anything else the screen's own.
export function useErrorToast() {
  const toast = useToast();
  const { t } = useTranslation();
  return useCallback(
    (fallbackKey: string) => (e?: unknown) => toast(t(errorMessageKey(classifyError(e, isDeviceOnline()), fallbackKey)), 'error'),
    [toast, t],
  );
}
