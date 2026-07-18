import { EventAttendanceStatus, EventType } from '@erp/types';

import type { EventAttendanceOption } from '../types';

export const EVENT_ATTENDANCE_OPTIONS: EventAttendanceOption[] = [
  { status: EventAttendanceStatus.GOING, icon: 'pi pi-check' },
  { status: EventAttendanceStatus.MAYBE, icon: 'pi pi-question' },
  { status: EventAttendanceStatus.DECLINED, icon: 'pi pi-times' },
];

export const EVENT_TYPE_SEVERITIES: Record<EventType, string> = {
  [EventType.PRACTICE]: 'info',
  [EventType.MATCH]: 'danger',
};
