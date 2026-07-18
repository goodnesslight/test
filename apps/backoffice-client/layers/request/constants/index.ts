import { RequestStatus } from '@backoffice/types';

type RequestStatusSeverity = 'warn' | 'info' | 'success' | 'danger';

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: 'На рассмотрении',
  [RequestStatus.IN_PROGRESS]: 'В работе',
  [RequestStatus.APPROVED]: 'Одобрена',
  [RequestStatus.REJECTED]: 'Отклонена',
};

export const REQUEST_STATUS_SEVERITY: Record<
  RequestStatus,
  RequestStatusSeverity
> = {
  [RequestStatus.PENDING]: 'warn',
  [RequestStatus.IN_PROGRESS]: 'info',
  [RequestStatus.APPROVED]: 'success',
  [RequestStatus.REJECTED]: 'danger',
};
