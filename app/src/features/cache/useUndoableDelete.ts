import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useToast } from '@/components/Toast';
import { scheduleDelete } from '@/lib/undo/pendingDelete';

// "Đã xoá · Hoàn tác": the item is hidden at once, the delete is sent once the toast is gone.
export function useUndoableDelete() {
  const toast = useToast();
  const { t } = useTranslation();
  return useCallback(
    (args: Parameters<typeof scheduleDelete>[0]) => {
      const undo = scheduleDelete(args);
      toast(t('common.deleted'), 'info', { label: t('common.undo'), onPress: undo });
    },
    [toast, t],
  );
}
