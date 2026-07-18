<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, type Ref, ref } from 'vue';

import type {
  OrganizationDto,
  OrganizationSetActiveDto,
} from '@backoffice/dtos';
import type { HttpResponse } from '@shared/types';

import type { OrganizationService } from '../composables/use-organization-service';

import type { NotificationService } from '#layers/notification';

definePageMeta({
  middleware: 'auth',
});

const confirm: ReturnType<typeof useConfirm> = useConfirm();
const notificationService: NotificationService = useNotificationService();
const organizationService: OrganizationService = useOrganizationService();

const organizations: Ref<OrganizationDto[]> = ref([]);
const isLoading: Ref<boolean> = ref(true);
const isCreateDialogVisible: Ref<boolean> = ref(false);

async function loadOrganizations(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<OrganizationDto[]> =
    await organizationService.getAll();

  if (response.isSuccess) {
    organizations.value = response.data;
  } else {
    notificationService.showError(response.error);
  }

  isLoading.value = false;
}

function onCreated(created: OrganizationDto): void {
  organizations.value = [created, ...organizations.value];
  notificationService.showSuccess('Организация создана', created.name);
}

async function setActive(
  organization: OrganizationDto,
  isActive: boolean
): Promise<void> {
  const dto: OrganizationSetActiveDto = { isActive };
  const response: HttpResponse<OrganizationDto> =
    await organizationService.setActive(organization.id, dto);

  if (response.isSuccess) {
    organizations.value = organizations.value.map(
      (item: OrganizationDto): OrganizationDto =>
        item.id === organization.id ? response.data : item
    );
    notificationService.showSuccess(
      isActive ? 'Организация включена' : 'Организация отключена'
    );
  } else {
    notificationService.showError(response.error);
  }
}

function confirmDisable(organization: OrganizationDto): void {
  confirm.require({
    header: 'Отключить организацию',
    message: `Отключить организацию «${organization.name}»? Она станет недоступна на платформе, данные сохранятся.`,
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: 'Отключить', severity: 'danger' },
    rejectProps: { label: 'Отмена', severity: 'secondary', text: true },
    accept: async (): Promise<void> => {
      await setActive(organization, false);
    },
  });
}

onMounted(async (): Promise<void> => {
  await loadOrganizations();
});
</script>

<template>
  <div class="orgs-page">
    <div class="orgs-page__header">
      <div>
        <h1>Организации</h1>
        <p class="orgs-page__subtitle">
          Создавайте, отключайте и включайте организации платформы.
        </p>
      </div>
      <Button
        label="Создать"
        icon="pi pi-plus"
        @click="isCreateDialogVisible = true"
      />
    </div>

    <ProgressSpinner v-if="isLoading" class="orgs-page__spinner" />

    <div v-else-if="organizations.length === 0" class="orgs-page__empty">
      <i class="pi pi-building" />
      <p>Пока нет ни одной организации.</p>
    </div>

    <div v-else class="orgs-grid">
      <Card v-for="organization in organizations" :key="organization.id">
        <template #content>
          <div
            class="org-card"
            :class="{ 'org-card--disabled': !organization.isActive }"
          >
            <Avatar
              :image="organization.logoUrl ?? undefined"
              :label="
                organization.logoUrl
                  ? undefined
                  : organization.name[0]?.toUpperCase()
              "
              size="large"
              shape="circle"
            />
            <div class="org-card__info">
              <div class="org-card__name">
                <span>{{ organization.name }}</span>
                <Tag :value="organization.tag" severity="secondary" />
                <Tag
                  :value="organization.isActive ? 'Активна' : 'Отключена'"
                  :severity="organization.isActive ? 'success' : 'danger'"
                />
              </div>
              <span class="org-card__slug">{{ organization.slug }}</span>
            </div>
            <Button
              v-if="organization.isActive"
              icon="pi pi-ban"
              label="Отключить"
              severity="danger"
              size="small"
              outlined
              @click="confirmDisable(organization)"
            />
            <Button
              v-else
              icon="pi pi-check"
              label="Включить"
              severity="success"
              size="small"
              outlined
              @click="setActive(organization, true)"
            />
          </div>
        </template>
      </Card>
    </div>

    <OrganizationFormDialog
      v-model:visible="isCreateDialogVisible"
      @saved="onCreated"
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
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  &__subtitle {
    margin-top: 0.35rem;
    color: $text-dim;
    font-size: 0.9rem;
  }

  &__spinner {
    align-self: center;
    margin-top: 4rem;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 4rem 2rem;
    color: $text-dim;

    .pi {
      font-size: 2.4rem;
      color: $text-muted;
    }
  }
}

.orgs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.org-card {
  display: flex;
  align-items: center;
  gap: 1rem;

  &--disabled {
    .org-card__info,
    .p-avatar {
      opacity: 0.55;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  &__slug {
    color: $text-dim;
    font-size: 0.85rem;
  }
}
</style>
