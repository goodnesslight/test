<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type {
  OrganizationInviteCreateDto,
  OrganizationInviteDto,
} from '@shared/dtos';
import { type HttpResponse, OrganizationRole } from '@shared/types';

import type { OrganizationService } from '../composables/use-organization-service';

import type { NotificationService } from '#layers/notification';
import type { UploadService } from '#layers/upload';

interface OrganizationInviteDialogProps {
  visible: boolean;
  organizationId: number;
}

interface OrganizationInviteDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', invite: OrganizationInviteDto): void;
}

interface OrganizationRoleOption {
  label: string;
  value: OrganizationRole;
}

const props: OrganizationInviteDialogProps =
  defineProps<OrganizationInviteDialogProps>();
const emit: OrganizationInviteDialogEmits =
  defineEmits<OrganizationInviteDialogEmits>();

const { t } = useI18n();
const notificationService: NotificationService = useNotificationService();
const organizationService: OrganizationService = useOrganizationService();
const uploadService: UploadService = useUploadService();

const fileInput: Ref<HTMLInputElement | null> = ref(null);
const email: Ref<string> = ref('');
const username: Ref<string> = ref('');
const firstName: Ref<string> = ref('');
const lastName: Ref<string> = ref('');
const country: Ref<string> = ref('');
const birthDate: Ref<string> = ref('');
const avatarUrl: Ref<string> = ref('');
const role: Ref<OrganizationRole> = ref(OrganizationRole.MEMBER);
const isLoading: Ref<boolean> = ref(false);
const isUploading: Ref<boolean> = ref(false);

const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});
const roleOptions: ComputedRef<OrganizationRoleOption[]> = computed(
  (): OrganizationRoleOption[] => [
    { label: t('organizations.roles.member'), value: OrganizationRole.MEMBER },
    { label: t('organizations.roles.admin'), value: OrganizationRole.ADMIN },
  ]
);

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      email.value = '';
      username.value = '';
      firstName.value = '';
      lastName.value = '';
      country.value = '';
      birthDate.value = '';
      avatarUrl.value = '';
      role.value = OrganizationRole.MEMBER;
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
    avatarUrl.value = url;
  } else {
    notificationService.showError(t('common.uploadError'));
  }
}

async function submit(): Promise<void> {
  isLoading.value = true;

  const dto: OrganizationInviteCreateDto = {
    email: email.value,
    username: username.value,
    role: role.value,
    ...(firstName.value ? { firstName: firstName.value } : {}),
    ...(lastName.value ? { lastName: lastName.value } : {}),
    ...(country.value ? { country: country.value } : {}),
    ...(birthDate.value ? { birthDate: birthDate.value } : {}),
    ...(avatarUrl.value ? { avatarUrl: avatarUrl.value } : {}),
  };

  const response: HttpResponse<OrganizationInviteDto> =
    await organizationService.invite(props.organizationId, dto);

  isLoading.value = false;

  if (response.isSuccess) {
    notificationService.showSuccess(t('organizations.invites.sent'));
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
    :header="t('organizations.invites.add')"
    modal
    :style="{ width: '460px' }"
  >
    <form class="invite-form" @submit.prevent="submit">
      <div class="invite-form__field">
        <label for="invite-email">{{ t('auth.email') }}</label>
        <InputText
          id="invite-email"
          v-model="email"
          type="email"
          required
          fluid
        />
      </div>

      <div class="invite-form__field">
        <label for="invite-username">{{ t('auth.username') }}</label>
        <InputText id="invite-username" v-model="username" required fluid />
      </div>

      <div class="invite-form__row">
        <div class="invite-form__field">
          <label for="invite-first">
            {{ t('organizations.invites.firstName') }}
          </label>
          <InputText id="invite-first" v-model="firstName" fluid />
        </div>
        <div class="invite-form__field">
          <label for="invite-last">
            {{ t('organizations.invites.lastName') }}
          </label>
          <InputText id="invite-last" v-model="lastName" fluid />
        </div>
      </div>

      <div class="invite-form__row">
        <div class="invite-form__field">
          <label for="invite-country">
            {{ t('organizations.invites.country') }}
          </label>
          <InputText id="invite-country" v-model="country" fluid />
        </div>
        <div class="invite-form__field">
          <label for="invite-birth">
            {{ t('organizations.invites.birthDate') }}
          </label>
          <InputText id="invite-birth" v-model="birthDate" type="date" fluid />
        </div>
      </div>

      <div class="invite-form__field">
        <label>{{ t('organizations.invites.photo') }}</label>
        <div class="invite-form__photo">
          <Avatar
            :image="avatarUrl || undefined"
            :label="avatarUrl ? undefined : '?'"
            size="large"
            shape="circle"
          />
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="invite-form__file"
            @change="onFileSelect"
          />
          <Button
            type="button"
            :label="t('organizations.invites.uploadPhoto')"
            icon="pi pi-upload"
            severity="secondary"
            outlined
            :loading="isUploading"
            @click="triggerFile"
          />
        </div>
      </div>

      <div class="invite-form__field">
        <label for="invite-role">{{ t('organizations.invites.role') }}</label>
        <Select
          id="invite-role"
          v-model="role"
          :options="roleOptions"
          option-label="label"
          option-value="value"
          fluid
        />
      </div>

      <div class="invite-form__actions">
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          text
          @click="isVisible = false"
        />
        <Button
          type="submit"
          :label="t('organizations.invites.send')"
          icon="pi pi-send"
          :loading="isLoading"
        />
      </div>
    </form>
  </Dialog>
</template>

<style lang="scss" scoped>
.invite-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__row {
    display: flex;
    gap: 1rem;

    .invite-form__field {
      flex: 1;
    }
  }

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
