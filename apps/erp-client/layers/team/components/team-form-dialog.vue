<script setup lang="ts">
import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  watch,
  type WritableComputedRef,
} from 'vue';

import type { TeamCreateDto, TeamDto } from '@shared/dtos';
import { GameType, type HttpResponse } from '@shared/types';

import type { TeamService } from '../composables/use-team-service';

import { type GameOption, type GameService } from '#layers/game';
import type { NotificationService } from '#layers/notification';

interface TeamFormDialogProps {
  visible: boolean;
  organizationId: number;
  team?: TeamDto | null;
}

interface TeamFormDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', team: TeamDto): void;
}

const props: TeamFormDialogProps = defineProps<TeamFormDialogProps>();
const emit: TeamFormDialogEmits = defineEmits<TeamFormDialogEmits>();

const { t } = useI18n();
const gameService: GameService = useGameService();
const notificationService: NotificationService = useNotificationService();
const teamService: TeamService = useTeamService();

const gameOptions: GameOption[] = gameService.getOptions();

const name: Ref<string> = ref('');
const game: Ref<GameType> = ref(GameType.CS2);
const isLoading: Ref<boolean> = ref(false);

const isEdit: ComputedRef<boolean> = computed(
  (): boolean => Boolean(props.team)
);
const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      name.value = props.team?.name ?? '';
      game.value = props.team?.game ?? GameType.CS2;
    }
  }
);

async function submit(): Promise<void> {
  isLoading.value = true;

  const dto: TeamCreateDto = {
    name: name.value,
    game: game.value,
  };

  const response: HttpResponse<TeamDto> = props.team
    ? await teamService.update(props.team.id, dto)
    : await teamService.create(props.organizationId, dto);

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
    :header="isEdit ? t('teams.edit') : t('teams.create')"
    modal
    :style="{ width: '420px' }"
  >
    <form class="team-form" @submit.prevent="submit">
      <div class="team-form__field">
        <label for="team-name">{{ t('teams.name') }}</label>
        <InputText id="team-name" v-model="name" required fluid />
      </div>

      <div class="team-form__field">
        <label for="team-game">{{ t('teams.game') }}</label>
        <Select
          id="team-game"
          v-model="game"
          :options="gameOptions"
          option-label="label"
          option-value="value"
          fluid
        />
      </div>

      <div class="team-form__actions">
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
.team-form {
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
