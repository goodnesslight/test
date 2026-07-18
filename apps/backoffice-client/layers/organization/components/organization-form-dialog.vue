<script setup lang="ts">
import { computed, type Ref, ref, watch, type WritableComputedRef } from 'vue';

import type { OrganizationCreateDto, OrganizationDto } from '@backoffice/dtos';
import type { HttpResponse } from '@shared/types';

import type { OrganizationService } from '../composables/use-organization-service';

import type { NotificationService } from '#layers/notification';

interface OrganizationFormDialogProps {
  visible: boolean;
  initial?: OrganizationFormInitial;
}

interface OrganizationFormDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', organization: OrganizationDto): void;
}

interface OrganizationFormInitial {
  name?: string;
  ownerEmail?: string;
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
const ownerEmail: Ref<string> = ref('');
const ownerUsername: Ref<string> = ref('');
const ownerFirstName: Ref<string> = ref('');
const ownerLastName: Ref<string> = ref('');
const isLoading: Ref<boolean> = ref(false);

const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      name.value = props.initial?.name ?? '';
      tag.value = '';
      slug.value = '';
      logoUrl.value = '';
      ownerEmail.value = props.initial?.ownerEmail ?? '';
      ownerUsername.value = '';
      ownerFirstName.value = '';
      ownerLastName.value = '';
    }
  }
);

async function submit(): Promise<void> {
  isLoading.value = true;

  const dto: OrganizationCreateDto = {
    name: name.value,
    tag: tag.value,
    slug: slug.value,
    ownerEmail: ownerEmail.value,
    ownerUsername: ownerUsername.value,
    ...(logoUrl.value ? { logoUrl: logoUrl.value } : {}),
    ...(ownerFirstName.value ? { ownerFirstName: ownerFirstName.value } : {}),
    ...(ownerLastName.value ? { ownerLastName: ownerLastName.value } : {}),
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
    :style="{ width: '460px' }"
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

      <div class="org-form__section">
        <h3 class="org-form__section-title">Владелец</h3>
        <p class="org-form__section-hint">
          На указанную почту придёт приглашение — владелец сам задаст пароль на
          поддомене организации.
        </p>
      </div>

      <div class="org-form__field">
        <label for="owner-email">Email владельца</label>
        <InputText
          id="owner-email"
          v-model="ownerEmail"
          type="email"
          required
          fluid
        />
      </div>

      <div class="org-form__field">
        <label for="owner-username">Имя пользователя владельца</label>
        <InputText
          id="owner-username"
          v-model="ownerUsername"
          maxlength="32"
          required
          fluid
        />
      </div>

      <div class="org-form__row">
        <div class="org-form__field">
          <label for="owner-first-name">Имя</label>
          <InputText id="owner-first-name" v-model="ownerFirstName" fluid />
        </div>
        <div class="org-form__field">
          <label for="owner-last-name">Фамилия</label>
          <InputText id="owner-last-name" v-model="ownerLastName" fluid />
        </div>
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
    flex: 1;
    min-width: 0;

    label {
      font-size: 0.9rem;
      color: $text-dim;
    }
  }

  &__row {
    display: flex;
    gap: 1rem;
  }

  &__section {
    margin-top: 0.25rem;
    padding-top: 0.75rem;
    border-top: 1px solid $border;
  }

  &__section-title {
    font-size: 1rem;
    font-weight: 600;
  }

  &__section-hint {
    margin-top: 0.3rem;
    color: $text-dim;
    font-size: 0.82rem;
    line-height: 1.4;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
