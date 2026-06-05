<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type { OrganizationDto, TeamDto } from '@shared/dtos';
import type { HttpResponse } from '@shared/types';

import type { OrganizationService } from '../../layers/organization/composables/use-organization-service';

definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const organizationService: OrganizationService = useOrganizationService();

const organizations: Ref<OrganizationDto[]> = ref([]);
const isLoading: Ref<boolean> = ref(true);

const totalTeams: ComputedRef<number> = computed((): number =>
  organizations.value.reduce(
    (sum: number, organization: OrganizationDto): number =>
      sum + (organization.teams?.length ?? 0),
    0
  )
);
const totalPlayers: ComputedRef<number> = computed((): number =>
  organizations.value.reduce(
    (sum: number, organization: OrganizationDto): number =>
      sum +
      (organization.teams ?? []).reduce(
        (teamSum: number, team: TeamDto): number =>
          teamSum + (team.members?.length ?? 0),
        0
      ),
    0
  )
);

async function loadOrganizations(): Promise<void> {
  const response: HttpResponse<OrganizationDto[]> =
    await organizationService.getMyOrganizations();

  if (response.isSuccess) {
    organizations.value = response.data;
  }

  isLoading.value = false;
}

async function openOrganization(id: number): Promise<void> {
  await navigateTo(`/organizations/${id}`);
}

onMounted(loadOrganizations);
</script>

<template>
  <div class="dashboard">
    <section class="dashboard__tiles">
      <NuxtLink to="/organizations" class="tile tile--highlight">
        <span class="tile__icon"><i class="pi pi-building" /></span>
        <div class="tile__body">
          <Skeleton v-if="isLoading" width="2.5rem" height="1.4rem" />
          <span v-else class="tile__value">{{ organizations.length }}</span>
          <span class="tile__label">{{ t('dashboard.organizations') }}</span>
        </div>
      </NuxtLink>

      <div class="tile">
        <span class="tile__icon"><i class="pi pi-users" /></span>
        <div class="tile__body">
          <Skeleton v-if="isLoading" width="2.5rem" height="1.4rem" />
          <span v-else class="tile__value">{{ totalTeams }}</span>
          <span class="tile__label">{{ t('dashboard.teams') }}</span>
        </div>
      </div>

      <div class="tile">
        <span class="tile__icon"><i class="pi pi-user" /></span>
        <div class="tile__body">
          <Skeleton v-if="isLoading" width="2.5rem" height="1.4rem" />
          <span v-else class="tile__value">{{ totalPlayers }}</span>
          <span class="tile__label">{{ t('dashboard.players') }}</span>
        </div>
      </div>

      <NuxtLink to="/organizations" class="tile tile--add">
        <i class="pi pi-plus" />
      </NuxtLink>
    </section>

    <Card class="dashboard__orgs">
      <template #title>
        <div class="dashboard__orgs-header">
          <span>{{ t('dashboard.myOrganizations') }}</span>
          <NuxtLink to="/organizations">
            <Button
              :label="t('dashboard.goToOrganizations')"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="small"
              text
            />
          </NuxtLink>
        </div>
      </template>
      <template #content>
        <div v-if="isLoading" class="dashboard__skeletons">
          <Skeleton height="3.2rem" />
          <Skeleton height="3.2rem" />
        </div>

        <div
          v-else-if="organizations.length === 0"
          class="dashboard__empty"
        >
          <i class="pi pi-building" />
          <p>{{ t('organizations.empty') }}</p>
        </div>

        <div v-else class="dashboard__list">
          <button
            v-for="organization in organizations"
            :key="organization.id"
            type="button"
            class="org-row"
            @click="openOrganization(organization.id)"
          >
            <Avatar
              :image="organization.logoUrl ?? undefined"
              :label="
                organization.logoUrl
                  ? undefined
                  : organization.name[0]?.toUpperCase()
              "
              shape="circle"
            />
            <span class="org-row__name">{{ organization.name }}</span>
            <Tag :value="organization.tag" severity="secondary" />
            <span class="org-row__teams">
              <i class="pi pi-users" />
              {{ organization.teams?.length ?? 0 }}
            </span>
            <i class="pi pi-angle-right org-row__arrow" />
          </button>
        </div>
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }

  &__orgs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    padding: 2.5rem 1rem;
    color: $text-dim;

    .pi {
      font-size: 1.8rem;
      color: $text-muted;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
  }
}

.tile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.15rem 1.25rem;
  background: $bg-card;
  border: 1px solid $border;
  border-radius: 16px;
  color: $text-primary;
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    background: $bg-card-hover;
  }

  &--highlight {
    border-color: $accent-border;
  }

  &--add {
    justify-content: center;
    border-style: dashed;
    border-color: $border-light;
    color: $text-dim;
    font-size: 1.1rem;

    &:hover {
      border-color: $accent-border;
      color: $accent;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 12px;
    background: $accent-soft;
    color: $accent;
    font-size: 1.1rem;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  &__value {
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  &__label {
    font-size: 0.85rem;
    color: $text-dim;
  }
}

.org-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  padding: 0.8rem 0.75rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid $border;
  border-radius: 0;
  color: $text-primary;
  font-family: inherit;
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: $bg-card-hover;
    border-radius: 10px;
  }

  &__name {
    font-weight: 600;
  }

  &__teams {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-left: auto;
    color: $text-dim;
    font-size: 0.88rem;
  }

  &__arrow {
    color: $text-muted;
  }
}
</style>
