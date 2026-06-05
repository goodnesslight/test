<script setup lang="ts">
import { navigateTo, useRoute } from 'nuxt/app';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type { TeamDto } from '@shared/dtos';
import type { HttpResponse } from '@shared/types';

import type { AuthService } from '../../../layers/auth/composables/use-auth-service';
import type { TeamService } from '../../../layers/team/composables/use-team-service';

definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const route: ReturnType<typeof useRoute> = useRoute();
const confirm: ReturnType<typeof useConfirm> = useConfirm();
const toast: ReturnType<typeof useToast> = useToast();
const authService: AuthService = useAuthService();
const teamService: TeamService = useTeamService();

const teamId: number = Number(route.params.id);
const team: Ref<TeamDto | null> = ref(null);
const isLoading: Ref<boolean> = ref(true);
const isEditDialogVisible: Ref<boolean> = ref(false);

const isOwner: ComputedRef<boolean> = computed(
  (): boolean =>
    team.value?.organization !== undefined &&
    authService.user.value !== null &&
    team.value.organization.ownerId === authService.user.value.id
);

async function loadTeam(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<TeamDto> = await teamService.getById(teamId);

  if (response.isSuccess) {
    team.value = response.data;
  } else {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: response.error,
      life: 5000,
    });
  }

  isLoading.value = false;
}

function onSaved(saved: TeamDto): void {
  team.value = saved;
}

function onRosterUpdated(updated: TeamDto): void {
  team.value = updated;
}

function confirmDelete(): void {
  if (!team.value) {
    return;
  }

  const organizationId: number = team.value.organizationId;

  confirm.require({
    header: t('teams.deleteHeader'),
    message: t('teams.deleteConfirm', { name: team.value.name }),
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
        await navigateTo(`/organizations/${organizationId}`);
      } else {
        toast.add({
          severity: 'error',
          summary: t('common.error'),
          detail: response.error,
          life: 5000,
        });
      }
    },
  });
}

function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString();
}

onMounted(loadTeam);
</script>

<template>
  <div class="team-page">
    <ProgressSpinner v-if="isLoading" class="team-page__spinner" />

    <template v-else-if="team">
      <NuxtLink
        v-if="team.organization"
        :to="`/organizations/${team.organizationId}`"
        class="team-page__breadcrumb"
      >
        <i class="pi pi-arrow-left" />
        <span>{{ team.organization.name }}</span>
      </NuxtLink>

      <Card>
        <template #content>
          <div class="team-page__header">
            <span class="team-page__icon">
              <i class="pi pi-desktop" />
            </span>
            <div class="team-page__info">
              <div class="team-page__name">
                <h1>{{ team.name }}</h1>
                <Tag
                  v-if="team.organization"
                  :value="team.organization.tag"
                  severity="secondary"
                />
              </div>
              <div class="team-page__meta">
                <span>
                  <i class="pi pi-desktop" />
                  {{ getGameLabel(team.game) }}
                </span>
                <span>
                  <i class="pi pi-calendar" />
                  {{ t('teams.created') }}: {{ formatDate(team.createdAt) }}
                </span>
              </div>
            </div>
            <div v-if="isOwner" class="team-page__actions">
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

      <TeamRosterCard
        :team="team"
        :is-owner="isOwner"
        @updated="onRosterUpdated"
      />

      <TeamScheduleCard :team="team" :is-owner="isOwner" />

      <TeamFormDialog
        v-model:visible="isEditDialogVisible"
        :organization-id="team.organizationId"
        :team="team"
        @saved="onSaved"
      />
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
