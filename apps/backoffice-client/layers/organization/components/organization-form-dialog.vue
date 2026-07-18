<script setup lang="ts">
import { computed, type Ref, ref, watch, type WritableComputedRef } from 'vue';

import type { OrganizationCreateDto, OrganizationDto } from '@backoffice/dtos';
import type { HttpResponse } from '@shared/types';

import type { OrganizationService } from '../composables/use-organization-service';

import type { NotificationService } from '#layers/notification';

interface OrganizationFormDialogProps {
  visible: boolean;
}

interface OrganizationFormDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', organization: OrganizationDto): void;
}

const props: OrganizationFormDialogProps =
  defineProps<OrganizationFormDialogProps>();
const emit: OrganizationFormDialogEmits =
  defineEmits<OrganizationFormDialogEmits>();

const notificationService: NotificationService = useNotificationService();
const organizationService: OrganizationService = useOrganizationService();

const name: Ref<string> = ref('');
const tag: Ref<string> = ref('');
const slug: Ref<string> = ref('');
const logoUrl: Ref<string> = ref('');
const isLoading: Ref<boolean> = ref(false);

const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      name.value = '';
      tag.value = '';
      slug.value = '';
      logoUrl.value = '';
    }
  }
);

async function submit(): Promise<void> {
  isLoading.value = true;

  const dto: OrganizationCreateDto = {
    name: name.value,
    tag: tag.value,
    slug: slug.value,
    ...(logoUrl.value ? { logoUrl: logoUrl.value } : {}),
  };

  const response: HttpResponse<OrganizationDto> =
    await organizationService.create(dto);

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
    header="Создать организацию"
    modal
    :style="{ width: '420px' }"
  >
    <form class="org-form" @submit.prevent="submit">
      <div class="org-form__field">
        <label for="org-name">Название</label>
        <InputText id="org-name" v-model="name" required fluid />
      </div>

      <div class="org-form__field">
        <label for="org-tag">Тег</label>
        <InputText id="org-tag" v-model="tag" maxlength="8" required fluid />
      </div>

      <div class="org-form__field">
        <label for="org-slug">Поддомен</label>
        <InputText id="org-slug" v-model="slug" maxlength="48" required fluid />
      </div>

      <div class="org-form__field">
        <label for="org-logo">Логотип (URL)</label>
        <InputText id="org-logo" v-model="logoUrl" fluid />
      </div>

      <div class="org-form__actions">
        <Button
          type="button"
          label="Отмена"
          severity="secondary"
          text
          @click="isVisible = false"
        />
        <Button type="submit" label="Создать" :loading="isLoading" />
      </div>
    </form>
  </Dialog>
</template>

<style lang="scss" scoped>
.org-form {
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
