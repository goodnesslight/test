<script setup lang="ts">
import { navigateTo } from 'nuxt/app';
import type { DataTableRowClickEvent } from 'primevue/datatable';
import { onMounted, type Ref, ref } from 'vue';

import type { OrganizationDto } from '@shared/dtos';
import type { HttpResponse } from '@shared/types';

import type { OrganizationService } from '../../composables/use-organization-service';

import type { DateService } from '#layers/date';
import { AppRoute } from '#layers/router';

definePageMeta({
  middleware: 'auth',
});

const { t } = useI18n();
const dateService: DateService = useDateService();
const organizationService: OrganizationService = useOrganizationService();

const organizations: Ref<OrganizationDto[]> = ref([]);
const isLoading: Ref<boolean> = ref(true);
const isDialogVisible: Ref<boolean> = ref(false);

async function loadOrganizations(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<OrganizationDto[]> =
    await organizationService.getMy();

  if (response.isSuccess) {
    organizations.value = response.data;
  }

  isLoading.value = false;
}

async function openOrganization(event: DataTableRowClickEvent): Promise<void> {
  const organization: OrganizationDto = event.data as OrganizationDto;

  await navigateTo(
    buildAppRoute(AppRoute.ORGANIZATIONS_BY_ID, { id: organization.id })
  );
}

onMounted(loadOrganizations);
</script>

<template>
  <div class="orgs-page">
    <header class="orgs-page__header">
      <h1>{{ t('organizations.title') }}</h1>
      <Button
        :label="t('organizations.create')"
        icon="pi pi-plus"
        @click="isDialogVisible = true"
      />
    </header>

    <DataTable
      :value="organizations"
      :loading="isLoading"
      data-key="id"
      selection-mode="single"
      class="orgs-page__table"
      @row-click="openOrganization"
    >
      <template #empty>
        <div class="orgs-page__empty">
          <i class="pi pi-building" />
          <p>{{ t('organizations.empty') }}</p>
        </div>
      </template>

      <Column field="name" :header="t('organizations.name')">
        <template #body="{ data }">
          <div class="orgs-page__org">
            <Avatar
              :image="data.logoUrl ?? undefined"
              :label="data.logoUrl ? undefined : data.name[0]?.toUpperCase()"
              shape="circle"
            />
            <span class="orgs-page__org-name">{{ data.name }}</span>
            <Tag :value="data.tag" severity="secondary" />
          </div>
        </template>
      </Column>

      <Column :header="t('organizations.teamsCount')">
        <template #body="{ data }">
          <Tag
            :value="String(data.teams?.length ?? 0)"
            icon="pi pi-users"
            severity="info"
          />
        </template>
      </Column>

      <Column field="createdAt" :header="t('organizations.created')">
        <template #body="{ data }">
          {{ dateService.formatDate(data.createdAt) }}
        </template>
      </Column>
    </DataTable>

    <OrganizationFormDialog
      v-model:visible="isDialogVisible"
      @saved="loadOrganizations"
    />
  </div>
</template>

<style lang="scss" scoped>
.orgs-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h1 {
      font-size: 1.5rem;
    }
  }

  &__table {
    cursor: pointer;
  }

  &__org {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__org-name {
    font-weight: 600;
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
}
</style>
