<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type { InviteCreateDto, InviteDto } from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { TeamMemberRole } from '@erp/types';

import type { InviteService } from '../composables/use-invite-service';

import type { NotificationService } from '#layers/notification';
import type { TeamRoleOption } from '#layers/team';

interface InviteFormDialogProps {
  visible: boolean;
  teamId: number;
  canInviteCoach: boolean;
}

interface InviteFormDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', invite: InviteDto): void;
}

const props: InviteFormDialogProps = defineProps<InviteFormDialogProps>();
const emit: InviteFormDialogEmits = defineEmits<InviteFormDialogEmits>();

const { t } = useI18n();
const inviteService: InviteService = useInviteService();
const notificationService: NotificationService = useNotificationService();
const roleOptions: ComputedRef<TeamRoleOption[]> = useTeamRoleOptions();

const email: Ref<string> = ref('');
const nickname: Ref<string> = ref('');
const role: Ref<TeamMemberRole> = ref(TeamMemberRole.PLAYER);
const isLoading: Ref<boolean> = ref(false);

const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});
const availableRoles: ComputedRef<TeamRoleOption[]> = computed(
  (): TeamRoleOption[] =>
    props.canInviteCoach
      ? roleOptions.value
      : roleOptions.value.filter(
          (option: TeamRoleOption): boolean =>
            option.value === TeamMemberRole.PLAYER
        )
);

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      email.value = '';
      nickname.value = '';
      role.value = TeamMemberRole.PLAYER;
    }
  }
);

async function submit(): Promise<void> {
  isLoading.value = true;

  const dto: InviteCreateDto = {
    email: email.value,
    nickname: nickname.value,
    role: role.value,
  };

  const response: HttpResponse<InviteDto> = await inviteService.create(
    props.teamId,
    dto
  );

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
    :header="t('invites.invite')"
    modal
    :style="{ width: '420px' }"
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
        <label for="invite-nickname">{{ t('teams.nickname') }}</label>
        <InputText
          id="invite-nickname"
          v-model="nickname"
          maxlength="32"
          required
          fluid
        />
      </div>

      <div class="invite-form__field">
        <label for="invite-role">{{ t('teams.role') }}</label>
        <Select
          id="invite-role"
          v-model="role"
          :options="availableRoles"
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
          :label="t('invites.send')"
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
