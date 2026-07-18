<script setup lang="ts">
import { navigateTo, useRoute } from 'nuxt/app';
import { useConfirm } from 'primevue/useconfirm';
import { computed, type ComputedRef, onMounted, type Ref, ref } from 'vue';

import type {
  OrganizationDto,
  RequestDto,
  RequestUpdateDto,
} from '@backoffice/dtos';
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
const route: ReturnType<typeof useRoute> = useRoute();
const authService: AuthService = useAuthService();
const notificationService: NotificationService = useNotificationService();
const requestService: RequestService = useRequestService();

const requestId: number = Number(route.params.id);

const request: Ref<RequestDto | null> = ref(null);
const isLoading: Ref<boolean> = ref(true);
const isCreateDialogVisible: Ref<boolean> = ref(false);

const isMine: ComputedRef<boolean> = computed(
  (): boolean =>
    request.value !== null &&
    request.value.assigneeId !== null &&
    request.value.assigneeId === (authService.admin.value?.id ?? null)
);
const canCreateOrganization: ComputedRef<boolean> = computed(
  (): boolean =>
    isMine.value && request.value?.status === RequestStatus.IN_PROGRESS
);
const dialogInitial: ComputedRef<{ name: string; ownerEmail: string }> =
  computed(() => ({
    name: request.value?.organizationName ?? '',
    ownerEmail: request.value?.email ?? '',
  }));

async function loadRequest(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<RequestDto> = await requestService.getById(
    requestId
  );

  if (response.isSuccess) {
    request.value = response.data;
  } else {
    notificationService.showError(response.error);
  }

  isLoading.value = false;
}

async function release(): Promise<void> {
  const response: HttpResponse<RequestDto> = await requestService.release(
    requestId
  );

  if (response.isSuccess) {
    notificationService.showSuccess('Заявка возвращена во входящие');
    await navigateTo(AppRoute.REQUESTS);
  } else {
    notificationService.showError(response.error);
  }
}

function confirmReject(): void {
  confirm.require({
    header: 'Отклонить заявку',
    message: 'Отклонить эту заявку?',
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: 'Отклонить', severity: 'danger' },
    rejectProps: { label: 'Отмена', severity: 'secondary', text: true },
    accept: async (): Promise<void> => {
      const dto: RequestUpdateDto = { status: RequestStatus.REJECTED };
      const response: HttpResponse<RequestDto> = await requestService.update(
        requestId,
        dto
      );

      if (response.isSuccess) {
        request.value = response.data;
        notificationService.showSuccess('Заявка отклонена');
      } else {
        notificationService.showError(response.error);
      }
    },
  });
}

async function onOrganizationCreated(created: OrganizationDto): Promise<void> {
  const dto: RequestUpdateDto = { status: RequestStatus.APPROVED };
  const response: HttpResponse<RequestDto> = await requestService.update(
    requestId,
    dto
  );

  if (response.isSuccess) {
    request.value = response.data;
  }

  notificationService.showSuccess(
    'Организация создана',
    `${created.name} — приглашение владельцу отправлено`
  );
}

onMounted(async (): Promise<void> => {
  await loadRequest();
});
</script>

<template>
  <div class="request-detail">
    <NuxtLink :to="AppRoute.REQUESTS_MY" class="request-detail__back">
      <i class="pi pi-arrow-left" /> К моим заявкам
    </NuxtLink>

    <ProgressSpinner v-if="isLoading" class="request-detail__spinner" />

    <Message v-else-if="!request" severity="error" :closable="false">
      Заявка не найдена.
    </Message>

    <template v-else>
      <Card>
        <template #content>
          <div class="request-detail__head">
            <div>
              <div class="request-detail__title">
                <h1>{{ request.organizationName }}</h1>
                <Tag
                  :value="REQUEST_STATUS_LABEL[request.status]"
                  :severity="REQUEST_STATUS_SEVERITY[request.status]"
                />
              </div>
              <div class="request-detail__meta">
                <span><i class="pi pi-user" /> {{ request.name }}</span>
                <a
                  :href="`mailto:${request.email}`"
                  class="request-detail__email"
                >
                  <i class="pi pi-envelope" /> {{ request.email }}
                </a>
              </div>
            </div>

            <div v-if="isMine" class="request-detail__actions">
              <Button
                v-if="canCreateOrganization"
                label="Создать организацию"
                icon="pi pi-building"
                @click="isCreateDialogVisible = true"
              />
              <Button
                label="Отпустить"
                icon="pi pi-undo"
                severity="secondary"
                outlined
                @click="release"
              />
              <Button
                v-if="request.status !== RequestStatus.REJECTED"
                label="Отклонить"
                icon="pi pi-times"
                severity="danger"
                outlined
                @click="confirmReject"
              />
            </div>
          </div>

          <p v-if="request.message" class="request-detail__message">
            {{ request.message }}
          </p>
        </template>
      </Card>

      <Card>
        <template #content>
          <RequestNotes :request-id="request.id" :disabled="!isMine" />
        </template>
      </Card>

      <OrganizationFormDialog
        v-model:visible="isCreateDialogVisible"
        :initial="dialogInitial"
        @saved="onOrganizationCreated"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.request-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: $text-dim;
    font-size: 0.9rem;
    text-decoration: none;
    width: fit-content;

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

  &__email {
    color: $text-dim;
    text-decoration: none;

    &:hover {
      color: $accent;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  &__message {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $border;
    color: $text-secondary;
    font-size: 0.95rem;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  @media (max-width: $mobile) {
    &__head {
      flex-direction: column;
    }
  }
}
</style>
