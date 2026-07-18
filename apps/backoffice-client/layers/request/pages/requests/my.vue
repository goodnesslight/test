<script setup lang="ts">
import { onMounted, type Ref, ref } from 'vue';

import type { RequestDto } from '@backoffice/dtos';
import type { HttpResponse } from '@shared/types';

import {
  REQUEST_STATUS_LABEL,
  REQUEST_STATUS_SEVERITY,
} from '../../constants';
import type { RequestService } from '../../composables/use-request-service';

import type { NotificationService } from '#layers/notification';
import { AppRoute } from '#layers/router';

definePageMeta({
  middleware: 'auth',
});

const notificationService: NotificationService = useNotificationService();
const requestService: RequestService = useRequestService();

const requests: Ref<RequestDto[]> = ref([]);
const isLoading: Ref<boolean> = ref(true);

async function loadRequests(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<RequestDto[]> = await requestService.getMine();

  if (response.isSuccess) {
    requests.value = response.data;
  } else {
    notificationService.showError(response.error);
  }

  isLoading.value = false;
}

onMounted(async (): Promise<void> => {
  await loadRequests();
});
</script>

<template>
  <div class="my-requests-page">
    <div class="my-requests-page__header">
      <div>
        <h1>Мои заявки</h1>
        <p class="my-requests-page__subtitle">
          Заявки, которые вы взяли в работу.
        </p>
      </div>
    </div>

    <ProgressSpinner v-if="isLoading" class="my-requests-page__spinner" />

    <div v-else-if="requests.length === 0" class="my-requests-page__empty">
      <i class="pi pi-briefcase" />
      <p>У вас пока нет заявок в работе.</p>
    </div>

    <div v-else class="my-requests-list">
      <NuxtLink
        v-for="request in requests"
        :key="request.id"
        class="my-requests-list__link"
        :to="buildAppRoute(AppRoute.REQUESTS_BY_ID, { id: request.id })"
      >
        <Card>
          <template #content>
            <div class="my-request-row">
              <div class="my-request-row__main">
                <div class="my-request-row__title">
                  <span class="my-request-row__org">{{
                    request.organizationName
                  }}</span>
                  <Tag
                    :value="REQUEST_STATUS_LABEL[request.status]"
                    :severity="REQUEST_STATUS_SEVERITY[request.status]"
                  />
                </div>
                <div class="my-request-row__meta">
                  <span><i class="pi pi-user" /> {{ request.name }}</span>
                  <span><i class="pi pi-envelope" /> {{ request.email }}</span>
                </div>
              </div>
              <i class="pi pi-chevron-right my-request-row__chevron" />
            </div>
          </template>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.my-requests-page {
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

.my-requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__link {
    text-decoration: none;
    color: inherit;
  }
}

.my-request-row {
  display: flex;
  align-items: center;
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

  &__chevron {
    color: $text-muted;
  }
}
</style>
