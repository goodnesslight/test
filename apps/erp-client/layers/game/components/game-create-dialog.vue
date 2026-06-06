<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type { GameCreateDto, GameDto } from '@shared/dtos';
import { GameType, type HttpResponse } from '@shared/types';

import type { GameService } from '../composables/use-game-service';
import { GAME_ICONS, GAME_LABELS } from '../constants';
import type { GameOption } from '../types';

import type { NotificationService } from '#layers/notification';

interface GameCreateDialogProps {
  visible: boolean;
  organizationId: number;
  existingTypes: GameType[];
}

interface GameCreateDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', game: GameDto): void;
}

const props: GameCreateDialogProps = defineProps<GameCreateDialogProps>();
const emit: GameCreateDialogEmits = defineEmits<GameCreateDialogEmits>();

const { t } = useI18n();
const gameService: GameService = useGameService();
const notificationService: NotificationService = useNotificationService();

const type: Ref<GameType | null> = ref(null);
const isLoading: Ref<boolean> = ref(false);

const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});
const availableOptions: ComputedRef<GameOption[]> = computed((): GameOption[] =>
  Object.values(GameType)
    .filter((value: GameType): boolean => !props.existingTypes.includes(value))
    .map(
      (value: GameType): GameOption => ({
        label: GAME_LABELS[value],
        value,
      })
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

  const dto: GameCreateDto = {
    type: type.value,
  };

  const response: HttpResponse<GameDto> = await gameService.create(
    props.organizationId,
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
    :header="t('games.add')"
    modal
    :style="{ width: '480px' }"
  >
    <form class="game-create" @submit.prevent="submit">
      <div class="game-create__cards">
        <button
          v-for="option in availableOptions"
          :key="option.value"
          type="button"
          class="game-create__card"
          :class="{ 'game-create__card--selected': type === option.value }"
          @click="type = option.value"
        >
          <span class="game-create__card-icon">
            <i :class="GAME_ICONS[option.value]" />
          </span>
          <span class="game-create__card-label">{{ option.label }}</span>
        </button>
      </div>

      <div class="game-create__actions">
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
.game-create {
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

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
