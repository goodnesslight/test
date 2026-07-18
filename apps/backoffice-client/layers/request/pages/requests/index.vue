<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type { RequestDto } from '@backoffice/dtos';
import { RequestStatus } from '@backoffice/types';
import type { HttpResponse } from '@shared/types';

import {
  REQUEST_STATUS_LABEL,
  REQUEST_STATUS_SEVERITY,
} from '../../constants';
import type { RequestService } from '../../composables/use-request-service';

import type { AuthService } from '#layers/auth';
import type { NotificationService } from '#layers/notification';
import { AppRoute } from '#layers/router';

definePageMeta({
  middleware: 'auth',
});

const confirm: ReturnType<typeof useConfirm> = useConfirm();
const authService: AuthService = useAuthService();
const notificationService: NotificationService = useNotificationService();
const requestService: RequestService = useRequestService();

const requests: Ref<RequestDto[]> = ref([]);
const isLoading: Ref<boolean> = ref(true);

const currentAdminId: ComputedRef<number | null> = computed(
  (): number | null => authService.admin.value?.id ?? null
);

async function loadRequests(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<RequestDto[]> =
    await requestService.getIncoming();

  if (response.isSuccess) {
    requests.value = response.data;
  } else {
    notificationService.showError(response.error);
  }

  isLoading.value = false;
}

async function takeIntoWork(request: RequestDto): Promise<void> {
  const response: HttpResponse<RequestDto> = await requestService.takeIntoWork(
    request.id
  );

  if (response.isSuccess) {
    replaceRequest(response.data);
    notificationService.showSuccess('Заявка взята в работу');
  } else {
    notificationService.showError(response.error);
  }
}

function confirmDelete(request: RequestDto): void {
  confirm.require({
    header: 'Удалить заявку',
    message: `Удалить заявку от «${request.name}»?`,
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: 'Удалить', severity: 'danger' },
    rejectProps: { label: 'Отмена', severity: 'secondary', text: true },
    accept: async (): Promise<void> => {
      const response: HttpResponse<null> = await requestService.remove(
        request.id
      );

      if (response.isSuccess) {
        requests.value = requests.value.filter(
          (item: RequestDto): boolean => item.id !== request.id
        );
        notificationService.showSuccess('Заявка удалена');
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

function replaceRequest(updated: RequestDto): void {
  requests.value = requests.value.map(
    (item: RequestDto): RequestDto =>
      item.id === updated.id ? updated : item
  );
}

function isMine(request: RequestDto): boolean {
  return request.assigneeId !== null && request.assigneeId === currentAdminId.value;
}

function assigneeName(request: RequestDto): string {
  const parts: string[] = [
    request.assignee?.firstName,
    request.assignee?.lastName,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(' ') : 'администратор';
}

onMounted(async (): Promise<void> => {
  await loadRequests();
});
</script>

<template>
  <div class="requests-page">
    <div class="requests-page__header">
      <div>
        <h1>Входящие заявки</h1>
        <p class="requests-page__subtitle">
          Заявки на демо-организации, оставленные через лендинг.
        </p>
      </div>
    </div>

    <ProgressSpinner v-if="isLoading" class="requests-page__spinner" />

    <div v-else-if="requests.length === 0" class="requests-page__empty">
      <i class="pi pi-inbox" />
      <p>Заявок пока нет.</p>
    </div>

    <div v-else class="requests-list">
      <Card v-for="request in requests" :key="request.id">
        <template #content>
          <div class="request-row">
            <div class="request-row__main">
              <div class="request-row__title">
                <span class="request-row__org">{{
                  request.organizationName
                }}</span>
                <Tag
                  :value="REQUEST_STATUS_LABEL[request.status]"
                  :severity="REQUEST_STATUS_SEVERITY[request.status]"
                />
              </div>
              <div class="request-row__meta">
                <span><i class="pi pi-user" /> {{ request.name }}</span>
                <a :href="`mailto:${request.email}`" class="request-row__email">
                  <i class="pi pi-envelope" /> {{ request.email }}
                </a>
              </div>
              <p
                v-if="request.status === RequestStatus.IN_PROGRESS"
                class="request-row__handler"
              >
                <i class="pi pi-user-edit" />
                <template v-if="isMine(request)">Вы обрабатываете</template>
                <template v-else
                  >Обрабатывает: {{ assigneeName(request) }}</template
                >
              </p>
            </div>

            <div class="request-row__actions">
              <Button
                v-if="request.status === RequestStatus.PENDING"
                label="Взять в работу"
                icon="pi pi-play"
                size="small"
                @click="takeIntoWork(request)"
              />
              <NuxtLink
                v-else-if="isMine(request)"
                :to="buildAppRoute(AppRoute.REQUESTS_BY_ID, { id: request.id })"
              >
                <Button label="Открыть" icon="pi pi-arrow-right" size="small" />
              </NuxtLink>
              <Button
                v-else-if="request.status === RequestStatus.IN_PROGRESS"
                label="Взять себе"
                icon="pi pi-user-plus"
                size="small"
                severity="secondary"
                outlined
                @click="takeIntoWork(request)"
              />
              <Button
                icon="pi pi-trash"
                aria-label="Удалить"
                size="small"
                severity="danger"
                text
                rounded
                @click="confirmDelete(request)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.requests-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

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

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;

  &__main {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  &__org {
    font-size: 1.05rem;
    font-weight: 600;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    color: $text-dim;
    font-size: 0.9rem;

    .pi {
      margin-right: 0.3rem;
      color: $accent;
    }
  }

  &__email {
    color: $text-dim;
    text-decoration: none;

    &:hover {
      color: $accent;
    }
  }

  &__handler {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: $text-secondary;
    font-size: 0.9rem;

    .pi {
      color: $accent;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  @media (max-width: $mobile) {
    flex-direction: column;

    &__actions {
      flex-wrap: wrap;
    }
  }
}
</style>
