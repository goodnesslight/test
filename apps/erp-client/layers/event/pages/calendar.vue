<script setup lang="ts">
import { computed, type ComputedRef, type Ref, ref, watch } from 'vue';

import type { EventDto, EventGetListDto } from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { EventType } from '@erp/types';

import type EventCalendar from '../components/event-calendar.vue';
import type { EventService } from '../composables/use-event-service';

import type { NotificationService } from '#layers/notification';

definePageMeta({
  middleware: 'auth',
});

interface EventTeamOption {
  id: number;
  label: string;
}

interface EventTypeOption {
  label: string;
  value: EventType;
}

const { t } = useI18n();
const eventService: EventService = useEventService();
const notificationService: NotificationService = useNotificationService();

const calendarRef: Ref<InstanceType<typeof EventCalendar> | null> = ref(null);
const events: Ref<EventDto[]> = ref([]);
const selectedEvent: Ref<EventDto | null> = ref(null);
const isDetailsVisible: Ref<boolean> = ref(false);
const selectedDate: Ref<Date> = ref(new Date());
const knownTeamIds: Ref<number[]> = ref([]);
const selectedTeamIds: Ref<number[]> = ref([]);
const selectedTypes: Ref<EventType[]> = ref(Object.values(EventType));

const teamOptions: ComputedRef<EventTeamOption[]> = computed(
  (): EventTeamOption[] => {
    const options: Map<number, EventTeamOption> = new Map();

    for (const event of events.value) {
      if (event.team && !options.has(event.teamId)) {
        const tag: string = event.team.game?.organization?.tag ?? '';

        options.set(event.teamId, {
          id: event.teamId,
          label: `${tag ? `[${tag}] ` : ''}${t(
            `teams.types.${event.team.type}`
          )}`,
        });
      }
    }

    return [...options.values()];
  }
);
const typeOptions: ComputedRef<EventTypeOption[]> = computed(
  (): EventTypeOption[] =>
    Object.values(EventType).map(
      (value: EventType): EventTypeOption => ({
        label: t(`events.types.${value}`),
        value,
      })
    )
);
const visibleEvents: ComputedRef<EventDto[]> = computed((): EventDto[] =>
  events.value.filter(
    (event: EventDto): boolean =>
      selectedTeamIds.value.includes(event.teamId) &&
      selectedTypes.value.includes(event.type)
  )
);

watch(selectedDate, (date: Date): void => {
  calendarRef.value?.gotoDate(date);
});

async function loadEvents(dto: EventGetListDto): Promise<void> {
  const response: HttpResponse<EventDto[]> = await eventService.getMy(dto);

  if (response.isSuccess) {
    events.value = response.data;
    syncTeamSelection(response.data);
  } else {
    notificationService.showError(response.error);
  }
}

async function onRangeChange(dto: EventGetListDto): Promise<void> {
  await loadEvents(dto);
}

function onEventClick(event: EventDto): void {
  selectedEvent.value = event;
  isDetailsVisible.value = true;
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

function syncTeamSelection(loaded: EventDto[]): void {
  for (const event of loaded) {
    if (!knownTeamIds.value.includes(event.teamId)) {
      knownTeamIds.value.push(event.teamId);
      selectedTeamIds.value.push(event.teamId);
    }
  }
}
</script>

<template>
  <div class="calendar-page">
    <h1>{{ t('events.calendarTitle') }}</h1>

    <div class="calendar-page__body">
      <aside class="calendar-page__sidebar">
        <Card>
          <template #content>
            <DatePicker
              v-model="selectedDate"
              inline
              class="calendar-page__mini"
            />
          </template>
        </Card>

        <Card v-if="teamOptions.length > 0">
          <template #title>{{ t('teams.title') }}</template>
          <template #content>
            <div class="calendar-filter">
              <div
                v-for="option in teamOptions"
                :key="option.id"
                class="calendar-filter__item"
              >
                <Checkbox
                  v-model="selectedTeamIds"
                  :input-id="`calendar-team-${option.id}`"
                  :value="option.id"
                />
                <label :for="`calendar-team-${option.id}`">
                  {{ option.label }}
                </label>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>{{ t('events.filterTypes') }}</template>
          <template #content>
            <div class="calendar-filter">
              <div
                v-for="option in typeOptions"
                :key="option.value"
                class="calendar-filter__item"
              >
                <Checkbox
                  v-model="selectedTypes"
                  :input-id="`calendar-type-${option.value}`"
                  :value="option.value"
                />
                <label
                  :for="`calendar-type-${option.value}`"
                  class="calendar-filter__label"
                  :class="`calendar-filter__label--${option.value}`"
                >
                  {{ option.label }}
                </label>
              </div>
            </div>
          </template>
        </Card>
      </aside>

      <Card class="calendar-page__main">
        <template #content>
          <ClientOnly>
            <EventCalendar
              ref="calendarRef"
              :events="visibleEvents"
              @event-click="onEventClick"
              @range-change="onRangeChange"
            />
            <template #fallback>
              <Skeleton height="74vh" />
            </template>
          </ClientOnly>
        </template>
      </Card>
    </div>

    <EventDetailsDialog
      v-model:visible="isDetailsVisible"
      :event="selectedEvent"
      can-attend
      show-team-link
      @updated="onDetailsUpdated"
    />
  </div>
</template>

<style lang="scss" scoped>
.calendar-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h1 {
    font-size: 1.5rem;
  }

  &__body {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 1.25rem;
    align-items: start;
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__mini {
    width: 100%;

    :deep(.p-datepicker-panel) {
      width: 100%;
      min-width: 0;
      padding: 0;
      border: none;
      background: transparent;
    }

    :deep(.p-datepicker-day-view) {
      width: 100%;
      margin: 0.5rem 0 0;
    }

    :deep(.p-datepicker-day-cell),
    :deep(.p-datepicker-weekday-cell) {
      padding: 0.1rem;
    }

    :deep(.p-datepicker-day) {
      width: 2rem;
      height: 2rem;
      font-size: 0.85rem;
    }

    :deep(.p-datepicker-weekday) {
      font-size: 0.8rem;
    }
  }

  @media (max-width: $mobile) {
    &__body {
      grid-template-columns: 1fr;
    }
  }
}

.calendar-filter {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &__item {
    display: flex;
    align-items: center;
    gap: 0.6rem;

    label {
      color: $text-secondary;
      font-size: 0.92rem;
      cursor: pointer;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 0.45rem;

    &::before {
      content: '';
      width: 0.6rem;
      height: 0.6rem;
      border-radius: 3px;
    }

    &--practice::before {
      background: $accent;
    }

    &--scrim::before {
      background: $color-warn;
    }

    &--match::before {
      background: $color-loss;
    }

    &--tournament::before {
      background: $color-win;
    }
  }
}
</style>
