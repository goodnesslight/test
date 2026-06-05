<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import {
  computed,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type { InviteDto } from '@shared/dtos';
import { type HttpResponse, TeamMemberRole } from '@shared/types';

import type { InviteService } from '../../layers/team/composables/use-invite-service';

interface InviteFormDialogProps {
  visible: boolean;
  teamId: number;
}

interface InviteFormDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', invite: InviteDto): void;
}

interface RoleOption {
  label: string;
  value: TeamMemberRole;
}

const props: InviteFormDialogProps = defineProps<InviteFormDialogProps>();
const emit: InviteFormDialogEmits = defineEmits<InviteFormDialogEmits>();

const { t } = useI18n();
const toast: ReturnType<typeof useToast> = useToast();
const inviteService: InviteService = useInviteService();

const identifier: Ref<string> = ref('');
const role: Ref<TeamMemberRole> = ref(TeamMemberRole.PLAYER);
const isLoading: Ref<boolean> = ref(false);

const roleOptions: RoleOption[] = Object.values(TeamMemberRole).map(
  (value: TeamMemberRole): RoleOption => ({
    label: t(`roles.${value}`),
    value,
  })
);

const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      identifier.value = '';
      role.value = TeamMemberRole.PLAYER;
    }
  }
);

async function submit(): Promise<void> {
  isLoading.value = true;

  const response: HttpResponse<InviteDto> = await inviteService.create(
    props.teamId,
    { identifier: identifier.value, role: role.value }
  );

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
    :header="t('invites.invite')"
    modal
    :style="{ width: '420px' }"
  >
    <form class="invite-form" @submit.prevent="submit">
      <div class="invite-form__field">
        <label for="invite-identifier">{{ t('invites.identifier') }}</label>
        <InputText
          id="invite-identifier"
          v-model="identifier"
          required
          fluid
        />
      </div>

      <div class="invite-form__field">
        <label for="invite-role">{{ t('teams.role') }}</label>
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
