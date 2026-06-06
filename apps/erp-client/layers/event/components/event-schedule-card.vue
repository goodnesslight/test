<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type {
  EventAttendanceDto,
  EventDto,
  EventSetAttendanceDto,
  TeamDto,
} from '@shared/dtos';
import {
  EventAttendanceStatus,
  EventType,
  type HttpResponse,
  TeamMemberRole,
} from '@shared/types';

import type { EventService } from '../composables/use-event-service';
import { EVENT_ATTENDANCE_OPTIONS, EVENT_TYPE_SEVERITIES } from '../constants';

import type { AuthService } from '#layers/auth';
import type { DateService } from '#layers/date';
import type { NotificationService } from '#layers/notification';

interface EventScheduleCardProps {
  team: TeamDto;
  isOwner: boolean;
}

type EventScheduleView = 'list' | 'calendar';

interface EventScheduleViewOption {
  view: EventScheduleView;
  icon: string;
}

const props: EventScheduleCardProps = defineProps<EventScheduleCardProps>();

const { t } = useI18n();
const confirm: ReturnType<typeof useConfirm> = useConfirm();
const authService: AuthService = useAuthService();
const dateService: DateService = useDateService();
const eventService: EventService = useEventService();
const notificationService: NotificationService = useNotificationService();

const VIEW_OPTIONS: EventScheduleViewOption[] = [
  { view: 'list', icon: 'pi pi-list' },
  { view: 'calendar', icon: 'pi pi-calendar' },
];

const events: Ref<EventDto[]> = ref([]);
const isLoading: Ref<boolean> = ref(true);
const isDialogVisible: Ref<boolean> = ref(false);
const isDetailsVisible: Ref<boolean> = ref(false);
const editedEvent: Ref<EventDto | null> = ref(null);
const selectedEvent: Ref<EventDto | null> = ref(null);
const createStartsAt: Ref<Date | null> = ref(null);
const isPastVisible: Ref<boolean> = ref(false);
const view: Ref<EventScheduleView> = ref('list');

const currentUserId: ComputedRef<number | null> = computed(
  (): number | null => authService.user.value?.id ?? null
);
const isMember: ComputedRef<boolean> = computed((): boolean =>
  props.team.members.some(
    (member): boolean => member.user?.id === currentUserId.value
  )
);
const canManage: ComputedRef<boolean> = computed((): boolean => {
  if (props.isOwner) {
    return true;
  }

  return props.team.members.some(
    (member): boolean =>
      member.user?.id === currentUserId.value &&
      (member.role === TeamMemberRole.COACH ||
        member.role === TeamMemberRole.CAPTAIN)
  );
});
const upcomingEvents: ComputedRef<EventDto[]> = computed((): EventDto[] =>
  events.value.filter(
    (event: EventDto): boolean =>
      new Date(event.startsAt) >= dateService.getStartOfToday()
  )
);
const pastEvents: ComputedRef<EventDto[]> = computed((): EventDto[] =>
  events.value
    .filter(
      (event: EventDto): boolean =>
        new Date(event.startsAt) < dateService.getStartOfToday()
    )
    .reverse()
);

async function loadEvents(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<EventDto[]> = await eventService.getForTeam(
    props.team.id
  );

  if (response.isSuccess) {
    events.value = response.data;
  }

  isLoading.value = false;
}

function openCreate(): void {
  editedEvent.value = null;
  createStartsAt.value = null;
  isDialogVisible.value = true;
}

function openEdit(event: EventDto): void {
  editedEvent.value = event;
  isDialogVisible.value = true;
}

function onCalendarEventClick(event: EventDto): void {
  selectedEvent.value = event;
  isDetailsVisible.value = true;
}

function onCalendarSlotClick(date: Date): void {
  if (!canManage.value) {
    return;
  }

  editedEvent.value = null;
  createStartsAt.value = date;
  isDialogVisible.value = true;
}

function onDetailsEdit(event: EventDto): void {
  isDetailsVisible.value = false;
  openEdit(event);
}

function onDetailsRemove(event: EventDto): void {
  isDetailsVisible.value = false;
  confirmDelete(event);
}

