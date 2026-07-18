<script setup lang="ts">
import { navigateTo, useRoute } from 'nuxt/app';
import { useConfirm } from 'primevue/useconfirm';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type {
  OrganizationLiteDto,
  OrganizationMemberDto,
  TeamDto,
  TeamMemberDto,
} from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { OrganizationRole, TeamMemberRole } from '@erp/types';

import type { TeamService } from '../../composables/use-team-service';

import type { AuthService } from '#layers/auth';
import type { DateService } from '#layers/date';
import type { NotificationService } from '#layers/notification';
import { AppRoute } from '#layers/router';

definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const route: ReturnType<typeof useRoute> = useRoute();
const confirm: ReturnType<typeof useConfirm> = useConfirm();
const authService: AuthService = useAuthService();
const dateService: DateService = useDateService();
const notificationService: NotificationService = useNotificationService();
const teamService: TeamService = useTeamService();

const teamId: number = Number(route.params.id);
const team: Ref<TeamDto | null> = ref(null);
const isLoading: Ref<boolean> = ref(true);

const currentUserId: ComputedRef<number | null> = computed(
  (): number | null => authService.user.value?.id ?? null
);
const isManager: ComputedRef<boolean> = computed((): boolean => {
  const organization: OrganizationLiteDto | undefined =
    team.value?.game?.organization;

  if (!organization || currentUserId.value === null) {
    return false;
  }

  if (organization.ownerId === currentUserId.value) {
    return true;
  }

  return (
    organization.members?.some(
      (member: OrganizationMemberDto): boolean =>
        member.role === OrganizationRole.ADMIN &&
        member.user?.id === currentUserId.value
    ) ?? false
  );
});
const isCoach: ComputedRef<boolean> = computed(
  (): boolean =>
    team.value?.members.some(
      (member: TeamMemberDto): boolean =>
        member.user?.id === currentUserId.value &&
        member.role === TeamMemberRole.COACH
    ) ?? false
);
const canManageEvents: ComputedRef<boolean> = computed(
  (): boolean => isManager.value || isCoach.value
);
const canManageRoster: ComputedRef<boolean> = computed(
  (): boolean => isManager.value || isCoach.value
);
const canAssignRoles: ComputedRef<boolean> = computed(
  (): boolean => isManager.value
);
const canManageTeam: ComputedRef<boolean> = computed(
  (): boolean => isManager.value
);
const teamName: ComputedRef<string> = computed((): string =>
  team.value ? t(`teams.types.${team.value.type}`) : ''
);

async function loadTeam(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<TeamDto> = await teamService.getById(teamId);

  if (response.isSuccess) {
    team.value = response.data;
  } else {
    notificationService.showError(response.error);
  }

  isLoading.value = false;
}

function onRosterUpdated(updated: TeamDto): void {
  team.value = updated;
}

function confirmDelete(): void {
  if (!team.value) {
    return;
  }

  confirm.require({
    header: t('teams.deleteHeader'),
    message: t('teams.deleteConfirm', { name: teamName.value }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    rejectProps: {
      label: t('common.cancel'),
      severity: 'secondary',
      text: true,
    },
    accept: async (): Promise<void> => {
      const response: HttpResponse<null> = await teamService.remove(teamId);

      if (response.isSuccess) {
        await navigateTo(AppRoute.HOME);
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

onMounted(loadTeam);
</script>

<template>
  <div class="team-page">
    <ProgressSpinner v-if="isLoading" class="team-page__spinner" />

    <template v-else-if="team">
      <NuxtLink
        v-if="team.game?.organization"
        :to="AppRoute.HOME"
        class="team-page__breadcrumb"
      >
        <i class="pi pi-arrow-left" />
        <span>{{ team.game.organization.name }}</span>
      </NuxtLink>

      <Card>
        <template #content>
          <div class="team-page__header">
            <span class="team-page__icon">
              <i class="pi pi-desktop" />
            </span>
            <div class="team-page__info">
              <div class="team-page__name">
                <h1>{{ teamName }}</h1>
                <Tag
                  v-if="team.game?.organization"
                  :value="team.game.organization.tag"
                  severity="secondary"
                />
              </div>
              <div class="team-page__meta">
                <span v-if="team.game">
                  <i :class="getGameIcon(team.game.type)" />
                  {{ getGameLabel(team.game.type) }}
                </span>
                <span>
                  <i class="pi pi-calendar" />
                  {{ t('teams.created') }}:
                  {{ dateService.formatDate(team.createdAt) }}
                </span>
              </div>
            </div>
            <div v-if="canManageTeam" class="team-page__actions">
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

      <TeamRosterCard
        :team="team"
        :can-manage-roster="canManageRoster"
        :can-assign-roles="canAssignRoles"
        @updated="onRosterUpdated"
      />

      <EventScheduleCard :team="team" :can-manage="canManageEvents" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.team-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__spinner {
    align-self: center;
    margin-top: 4rem;
  }

  &__breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $text-dim;
    font-size: 0.9rem;
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: $accent;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    border-radius: 16px;
    background: $accent-soft;
    color: $accent;
    font-size: 1.5rem;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    h1 {
      font-size: 1.4rem;
    }
  }

  &__meta {
    display: flex;
    gap: 1.5rem;
    color: $text-dim;
    font-size: 0.9rem;

    .pi {
      margin-right: 0.3rem;
      color: $accent;
    }
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }

  @media (max-width: $mobile) {
    &__header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}
</style>
