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
  TournamentDto,
  TournamentMatchDto,
  TournamentMatchResultDto,
} from '@erp/dtos';
import { type HttpResponse } from '@shared/types';

import type { TournamentService } from '../composables/use-tournament-service';

import type { NotificationService } from '#layers/notification';

interface TournamentMatchDialogProps {
  visible: boolean;
  tournamentId: number;
  match: TournamentMatchDto | null;
}

interface TournamentMatchDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', tournament: TournamentDto): void;
}

const props: TournamentMatchDialogProps =
  defineProps<TournamentMatchDialogProps>();
const emit: TournamentMatchDialogEmits =
  defineEmits<TournamentMatchDialogEmits>();

const { t } = useI18n();
const notificationService: NotificationService = useNotificationService();
const tournamentService: TournamentService = useTournamentService();

const winnerId: Ref<number | null> = ref(null);
const scoreOne: Ref<number | null> = ref(null);
const scoreTwo: Ref<number | null> = ref(null);
const startsAt: Ref<Date | null> = ref(null);
const isLoading: Ref<boolean> = ref(false);

const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});
const nameOne: ComputedRef<string> = computed(
  (): string => props.match?.participantOne?.name ?? t('tournaments.tbd')
);
const nameTwo: ComputedRef<string> = computed(
  (): string => props.match?.participantTwo?.name ?? t('tournaments.tbd')
);
const canDecide: ComputedRef<boolean> = computed(
  (): boolean =>
    Boolean(props.match?.participantOneId) &&
    Boolean(props.match?.participantTwoId)
);

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible && props.match) {
      winnerId.value = props.match.winnerId;
      scoreOne.value = props.match.scoreOne;
      scoreTwo.value = props.match.scoreTwo;
      startsAt.value = props.match.startsAt
        ? new Date(props.match.startsAt)
        : null;
    }
  }
);

async function submit(): Promise<void> {
  if (!props.match) {
    return;
  }

  isLoading.value = true;

  const dto: TournamentMatchResultDto = {
    ...(winnerId.value !== null ? { winnerId: winnerId.value } : {}),
    ...(scoreOne.value !== null ? { scoreOne: scoreOne.value } : {}),
    ...(scoreTwo.value !== null ? { scoreTwo: scoreTwo.value } : {}),
    ...(startsAt.value ? { startsAt: startsAt.value.toISOString() } : {}),
  };

  const response: HttpResponse<TournamentDto> =
    await tournamentService.setMatchResult(
      props.tournamentId,
      props.match.id,
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
    :header="t('tournaments.matchResult')"
    modal
    :style="{ width: '420px' }"
  >
    <form v-if="match" class="match-form" @submit.prevent="submit">
      <div class="match-form__scores">
        <div class="match-form__side">
          <span class="match-form__name">{{ nameOne }}</span>
          <InputNumber v-model="scoreOne" :min="0" show-buttons />
        </div>
        <span class="match-form__vs">:</span>
        <div class="match-form__side">
          <span class="match-form__name">{{ nameTwo }}</span>
          <InputNumber v-model="scoreTwo" :min="0" show-buttons />
        </div>
      </div>

      <div v-if="canDecide" class="match-form__field">
        <label>{{ t('tournaments.winner') }}</label>
        <div class="match-form__winner">
          <Button
            type="button"
            :label="nameOne"
            size="small"
            :severity="winnerId === match.participantOneId ? 'success' : 'secondary'"
            :outlined="winnerId !== match.participantOneId"
            @click="winnerId = match.participantOneId"
          />
          <Button
            type="button"
            :label="nameTwo"
            size="small"
            :severity="winnerId === match.participantTwoId ? 'success' : 'secondary'"
            :outlined="winnerId !== match.participantTwoId"
            @click="winnerId = match.participantTwoId"
          />
        </div>
      </div>

      <div class="match-form__field">
        <label>{{ t('tournaments.matchTime') }}</label>
        <DatePicker
          v-model="startsAt"
          show-time
          hour-format="24"
          date-format="dd.mm.yy"
          show-clear
          fluid
        />
      </div>

      <div class="match-form__actions">
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
          icon="pi pi-check"
          :loading="isLoading"
        />
      </div>
    </form>
  </Dialog>
</template>

<style lang="scss" scoped>
.match-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__scores {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 1rem;
  }

  &__side {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  &__name {
    font-weight: 600;
    text-align: center;
  }

  &__vs {
    padding-bottom: 0.5rem;
    color: $text-muted;
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

  &__winner {
    display: flex;
    gap: 0.5rem;

    :deep(.p-button) {
      flex: 1;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>
