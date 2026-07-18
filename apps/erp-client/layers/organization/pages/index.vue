<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import { useConfirm } from 'primevue/useconfirm';
import {
  computed,
  type ComputedRef,
  onMounted,
  type Ref,
  ref,
  type WritableComputedRef,
} from 'vue';

import type {
  GameDto,
  OrganizationDto,
  OrganizationInviteDto,
  OrganizationMemberDto,
  TeamDto,
} from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { GameType, OrganizationRole, TeamType } from '@erp/types';

import type { OrganizationService } from '../composables/use-organization-service';

import type { AuthService } from '#layers/auth';
import type { DateService } from '#layers/date';
import type { GameService } from '#layers/game';
import type { NotificationService } from '#layers/notification';
import { AppRoute } from '#layers/router';

definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const confirm: ReturnType<typeof useConfirm> = useConfirm();
const authService: AuthService = useAuthService();
const dateService: DateService = useDateService();
const gameService: GameService = useGameService();
const notificationService: NotificationService = useNotificationService();
const organizationService: OrganizationService = useOrganizationService();

const organization: Ref<OrganizationDto | null> = organizationService.current;
const isLoading: Ref<boolean> = ref(true);
const isEditDialogVisible: Ref<boolean> = ref(false);
const isGameDialogVisible: Ref<boolean> = ref(false);
const isAdminDialogVisible: Ref<boolean> = ref(false);
const isInviteDialogVisible: Ref<boolean> = ref(false);
const invites: Ref<OrganizationInviteDto[]> = ref([]);
const teamDialogGame: Ref<GameDto | null> = ref(null);

const organizationId: ComputedRef<number> = computed(
  (): number => organization.value?.id ?? 0
);
const isOwner: ComputedRef<boolean> = computed(
  (): boolean =>
    organization.value !== null &&
    authService.user.value !== null &&
    organization.value.ownerId === authService.user.value.id
);
const isManager: ComputedRef<boolean> = computed((): boolean => {
  if (organization.value === null || authService.user.value === null) {
    return false;
  }

  if (isOwner.value) {
    return true;
  }

  return organization.value.members.some(
    (member: OrganizationMemberDto): boolean =>
      member.role === OrganizationRole.ADMIN &&
      member.user?.id === authService.user.value?.id
  );
});
const admins: ComputedRef<OrganizationMemberDto[]> = computed(
  (): OrganizationMemberDto[] => organization.value?.members ?? []
);
const existingGameTypes: ComputedRef<GameType[]> = computed(
  (): GameType[] =>
    organization.value?.games.map((game: GameDto): GameType => game.type) ?? []
);
const canAddGame: ComputedRef<boolean> = computed(
  (): boolean =>
    isManager.value &&
    existingGameTypes.value.length < Object.values(GameType).length
);
const teamsCount: ComputedRef<number> = computed(
  (): number =>
    organization.value?.games.reduce(
      (sum: number, game: GameDto): number => sum + (game.teams?.length ?? 0),
      0
    ) ?? 0
);
const isTeamDialogVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => teamDialogGame.value !== null,
  set: (value: boolean): void => {
    if (!value) {
      teamDialogGame.value = null;
    }
  },
});
const teamDialogExistingTypes: ComputedRef<TeamType[]> = computed(
  (): TeamType[] =>
    teamDialogGame.value?.teams.map((team: TeamDto): TeamType => team.type) ??
    []
);

async function loadOrganization(): Promise<void> {
  isLoading.value = true;

  const current: OrganizationDto | null =
    await organizationService.fetchCurrent();

  if (!current) {
    notificationService.showError(t('organizations.notFound'));
  }

  isLoading.value = false;
}

async function loadInvites(): Promise<void> {
  const response: HttpResponse<OrganizationInviteDto[]> =
    await organizationService.getInvites(organizationId.value);

  if (response.isSuccess) {
    invites.value = response.data;
  }
}

function onSaved(saved: OrganizationDto): void {
  organization.value = { ...saved, games: organization.value?.games ?? [] };
}

function onAdminSaved(updated: OrganizationDto): void {
  organization.value = updated;
}

async function onGameSaved(): Promise<void> {
  await loadOrganization();
}

async function onTeamSaved(): Promise<void> {
  await loadOrganization();
}

async function onInviteSaved(): Promise<void> {
  await loadInvites();
}

function openTeamDialog(game: GameDto): void {
  teamDialogGame.value = game;
}

async function openTeam(teamId: number): Promise<void> {
  await navigateTo(buildAppRoute(AppRoute.TEAMS_BY_ID, { id: teamId }));
}

function canCreateTeam(game: GameDto): boolean {
  return (game.teams?.length ?? 0) < Object.values(TeamType).length;
}

