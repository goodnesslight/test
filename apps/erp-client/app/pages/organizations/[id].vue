<script setup lang="ts">
import { navigateTo, useRoute } from 'nuxt/app';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type { OrganizationDto, TeamDto } from '@shared/dtos';
import type { HttpResponse } from '@shared/types';

import type { AuthService } from '../../../layers/auth/composables/use-auth-service';
import type { OrganizationService } from '../../../layers/organization/composables/use-organization-service';

definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const route: ReturnType<typeof useRoute> = useRoute();
const confirm: ReturnType<typeof useConfirm> = useConfirm();
const toast: ReturnType<typeof useToast> = useToast();
const authService: AuthService = useAuthService();
const organizationService: OrganizationService = useOrganizationService();

const organizationId: number = Number(route.params.id);
const organization: Ref<OrganizationDto | null> = ref(null);
const isLoading: Ref<boolean> = ref(true);
const isEditDialogVisible: Ref<boolean> = ref(false);
const isTeamDialogVisible: Ref<boolean> = ref(false);

const isOwner: ComputedRef<boolean> = computed(
  (): boolean =>
    organization.value !== null &&
    authService.user.value !== null &&
    organization.value.ownerId === authService.user.value.id
);

async function loadOrganization(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<OrganizationDto> =
    await organizationService.getById(organizationId);

  if (response.isSuccess) {
    organization.value = response.data;
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

function onSaved(saved: OrganizationDto): void {
  organization.value = { ...saved, teams: organization.value?.teams ?? [] };
}

async function onTeamSaved(): Promise<void> {
  await loadOrganization();
}

async function openTeam(teamId: number): Promise<void> {
  await navigateTo(`/teams/${teamId}`);
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
        organizationId
      );

      if (response.isSuccess) {
        await navigateTo('/organizations');
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

onMounted(loadOrganization);
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
                  {{ organization.teams.length }}
                </span>
                <span>
                  <i class="pi pi-calendar" />
                  {{ t('organizations.created') }}:
                  {{ formatDate(organization.createdAt) }}
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
          <div class="org-page__teams-header">
            <span>{{ t('teams.title') }}</span>
            <Button
              v-if="isOwner"
              :label="t('teams.create')"
              icon="pi pi-plus"
              size="small"
              @click="isTeamDialogVisible = true"
            />
          </div>
        </template>
        <template #content>
          <div v-if="organization.teams.length === 0" class="org-page__empty">
            <i class="pi pi-users" />
            <p>{{ t('teams.empty') }}</p>
          </div>

          <div v-else class="org-page__teams">
            <button
              v-for="team in organization.teams"
              :key="team.id"
              type="button"
              class="team-card"
              @click="openTeam(team.id)"
            >
              <span class="team-card__icon">
                <i class="pi pi-desktop" />
              </span>
              <span class="team-card__name">{{ team.name }}</span>
              <span class="team-card__game">{{ getGameLabel(team.game) }}</span>
              <span class="team-card__members">
                <i class="pi pi-user" />
                {{ team.members?.length ?? 0 }}
              </span>
            </button>
          </div>
        </template>
      </Card>

      <OrganizationFormDialog
        v-model:visible="isEditDialogVisible"
        :organization="organization"
        @saved="onSaved"
      />
      <TeamFormDialog
        v-model:visible="isTeamDialogVisible"
        :organization-id="organizationId"
        @saved="onTeamSaved"
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

  &__teams-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__teams {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
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

  &__game {
    font-size: 0.85rem;
    color: $text-dim;
  }

  &__members {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.85rem;
    color: $text-dim;
  }
}
</style>