function onDetailsUpdated(updated: EventDto): void {
  const index: number = events.value.findIndex(
    (candidate: EventDto): boolean => candidate.id === updated.id
  );

  if (index !== -1) {
    events.value[index] = updated;
  }

  selectedEvent.value = updated;
}

async function onSaved(): Promise<void> {
  await loadEvents();
}

function confirmDelete(event: EventDto): void {
  confirm.require({
    header: t('events.deleteHeader'),
    message: t('events.deleteConfirm', { title: event.title }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    rejectProps: {
      label: t('common.cancel'),
      severity: 'secondary',
      text: true,
    },
    accept: async (): Promise<void> => {
      const response: HttpResponse<null> = await eventService.remove(event.id);

      if (response.isSuccess) {
        await loadEvents();
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

async function setAttendance(
  event: EventDto,
  status: EventAttendanceStatus
): Promise<void> {
  const dto: EventSetAttendanceDto = { status };

  const response: HttpResponse<EventDto> = await eventService.setAttendance(
    event.id,
    dto
  );

  if (response.isSuccess) {
    const index: number = events.value.findIndex(
      (candidate: EventDto): boolean => candidate.id === event.id
    );

    if (index !== -1) {
      events.value[index] = response.data;
    }
  } else {
    notificationService.showError(response.error);
  }
}

function getOwnAttendance(event: EventDto): EventAttendanceStatus | null {
  const attendance: EventAttendanceDto | undefined = event.attendances.find(
    (candidate: EventAttendanceDto): boolean =>
      candidate.userId === currentUserId.value
  );

  return attendance?.status ?? null;
}

function countAttendance(
  event: EventDto,
  status: EventAttendanceStatus
): number {
  return event.attendances.filter(
    (attendance: EventAttendanceDto): boolean => attendance.status === status
  ).length;
}

onMounted(loadEvents);
</script>

<template>
  <Card>
    <template #title>
      <div class="schedule__header">
        <span>{{ t('events.title') }}</span>
        <div class="schedule__controls">
          <SelectButton
            v-model="view"
            :options="VIEW_OPTIONS"
            option-value="view"
            :allow-empty="false"
            size="small"
            :aria-label="t('events.view')"
          >
            <template #option="{ option }">
              <i :class="option.icon" />
            </template>
          </SelectButton>
          <Button
            v-if="canManage"
            :label="t('events.create')"
            icon="pi pi-plus"
            size="small"
            @click="openCreate"
          />
        </div>
      </div>
    </template>
    <template #content>
      <div v-if="isLoading" class="schedule__skeletons">
        <Skeleton height="4rem" />
        <Skeleton height="4rem" />
      </div>

      <div v-else-if="events.length === 0" class="schedule__empty">
        <i class="pi pi-calendar" />
        <p>{{ t('events.empty') }}</p>
      </div>

      <ClientOnly v-else-if="view === 'calendar'">
        <EventCalendar
          :events="events"
          @event-click="onCalendarEventClick"
          @slot-click="onCalendarSlotClick"
        />
        <template #fallback>
          <Skeleton height="24rem" />
        </template>
      </ClientOnly>

      <template v-else>
        <div class="schedule__list">
          <div v-for="event in upcomingEvents" :key="event.id" class="event">
            <div class="event__main">
              <div class="event__title-row">
                <Tag
                  :value="t(`events.types.${event.type}`)"
                  :severity="EVENT_TYPE_SEVERITIES[event.type as EventType]"
                />
                <span class="event__title">{{ event.title }}</span>
                <span v-if="event.opponent" class="event__opponent">
                  vs {{ event.opponent }}
                </span>
              </div>
              <div class="event__meta">
                <span>
                  <i class="pi pi-clock" />
                  {{ dateService.formatDateTime(event.startsAt) }}
                  <template v-if="event.endsAt">
                    — {{ dateService.formatTime(event.endsAt) }}
                  </template>
                </span>
                <span v-if="event.description" class="event__description">
                  {{ event.description }}
                </span>
              </div>
            </div>

            <div class="event__side">
              <div v-if="isMember" class="event__attendance">
                <Button
                  v-for="option in EVENT_ATTENDANCE_OPTIONS"
                  :key="option.status"
                  :icon="option.icon"
                  :aria-label="t(`events.attendance.${option.status}`)"
                  :severity="
                    getOwnAttendance(event) === option.status
                      ? 'primary'
                      : 'secondary'
                  "
                  :outlined="getOwnAttendance(event) !== option.status"
                  rounded
                  size="small"
                  @click="setAttendance(event, option.status)"
                />
              </div>
              <div class="event__counts">
                <span
                  v-for="option in EVENT_ATTENDANCE_OPTIONS"
                  :key="option.status"
                  class="event__count"
                >
                  <i :class="option.icon" />
                  {{ countAttendance(event, option.status) }}
                </span>
              </div>
              <div v-if="canManage" class="event__manage">
                <Button
                  icon="pi pi-pencil"
                  severity="secondary"
                  text
                  rounded
                  size="small"
                  :aria-label="t('common.edit')"
                  @click="openEdit(event)"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  size="small"
                  :aria-label="t('common.delete')"
                  @click="confirmDelete(event)"
                />
              </div>
            </div>
          </div>

          <p v-if="upcomingEvents.length === 0" class="schedule__no-upcoming">
            {{ t('events.noUpcoming') }}
          </p>
        </div>

        <template v-if="pastEvents.length > 0">
          <Divider />
          <Button
            :label="`${t('events.past')} (${pastEvents.length})`"
            :icon="isPastVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            severity="secondary"
            text
            size="small"
            @click="isPastVisible = !isPastVisible"
          />
          <div v-if="isPastVisible" class="schedule__list schedule__list--past">
            <div v-for="event in pastEvents" :key="event.id" class="event">
              <div class="event__main">
                <div class="event__title-row">
                  <Tag
                    :value="t(`events.types.${event.type}`)"
                    :severity="EVENT_TYPE_SEVERITIES[event.type as EventType]"
                  />
                  <span class="event__title">{{ event.title }}</span>
                  <span v-if="event.opponent" class="event__opponent">
                    vs {{ event.opponent }}
                  </span>
                </div>
                <div class="event__meta">
                  <span>
                    <i class="pi pi-clock" />
                    {{ dateService.formatDateTime(event.startsAt) }}
                  </span>
                </div>
              </div>
              <div v-if="canManage" class="event__manage">
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  size="small"
                  :aria-label="t('common.delete')"
                  @click="confirmDelete(event)"
                />
              </div>
            </div>
          </div>
        </template>
      </template>
    </template>
  </Card>

  <EventFormDialog
    v-model:visible="isDialogVisible"
    :team-id="team.id"
    :event="editedEvent"
    :initial-starts-at="createStartsAt"
    @saved="onSaved"
  />

  <EventDetailsDialog
    v-model:visible="isDetailsVisible"
    :event="selectedEvent"
    :can-attend="isMember"
    :can-manage="canManage"
    @edit="onDetailsEdit"
    @remove="onDetailsRemove"
    @updated="onDetailsUpdated"
  />
</template>

<style lang="scss" scoped>
.schedule {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__skeletons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem;
    color: $text-dim;

    .pi {
      font-size: 2rem;
      color: $text-muted;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;

    &--past {
      opacity: 0.65;
    }
  }

  &__no-upcoming {
    padding: 1rem 0;
    color: $text-dim;
    font-size: 0.9rem;
  }
}

.event {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 0.25rem;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  &__title {
    font-weight: 600;
  }

  &__opponent {
    color: $text-dim;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    color: $text-dim;
    font-size: 0.88rem;

    .pi {
      margin-right: 0.3rem;
      color: $accent;
    }
  }

  &__description {
    color: $text-muted;
  }

  &__side {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  &__attendance {
    display: flex;
    gap: 0.35rem;
  }

  &__counts {
    display: flex;
    gap: 0.6rem;
    color: $text-dim;
    font-size: 0.85rem;

    .pi {
      margin-right: 0.2rem;
      font-size: 0.75rem;
    }
  }

  &__manage {
    display: flex;
    gap: 0.25rem;
  }

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: flex-start;

    &__side {
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>
