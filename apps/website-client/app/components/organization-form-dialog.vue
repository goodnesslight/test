<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type { OrganizationDto } from '@shared/dtos';
import type { HttpResponse } from '@shared/types';

import type { OrganizationService } from '../../layers/organization/composables/use-organization-service';

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
const toast: ReturnType<typeof useToast> = useToast();
const organizationService: OrganizationService = useOrganizationService();

const name: Ref<string> = ref('');
const tag: Ref<string> = ref('');
const logoUrl: Ref<string> = ref('');
const isLoading: Ref<boolean> = ref(false);

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
      logoUrl.value = props.organization?.logoUrl ?? '';
    }
  }
);

async function submit(): Promise<void> {
  isLoading.value = true;

  const payload: { name: string; tag: string; logoUrl?: string } = {
    name: name.value,
    tag: tag.value,
    ...(logoUrl.value ? { logoUrl: logoUrl.value } : {}),
  };

  const response: HttpResponse<OrganizationDto> = props.organization
    ? await organizationService.update(props.organization.id, payload)
    : await organizationService.create(payload);

  isLoading.value = false;

  if (response.isSuccess) {
    emit('saved', response.data);
    emit('update:visible', false);
  } else {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: response.error,
      life: 5000,
    });
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
        <label for="org-logo">{{ t('organizations.logoUrl') }}</label>
        <InputText
          id="org-logo"
          v-model="logoUrl"
          type="url"
          placeholder="https://"
          fluid
        />
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

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
