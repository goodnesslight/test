import { useToast } from 'primevue/usetoast';

import {
  NOTIFICATION_ERROR_LIFE,
  NOTIFICATION_SUCCESS_LIFE,
} from '../constants';

export interface NotificationService {
  showSuccess(summary: string, detail?: string): void;
  showError(detail: string): void;
}

export function useNotificationService(): NotificationService {
  const { t } = useI18n();
  const toast: ReturnType<typeof useToast> = useToast();

  function showSuccess(summary: string, detail?: string): void {
    toast.add({
      severity: 'success',
      summary,
      detail,
      life: NOTIFICATION_SUCCESS_LIFE,
    });
  }

  function showError(detail: string): void {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail,
      life: NOTIFICATION_ERROR_LIFE,
    });
  }

  return { showSuccess, showError };
}
