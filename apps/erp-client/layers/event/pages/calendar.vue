<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import {
  computed,
  type ComputedRef,
  onMounted,
  type Ref,
  ref,
  watch,
} from 'vue';

import type {
  EventDto,
  EventGetListDto,
  OrganizationDto,
  OrganizationMemberDto,
  TournamentDto,
  TournamentMatchDto,
} from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { EventType, OrganizationRole } from '@erp/types';

import type EventCalendar from '../components/event-calendar.vue';
import type { EventService } from '../composables/use-event-service';

import type { AuthService } from '#layers/auth';
import type { NotificationService } from '#layers/notification';
import type { OrganizationService } from '#layers/organization';
import { AppRoute } from '#layers/router';
import type { TournamentService } from '#layers/tournament';

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
const authService: AuthService = useAuthService();
const eventService: EventService = useEventService();
const notificationService: NotificationService = useNotificationService();
const organizationService: OrganizationService = useOrganizationService();
const tournamentService: TournamentService = useTournamentService();

const calendarRef: Ref<InstanceType<typeof EventCalendar> | null> = ref(null);
const events: Ref<EventDto[]> = ref([]);
const matches: Ref<TournamentMatchDto[]> = ref([]);
const tournaments: Ref<TournamentDto[]> = ref([]);
const isCreateDialogVisible: Ref<boolean> = ref(false);

const organization: ComputedRef<OrganizationDto | null> = computed(
  (): OrganizationDto | null => organizationService.current.value
);
const isManager: ComputedRef<boolean> = computed((): boolean => {
  const org: OrganizationDto | null = organization.value;
  const userId: number | undefined = authService.user.value?.id;

  if (!org || userId === undefined) {
    return false;
  }

  if (org.ownerId === userId) {
    return true;
  }

  return org.members.some(
    (member: OrganizationMemberDto): boolean =>
      member.role === OrganizationRole.ADMIN && member.user?.id === userId
  );
});
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

async function loadMatches(dto: EventGetListDto): Promise<void> {
  const response: HttpResponse<TournamentMatchDto[]> =
    await tournamentService.getMatchesForMember(dto);

  if (response.isSuccess) {
    matches.value = response.data;
  }
}

async function onRangeChange(dto: EventGetListDto): Promise<void> {
  await Promise.all([loadEvents(dto), loadMatches(dto)]);
}

async function loadTournaments(): Promise<void> {
  const org: OrganizationDto | null =
    organization.value ?? (await organizationService.fetchCurrent());

  if (!org) {
    return;
  }

  const response: HttpResponse<TournamentDto[]> =
    await tournamentService.getForOrganization(org.id);

  if (response.isSuccess) {
    tournaments.value = response.data;
  }
}

async function onMatchClick(match: TournamentMatchDto): Promise<void> {
  await navigateTo(
    buildAppRoute(AppRoute.TOURNAMENTS_BY_ID, { id: match.tournamentId })
  );
}

async function onTournamentClick(tournament: TournamentDto): Promise<void> {
  await navigateTo(
    buildAppRoute(AppRoute.TOURNAMENTS_BY_ID, { id: tournament.id })
  );
}

async function onTournamentCreated(created: TournamentDto): Promise<void> {
  await navigateTo(buildAppRoute(AppRoute.TOURNAMENTS_BY_ID, { id: created.id }));
}

onMounted(async (): Promise<void> => {
  await loadTournaments();
});

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
    <div class="calendar-page__header">
      <h1>{{ t('events.calendarTitle') }}</h1>
      <Button
        v-if="isManager && organization"
        :label="t('tournaments.create')"
        icon="pi pi-sitemap"
        size="small"
        @click="isCreateDialogVisible = true"
      />
    </div>

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
              :matches="matches"
              :tournaments="tournaments"
              @event-click="onEventClick"
              @match-click="onMatchClick"
              @tournament-click="onTournamentClick"
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

    <TournamentCreateDialog
      v-if="organization"
      v-model:visible="isCreateDialogVisible"
      :organization-id="organization.id"
      @saved="onTournamentCreated"
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

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
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

    &--match::before {
      background: $color-loss;
    }
  }
}
</style>