function confirmRemoveAdmin(member: OrganizationMemberDto): void {
  confirm.require({
    header: t('organizations.admins.removeHeader'),
    message: t('organizations.admins.removeConfirm', {
      username: formatUserName(member.user),
    }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: {
      label: t('organizations.admins.remove'),
      severity: 'danger',
    },
    rejectProps: {
      label: t('common.cancel'),
      severity: 'secondary',
      text: true,
    },
    accept: async (): Promise<void> => {
      const response: HttpResponse<OrganizationDto> =
        await organizationService.removeAdmin(organizationId.value, member.id);

      if (response.isSuccess) {
        organization.value = response.data;
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

function confirmRevokeInvite(invite: OrganizationInviteDto): void {
  confirm.require({
    header: t('organizations.invites.revokeHeader'),
    message: t('organizations.invites.revokeConfirm', { email: invite.email }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: {
      label: t('organizations.invites.revoke'),
      severity: 'danger',
    },
    rejectProps: {
      label: t('common.cancel'),
      severity: 'secondary',
      text: true,
    },
    accept: async (): Promise<void> => {
      const response: HttpResponse<null> =
        await organizationService.revokeInvite(organizationId.value, invite.id);

      if (response.isSuccess) {
        await loadInvites();
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

function confirmDeleteGame(game: GameDto): void {
  confirm.require({
    header: t('games.deleteHeader'),
    message: t('games.deleteConfirm', { game: getGameLabel(game.type) }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    rejectProps: {
      label: t('common.cancel'),
      severity: 'secondary',
      text: true,
    },
    accept: async (): Promise<void> => {
      const response: HttpResponse<null> = await gameService.remove(game.id);

      if (response.isSuccess) {
        await loadOrganization();
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

function confirmDelete(): void {
  if (!organization.value) {
    return;
  }

  confirm.require({
    header: t('organizations.deleteHeader'),
    message: t('organizations.deleteConfirm', {
      name: organization.value.name,
    }),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    rejectProps: {
      label: t('common.cancel'),
      severity: 'secondary',
      text: true,
    },
    accept: async (): Promise<void> => {
      const response: HttpResponse<null> = await organizationService.remove(
        organizationId.value
      );

      if (response.isSuccess) {
        organizationService.current.value = null;
        await navigateTo(AppRoute.LOGIN);
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

onMounted(async (): Promise<void> => {
  await loadOrganization();

  if (isManager.value) {
    await loadInvites();
  }
});
</script>

<template>
  <div class="org-page">
    <ProgressSpinner v-if="isLoading" class="org-page__spinner" />

    <template v-else-if="organization">
      <Card>
        <template #content>
          <div class="org-page__header">
            <Avatar
              :image="organization.logoUrl ?? undefined"
              :label="
                organization.logoUrl
                  ? undefined
                  : organization.name[0]?.toUpperCase()
              "
              size="xlarge"
              shape="circle"
            />
            <div class="org-page__info">
              <div class="org-page__name">
                <h1>{{ organization.name }}</h1>
                <Tag :value="organization.tag" severity="secondary" />
              </div>
              <div class="org-page__meta">
                <span>
                  <i class="pi pi-users" />
                  {{ t('organizations.teamsCount') }}:
                  {{ teamsCount }}
                </span>
                <span>
                  <i class="pi pi-calendar" />
                  {{ t('organizations.created') }}:
                  {{ dateService.formatDate(organization.createdAt) }}
                </span>
              </div>
            </div>
            <div v-if="isOwner" class="org-page__actions">
              <Button
                :label="t('common.edit')"
                icon="pi pi-pencil"
                severity="secondary"
                outlined
                @click="isEditDialogVisible = true"
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

      <Card>
        <template #title>
          <div class="org-page__games-header">
            <span>{{ t('games.title') }}</span>
            <Button
              v-if="canAddGame"
              :label="t('games.add')"
              icon="pi pi-plus"
              size="small"
              @click="isGameDialogVisible = true"
            />
          </div>
        </template>
        <template #content>
          <div v-if="organization.games.length === 0" class="org-page__empty">
            <i class="pi pi-desktop" />
            <p>{{ t('games.empty') }}</p>
          </div>

          <div v-else class="org-page__games">
            <section
              v-for="game in organization.games"
              :key="game.id"
              class="game-section"
            >
              <div class="game-section__header">
                <span class="game-section__name">
                  <i :class="getGameIcon(game.type)" />
                  {{ getGameLabel(game.type) }}
                </span>
                <div v-if="isManager" class="game-section__actions">
                  <Button
                    v-if="canCreateTeam(game)"
                    :label="t('teams.create')"
                    icon="pi pi-plus"
                    size="small"
                    text
                    @click="openTeamDialog(game)"
                  />
                  <Button
                    icon="pi pi-trash"
                    :aria-label="t('common.delete')"
                    severity="danger"
                    text
                    rounded
                    size="small"
                    @click="confirmDeleteGame(game)"
                  />
                </div>
              </div>

              <p v-if="game.teams.length === 0" class="game-section__empty">
                {{ t('teams.empty') }}
              </p>

              <div v-else class="game-section__teams">
                <button
                  v-for="team in game.teams"
                  :key="team.id"
                  type="button"
                  class="team-card"
                  @click="openTeam(team.id)"
                >
                  <span class="team-card__icon">
                    <i class="pi pi-users" />
                  </span>
                  <span class="team-card__name">
                    {{ t(`teams.types.${team.type}`) }}
                  </span>
                  <span class="team-card__members">
                    <i class="pi pi-user" />
                    {{ team.members?.length ?? 0 }}
                  </span>
                </button>
              </div>
            </section>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>
          <div class="org-page__games-header">
            <span>{{ t('organizations.management') }}</span>
            <Button
              v-if="isOwner"
              :label="t('organizations.admins.add')"
              icon="pi pi-user-plus"
              size="small"
              @click="isAdminDialogVisible = true"
            />
          </div>
        </template>
        <template #content>
          <div class="org-members">
            <div v-for="member in admins" :key="member.id" class="org-member">
              <Avatar
                :image="member.user?.avatarUrl ?? undefined"
                :label="
                  member.user?.avatarUrl
                    ? undefined
                    : member.user?.firstName[0]?.toUpperCase()
                "
                shape="circle"
              />
              <NuxtLink
                :to="
                  buildAppRoute(AppRoute.USERS_BY_ID, {
                    id: member.user?.id ?? 0,
                  })
                "
                class="org-member__name"
              >
                {{ formatUserName(member.user) }}
              </NuxtLink>
              <Tag
                :value="t(`organizations.roles.${member.role}`)"
                :severity="
                  member.role === OrganizationRole.OWNER ? 'warn' : 'info'
                "
              />
              <Button
                v-if="isOwner && member.role === OrganizationRole.ADMIN"
                icon="pi pi-times"
                :aria-label="t('organizations.admins.remove')"
                severity="danger"
                text
                rounded
                size="small"
                @click="confirmRemoveAdmin(member)"
              />
            </div>
          </div>
        </template>
      </Card>

      <Card v-if="isManager">
        <template #title>
          <div class="org-page__games-header">
            <span>{{ t('organizations.invites.title') }}</span>
            <Button
              :label="t('organizations.invites.add')"
              icon="pi pi-envelope"
              size="small"
              @click="isInviteDialogVisible = true"
            />
          </div>
        </template>
        <template #content>
          <div v-if="invites.length === 0" class="org-page__empty">
            <i class="pi pi-envelope" />
            <p>{{ t('organizations.invites.empty') }}</p>
          </div>

          <div v-else class="org-invites">
            <div v-for="invite in invites" :key="invite.id" class="org-invite">
              <i class="pi pi-envelope org-invite__icon" />
              <span class="org-invite__email">
                {{ `${invite.firstName} ${invite.lastName}` }}
                <small>{{ invite.email }}</small>
              </span>
              <Tag
                :value="t(`organizations.roles.${invite.role}`)"
                severity="info"
              />
              <Button
                icon="pi pi-times"
                :aria-label="t('organizations.invites.revoke')"
                severity="danger"
                text
                rounded
                size="small"
                @click="confirmRevokeInvite(invite)"
              />
            </div>
          </div>
        </template>
      </Card>

      <OrganizationFormDialog
        v-model:visible="isEditDialogVisible"
        :organization="organization"
        @saved="onSaved"
      />
      <GameCreateDialog
        v-model:visible="isGameDialogVisible"
        :organization-id="organizationId"
        :existing-types="existingGameTypes"
        @saved="onGameSaved"
      />
      <TeamCreateDialog
        v-if="teamDialogGame"
        v-model:visible="isTeamDialogVisible"
        :game-id="teamDialogGame.id"
        :existing-types="teamDialogExistingTypes"
        @saved="onTeamSaved"
      />
      <OrganizationAdminDialog
        v-model:visible="isAdminDialogVisible"
        :organization-id="organizationId"
        @saved="onAdminSaved"
      />
      <OrganizationInviteDialog
        v-model:visible="isInviteDialogVisible"
        :organization-id="organizationId"
        @saved="onInviteSaved"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.org-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__spinner {
    align-self: center;
    margin-top: 4rem;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
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

  &__games-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__games {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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

  @media (max-width: $mobile) {
    &__header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}

.game-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;

    .pi {
      color: $accent;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__empty {
    padding: 0.5rem 0;
    color: $text-dim;
    font-size: 0.9rem;
  }

  &__teams {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
}

.team-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1.1rem 1.2rem;
  background: $bg-card-alt;
  border: 1px solid $border;
  border-radius: 14px;
  color: $text-primary;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    background: $bg-card-hover;
    border-color: $accent-border;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: $accent-soft;
    color: $accent;
  }

  &__name {
    font-size: 1rem;
    font-weight: 600;
  }

  &__members {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: $text-dim;
  }
}

.org-members {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.org-member {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &__name {
    flex: 1;
    color: $text-primary;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: $accent;
    }
  }
}

.org-invites {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.org-invite {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &__icon {
    color: $accent;
  }

  &__email {
    flex: 1;
    display: flex;
    flex-direction: column;
    color: $text-primary;
    font-weight: 500;

    small {
      color: $text-dim;
      font-weight: 400;
    }
  }
}
</style>
