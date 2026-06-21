<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type { OrganizationDto, OrganizationUpdateDto } from '@shared/dtos';
import type { HttpResponse } from '@shared/types';

import type { OrganizationService } from '../composables/use-organization-service';

import type { NotificationService } from '#layers/notification';
import type { UploadService } from '#layers/upload';

interface OrganizationFormDialogProps {
  visible: boolean;
  organization?: OrganizationDto | null;
}

interface OrganizationFormDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', organization: OrganizationDto): void;
}

const props: OrganizationFormDialogProps =
  defineProps<OrganizationFormDialogProps>();
const emit: OrganizationFormDialogEmits =
  defineEmits<OrganizationFormDialogEmits>();

const { t } = useI18n();
const notificationService: NotificationService = useNotificationService();
const organizationService: OrganizationService = useOrganizationService();
const uploadService: UploadService = useUploadService();

const fileInput: Ref<HTMLInputElement | null> = ref(null);
const name: Ref<string> = ref('');
const tag: Ref<string> = ref('');
const slug: Ref<string> = ref('');
const logoUrl: Ref<string> = ref('');
const isLoading: Ref<boolean> = ref(false);
const isUploading: Ref<boolean> = ref(false);

const isEdit: ComputedRef<boolean> = computed(
  (): boolean => Boolean(props.organization)
);
const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      name.value = props.organization?.name ?? '';
      tag.value = props.organization?.tag ?? '';
      slug.value = props.organization?.slug ?? '';
      logoUrl.value = props.organization?.logoUrl ?? '';
    }
  }
);

function triggerFile(): void {
  fileInput.value?.click();
}

async function onFileSelect(event: Event): Promise<void> {
  const input: HTMLInputElement = event.target as HTMLInputElement;
  const file: File | undefined = input.files?.[0];

  if (!file) {
    return;
  }

  isUploading.value = true;

  const url: string | null = await uploadService.uploadImage(file);

  isUploading.value = false;
  input.value = '';

  if (url) {
    logoUrl.value = url;
  } else {
    notificationService.showError(t('common.uploadError'));
  }
}

async function submit(): Promise<void> {
  if (!props.organization) {
    return;
  }

  isLoading.value = true;

  const dto: OrganizationUpdateDto = {
    name: name.value,
    tag: tag.value,
    slug: slug.value,
    ...(logoUrl.value ? { logoUrl: logoUrl.value } : {}),
  };

  const response: HttpResponse<OrganizationDto> =
    await organizationService.update(props.organization.id, dto);

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
    :header="isEdit ? t('organizations.edit') : t('organizations.create')"
    modal
    :style="{ width: '420px' }"
  >
    <form class="org-form" @submit.prevent="submit">
      <div class="org-form__field">
        <label for="org-name">{{ t('organizations.name') }}</label>
        <InputText id="org-name" v-model="name" required fluid />
      </div>

      <div class="org-form__field">
        <label for="org-tag">{{ t('organizations.tag') }}</label>
        <InputText id="org-tag" v-model="tag" maxlength="8" required fluid />
      </div>

      <div class="org-form__field">
        <label for="org-slug">{{ t('organizations.slug') }}</label>
        <InputText id="org-slug" v-model="slug" maxlength="48" required fluid />
      </div>

      <div class="org-form__field">
        <label>{{ t('organizations.logo') }}</label>
        <div class="org-form__photo">
          <Avatar
            :image="logoUrl || undefined"
            :label="logoUrl ? undefined : name[0]?.toUpperCase() ?? '?'"
            size="large"
            shape="circle"
          />
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="org-form__file"
            @change="onFileSelect"
          />
          <Button
            type="button"
            :label="t('organizations.uploadLogo')"
            icon="pi pi-upload"
            severity="secondary"
            outlined
            :loading="isUploading"
            @click="triggerFile"
          />
        </div>
      </div>

      <div class="org-form__actions">
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          text
          @click="isVisible = false"
        />
        <Button
          type="submit"
          :label="t('common.save')"
          :loading="isLoading"
        />
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

  &__photo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__file {
    display: none;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
