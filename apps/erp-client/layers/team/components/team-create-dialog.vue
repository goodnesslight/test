<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type { TeamCreateDto, TeamDto } from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { TeamType } from '@erp/types';

import type { TeamService } from '../composables/use-team-service';
import type { TeamTypeOption } from '../composables/use-team-type-options';

import type { NotificationService } from '#layers/notification';

interface TeamCreateDialogProps {
  visible: boolean;
  gameId: number;
  existingTypes: TeamType[];
}

interface TeamCreateDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', team: TeamDto): void;
}

const props: TeamCreateDialogProps = defineProps<TeamCreateDialogProps>();
const emit: TeamCreateDialogEmits = defineEmits<TeamCreateDialogEmits>();

const { t } = useI18n();
const notificationService: NotificationService = useNotificationService();
const teamService: TeamService = useTeamService();
const typeOptions: ComputedRef<TeamTypeOption[]> = useTeamTypeOptions();

const TYPE_ICONS: Record<TeamType, string> = {
  [TeamType.MAIN]: 'pi pi-star',
  [TeamType.ACADEMY]: 'pi pi-graduation-cap',
};

const type: Ref<TeamType | null> = ref(null);
const isLoading: Ref<boolean> = ref(false);

const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});
const availableOptions: ComputedRef<TeamTypeOption[]> = computed(
  (): TeamTypeOption[] =>
    typeOptions.value.filter(
      (option: TeamTypeOption): boolean =>
        !props.existingTypes.includes(option.value)
    )
);

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      type.value = null;
    }
  }
);

async function submit(): Promise<void> {
  if (type.value === null) {
    return;
  }

  isLoading.value = true;

  const dto: TeamCreateDto = {
    type: type.value,
  };

  const response: HttpResponse<TeamDto> = await teamService.create(
    props.gameId,
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
    :header="t('teams.create')"
    modal
    :style="{ width: '480px' }"
  >
    <form class="team-create" @submit.prevent="submit">
      <div class="team-create__cards">
        <button
          v-for="option in availableOptions"
          :key="option.value"
          type="button"
          class="team-create__card"
          :class="{ 'team-create__card--selected': type === option.value }"
          @click="type = option.value"
        >
          <span class="team-create__card-icon">
            <i :class="TYPE_ICONS[option.value]" />
          </span>
          <span class="team-create__card-label">{{ option.label }}</span>
          <span class="team-create__card-description">
            {{ option.description }}
          </span>
        </button>
      </div>

      <div class="team-create__actions">
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
          :disabled="type === null"
          :loading="isLoading"
        />
      </div>
    </form>
  </Dialog>
</template>

<style lang="scss" scoped>
.team-create {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 0.75rem;
  }

  &__card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 1rem 1.1rem;
    background: $bg-card-alt;
    border: 1px solid $border;
    border-radius: 14px;
    color: $text-primary;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;

    &:hover {
      background: $bg-card-hover;
      border-color: $accent-border;
    }

    &--selected {
      background: $bg-card-hover;
      border-color: $accent;
    }
  }

  &__card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: $accent-soft;
    color: $accent;
  }

  &__card-label {
    font-size: 1rem;
    font-weight: 600;
  }

  &__card-description {
    font-size: 0.85rem;
    color: $text-dim;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
