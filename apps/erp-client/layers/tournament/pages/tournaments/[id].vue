<script setup lang="ts">
import { navigateTo, useRoute } from 'nuxt/app';
import { useConfirm } from 'primevue/useconfirm';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type {
  OrganizationDto,
  OrganizationMemberDto,
  TournamentDto,
  TournamentMatchDto,
  TournamentStageDto,
} from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import {
  OrganizationRole,
  TournamentFormat,
  TournamentStageType,
} from '@erp/types';

import type { TournamentService } from '../../composables/use-tournament-service';
import {
  TOURNAMENT_FORMAT_LABELS,
  TOURNAMENT_STATUS_LABELS,
  TOURNAMENT_STATUS_SEVERITIES,
} from '../../constants';

import type { AuthService } from '#layers/auth';
import type { DateService } from '#layers/date';
import type { NotificationService } from '#layers/notification';
import type { OrganizationService } from '#layers/organization';
import { AppRoute } from '#layers/router';

definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const confirm: ReturnType<typeof useConfirm> = useConfirm();
const route: ReturnType<typeof useRoute> = useRoute();
const authService: AuthService = useAuthService();
const dateService: DateService = useDateService();
const notificationService: NotificationService = useNotificationService();
const organizationService: OrganizationService = useOrganizationService();
const tournamentService: TournamentService = useTournamentService();

const tournamentId: number = Number(route.params.id);

const tournament: Ref<TournamentDto | null> = ref(null);
const isLoading: Ref<boolean> = ref(true);
const isMatchDialogVisible: Ref<boolean> = ref(false);
const selectedMatch: Ref<TournamentMatchDto | null> = ref(null);

const isManager: ComputedRef<boolean> = computed((): boolean => {
  const org: OrganizationDto | null = organizationService.current.value;
  const userId: number | undefined = authService.user.value?.id;

  if (!org || userId === undefined || tournament.value === null) {
    return false;
  }

  if (org.id !== tournament.value.organizationId) {
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
const sortedStages: ComputedRef<TournamentStageDto[]> = computed(
  (): TournamentStageDto[] =>
    [...(tournament.value?.stages ?? [])].sort(
      (a: TournamentStageDto, b: TournamentStageDto): number => a.order - b.order
    )
);
const canSeedPlayoff: ComputedRef<boolean> = computed(
  (): boolean =>
    isManager.value &&
    tournament.value?.format === TournamentFormat.GROUPS_PLAYOFF
);

async function loadTournament(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<TournamentDto> =
    await tournamentService.getById(tournamentId);

  if (response.isSuccess) {
    tournament.value = response.data;
  } else {
    notificationService.showError(response.error);
  }

  isLoading.value = false;
}

function matchesForStage(stageId: number): TournamentMatchDto[] {
  return (tournament.value?.matches ?? []).filter(
    (match: TournamentMatchDto): boolean => match.stageId === stageId
  );
}

function groupIndexes(stage: TournamentStageDto): number[] {
  return Array.from({ length: stage.groupCount ?? 1 }, (_, i: number): number => i);
}

function openMatch(match: TournamentMatchDto): void {
  selectedMatch.value = match;
  isMatchDialogVisible.value = true;
}

function onMatchSaved(updated: TournamentDto): void {
  tournament.value = updated;
}

async function seedPlayoff(): Promise<void> {
  const response: HttpResponse<TournamentDto> =
    await tournamentService.seedPlayoff(tournamentId);

  if (response.isSuccess) {
    tournament.value = response.data;
    notificationService.showSuccess(t('tournaments.playoffSeeded'));
  } else {
    notificationService.showError(response.error);
  }
}

function confirmDelete(): void {
  if (!tournament.value) {
    return;
  }

  confirm.require({
    header: t('tournaments.deleteHeader'),
    message: t('tournaments.deleteConfirm', { name: tournament.value.name }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    rejectProps: { label: t('common.cancel'), severity: 'secondary', text: true },
    accept: async (): Promise<void> => {
      const response: HttpResponse<null> = await tournamentService.remove(
        tournamentId
      );

      if (response.isSuccess) {
        await navigateTo(AppRoute.CALENDAR);
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

onMounted(async (): Promise<void> => {
  await loadTournament();
});
</script>

<template>
  <div class="tournament-detail">
    <NuxtLink :to="AppRoute.CALENDAR" class="tournament-detail__back">
      <i class="pi pi-arrow-left" /> {{ t('nav.calendar') }}
    </NuxtLink>

    <ProgressSpinner v-if="isLoading" class="tournament-detail__spinner" />

    <Message v-else-if="!tournament" severity="error" :closable="false">
      {{ t('tournaments.notFound') }}
    </Message>

    <template v-else>
      <Card>
        <template #content>
          <div class="tournament-detail__head">
            <div>
              <div class="tournament-detail__title">
                <h1>{{ tournament.name }}</h1>
                <Tag
                  :value="t(TOURNAMENT_STATUS_LABELS[tournament.status])"
                  :severity="TOURNAMENT_STATUS_SEVERITIES[tournament.status]"
                />
              </div>
              <div class="tournament-detail__meta">
                <span>
                  <i class="pi pi-sitemap" />
                  {{ t(TOURNAMENT_FORMAT_LABELS[tournament.format]) }}
                </span>
                <span>
                  <i class="pi pi-calendar" />
                  {{ dateService.formatDate(tournament.startsAt) }}
                </span>
              </div>
            </div>

            <div v-if="isManager" class="tournament-detail__actions">
              <Button
                v-if="canSeedPlayoff"
                :label="t('tournaments.seedPlayoff')"
                icon="pi pi-forward"
                severity="secondary"
                outlined
                @click="seedPlayoff"
              />
              <Button
                :label="t('common.delete')"
                icon="pi pi-trash"
                severity="danger"
                outlined
                @click="confirmDelete"
              />
            </div>
          </div>
        </template>
      </Card>

      <Card v-for="stage in sortedStages" :key="stage.id">
        <template #title>{{ stage.name }}</template>
        <template #content>
          <div
            v-if="stage.type === TournamentStageType.GROUP"
            class="tournament-detail__groups"
          >
            <TournamentGroupTable
              v-for="groupIndex in groupIndexes(stage)"
              :key="groupIndex"
              :participants="tournament.participants"
              :matches="matchesForStage(stage.id)"
              :group-index="groupIndex"
              :can-manage="isManager"
              @select="openMatch"
            />
          </div>

          <TournamentBracket
            v-else
            :matches="matchesForStage(stage.id)"
            :can-manage="isManager"
            @select="openMatch"
          />
        </template>
      </Card>

      <TournamentMatchDialog
        v-model:visible="isMatchDialogVisible"
        :tournament-id="tournamentId"
        :match="selectedMatch"
        @saved="onMatchSaved"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.tournament-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    width: fit-content;
    color: $text-dim;
    font-size: 0.9rem;
    text-decoration: none;

    &:hover {
      color: $accent;
    }
  }

  &__spinner {
    align-self: center;
    margin-top: 4rem;
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    h1 {
      font-size: 1.4rem;
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.6rem;
    color: $text-dim;
    font-size: 0.9rem;

    .pi {
      margin-right: 0.3rem;
      color: $accent;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  &__groups {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  @media (max-width: $mobile) {
    &__head {
      flex-direction: column;
    }
  }
}
</style>
