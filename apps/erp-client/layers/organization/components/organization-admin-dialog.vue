<script setup lang="ts">
import { computed, type Ref, ref, watch, type WritableComputedRef } from 'vue';

import type { OrganizationAddAdminDto, OrganizationDto } from '@erp/dtos';
import type { HttpResponse } from '@shared/types';

import type { OrganizationService } from '../composables/use-organization-service';

import type { NotificationService } from '#layers/notification';

interface OrganizationAdminDialogProps {
  visible: boolean;
  organizationId: number;
}

interface OrganizationAdminDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', organization: OrganizationDto): void;
}

const props: OrganizationAdminDialogProps =
  defineProps<OrganizationAdminDialogProps>();
const emit: OrganizationAdminDialogEmits =
  defineEmits<OrganizationAdminDialogEmits>();

const { t } = useI18n();
const notificationService: NotificationService = useNotificationService();
const organizationService: OrganizationService = useOrganizationService();

const identifier: Ref<string> = ref('');
const isLoading: Ref<boolean> = ref(false);

const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      identifier.value = '';
    }
  }
);

async function submit(): Promise<void> {
  isLoading.value = true;

  const dto: OrganizationAddAdminDto = { identifier: identifier.value };

  const response: HttpResponse<OrganizationDto> =
    await organizationService.addAdmin(props.organizationId, dto);

  isLoading.value = false;

  if (response.isSuccess) {
    emit('saved', response.data);
    emit('update:visible', false);
  } else {
    notificationService.showError(response.error);
  }
}
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    :header="t('organizations.admins.add')"
    modal
    :style="{ width: '420px' }"
  >
    <form class="admin-form" @submit.prevent="submit">
      <div class="admin-form__field">
        <label for="admin-identifier">{{ t('invites.identifier') }}</label>
        <InputText id="admin-identifier" v-model="identifier" required fluid />
      </div>

      <div class="admin-form__actions">
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          text
          @click="isVisible = false"
        />
        <Button
          type="submit"
          :label="t('organizations.admins.add')"
          icon="pi pi-user-plus"
          :loading="isLoading"
        />
      </div>
    </form>
  </Dialog>
</template>

<style lang="scss" scoped>
.admin-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    label {
      font-size: 0.9rem;
      color: $text-dim;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
