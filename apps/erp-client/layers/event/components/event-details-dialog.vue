<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  type WritableComputedRef,
} from 'vue';

import type { EventAttendanceDto, EventDto } from '@shared/dtos';
import type { EventAttendanceStatus, HttpResponse } from '@shared/types';

import type { EventService } from '../composables/use-event-service';
import { EVENT_ATTENDANCE_OPTIONS, EVENT_TYPE_SEVERITIES } from '../constants';

import type { AuthService } from '#layers/auth';
import type { DateService } from '#layers/date';
import type { NotificationService } from '#layers/notification';
import { AppRoute } from '#layers/router';

interface EventDetailsDialogProps {
  visible: boolean;
  event: EventDto | null;
  canAttend?: boolean;
  canManage?: boolean;
  showTeamLink?: boolean;
}

interface EventDetailsDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'edit', value: EventDto): void;
  (event: 'remove', value: EventDto): void;
  (event: 'updated', value: EventDto): void;
}

const props: EventDetailsDialogProps = defineProps<EventDetailsDialogProps>();
const emit: EventDetailsDialogEmits = defineEmits<EventDetailsDialogEmits>();

const { t } = useI18n();
const authService: AuthService = useAuthService();
const dateService: DateService = useDateService();
const eventService: EventService = useEventService();
const notificationService: NotificationService = useNotificationService();

const isSavingAttendance: Ref<boolean> = ref(false);

const currentUserId: ComputedRef<number | null> = computed(
  (): number | null => authService.user.value?.id ?? null
);
const ownAttendance: ComputedRef<EventAttendanceStatus | null> = computed(
  (): EventAttendanceStatus | null => {
    const attendance: EventAttendanceDto | undefined =
      props.event?.attendances.find(
        (candidate: EventAttendanceDto): boolean =>
          candidate.userId === currentUserId.value
      );

    return attendance?.status ?? null;
  }
);
const organizationTag: ComputedRef<string | null> = computed(
  (): string | null => props.event?.team?.game?.organization?.tag ?? null
);
const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});

async function setAttendance(status: EventAttendanceStatus): Promise<void> {
  if (!props.event) {
    return;
  }

  isSavingAttendance.value = true;

  const response: HttpResponse<EventDto> = await eventService.setAttendance(
    props.event.id,
    { status }
  );

  isSavingAttendance.value = false;

  if (response.isSuccess) {
    emit('updated', response.data);
  } else {
    notificationService.showError(response.error);
  }
}

function countAttendance(status: EventAttendanceStatus): number {
  return (props.event?.attendances ?? []).filter(
    (attendance: EventAttendanceDto): boolean => attendance.status === status
  ).length;
}
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    :header="event?.title ?? ''"
    modal
    :style="{ width: '420px' }"
  >
    <div v-if="event" class="event-details">
      <div class="event-details__tags">
        <Tag
          :value="t(`events.types.${event.type}`)"
          :severity="EVENT_TYPE_SEVERITIES[event.type]"
        />
        <Tag
          v-if="organizationTag"
          :value="organizationTag"
          severity="secondary"
        />
        <span v-if="event.opponent" class="event-details__opponent">
          vs {{ event.opponent }}
        </span>
      </div>

      <div class="event-details__row">
        <i class="pi pi-clock" />
        <span>
          {{ dateService.formatDateTime(event.startsAt) }}
          <template v-if="event.endsAt">
            — {{ dateService.formatTime(event.endsAt) }}
          </template>
        </span>
      </div>

      <p v-if="event.description" class="event-details__description">
        {{ event.description }}
      </p>

      <div v-if="canAttend" class="event-details__attendance">
        <span class="event-details__label">
          {{ t('events.attendanceLabel') }}
        </span>
        <div class="event-details__attendance-buttons">
          <Button
            v-for="option in EVENT_ATTENDANCE_OPTIONS"
            :key="option.status"
            :icon="option.icon"
            :label="t(`events.attendance.${option.status}`)"
            :severity="
              ownAttendance === option.status ? 'primary' : 'secondary'
            "
            :outlined="ownAttendance !== option.status"
            :disabled="isSavingAttendance"
            size="small"
            @click="setAttendance(option.status)"
          />
        </div>
      </div>

      <div class="event-details__counts">
        <span
          v-for="option in EVENT_ATTENDANCE_OPTIONS"
          :key="option.status"
          class="event-details__count"
        >
          <i :class="option.icon" />
          {{ countAttendance(option.status) }}
          {{ t(`events.attendance.${option.status}`) }}
        </span>
      </div>

      <div class="event-details__actions">
        <NuxtLink
          v-if="showTeamLink"
          :to="buildAppRoute(AppRoute.TEAMS_BY_ID, { id: event.teamId })"
        >
          <Button
            :label="t('events.openTeam')"
            icon="pi pi-arrow-right"
            icon-pos="right"
            severity="secondary"
            text
            size="small"
          />
        </NuxtLink>
        <template v-if="canManage">
          <Button
            :label="t('common.edit')"
            icon="pi pi-pencil"
            severity="secondary"
            outlined
            size="small"
            @click="emit('edit', event)"
          />
          <Button
            :label="t('common.delete')"
            icon="pi pi-trash"
            severity="danger"
            outlined
            size="small"
            @click="emit('remove', event)"
          />
        </template>
      </div>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
.event-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__tags {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  &__opponent {
    color: $text-dim;
    font-weight: 600;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $text-secondary;

    .pi {
      color: $accent;
    }
  }

  &__description {
    color: $text-dim;
    font-size: 0.92rem;
    white-space: pre-line;
  }

  &__label {
    font-size: 0.85rem;
    color: $text-muted;
  }

  &__attendance {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__attendance-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__counts {
    display: flex;
    gap: 1rem;
    color: $text-dim;
    font-size: 0.85rem;
    flex-wrap: wrap;

    .pi {
      margin-right: 0.25rem;
      font-size: 0.75rem;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
}
</style>
