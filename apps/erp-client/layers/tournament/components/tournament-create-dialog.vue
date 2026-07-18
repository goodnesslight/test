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
  GameDto,
  OrganizationDto,
  TeamDto,
  TournamentCreateDto,
  TournamentDto,
  TournamentParticipantCreateDto,
} from '@erp/dtos';
import { type HttpResponse } from '@shared/types';
import { TournamentFormat } from '@erp/types';

import type { TournamentService } from '../composables/use-tournament-service';
import { TOURNAMENT_FORMAT_LABELS } from '../constants';
import type {
  TournamentFormatOption,
  TournamentParticipantInput,
} from '../types';

import type { NotificationService } from '#layers/notification';
import type { OrganizationService } from '#layers/organization';

interface TournamentCreateDialogProps {
  visible: boolean;
  organizationId: number;
}

interface TournamentCreateDialogEmits {
  (event: 'update:visible', value: boolean): void;
  (event: 'saved', tournament: TournamentDto): void;
}

interface TeamOption {
  label: string;
  value: number;
}

const props: TournamentCreateDialogProps =
  defineProps<TournamentCreateDialogProps>();
const emit: TournamentCreateDialogEmits =
  defineEmits<TournamentCreateDialogEmits>();

const { t } = useI18n();
const notificationService: NotificationService = useNotificationService();
const organizationService: OrganizationService = useOrganizationService();
const tournamentService: TournamentService = useTournamentService();

const name: Ref<string> = ref('');
const format: Ref<TournamentFormat> = ref(TournamentFormat.SINGLE_ELIMINATION);
const startsAt: Ref<Date | null> = ref(null);
const endsAt: Ref<Date | null> = ref(null);
const description: Ref<string> = ref('');
const groupCount: Ref<number> = ref(2);
const advanceCount: Ref<number> = ref(2);
const participants: Ref<TournamentParticipantInput[]> = ref([]);
const isLoading: Ref<boolean> = ref(false);

const isVisible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.visible,
  set: (value: boolean): void => emit('update:visible', value),
});
const formatOptions: ComputedRef<TournamentFormatOption[]> = computed(
  (): TournamentFormatOption[] =>
    Object.values(TournamentFormat).map(
      (value: TournamentFormat): TournamentFormatOption => ({
        label: t(TOURNAMENT_FORMAT_LABELS[value]),
        value,
      })
    )
);
const teamOptions: ComputedRef<TeamOption[]> = computed((): TeamOption[] => {
  const organization: OrganizationDto | null =
    organizationService.current.value;

  if (!organization) {
    return [];
  }

  return organization.games.flatMap((game: GameDto): TeamOption[] =>
    game.teams.map(
      (team: TeamDto): TeamOption => ({
        label: `${getGameLabel(game.type)} · ${t(`teams.types.${team.type}`)}`,
        value: team.id,
      })
    )
  );
});
const showGroups: ComputedRef<boolean> = computed(
  (): boolean => format.value !== TournamentFormat.SINGLE_ELIMINATION
);
const showAdvance: ComputedRef<boolean> = computed(
  (): boolean => format.value === TournamentFormat.GROUPS_PLAYOFF
);
const canSubmit: ComputedRef<boolean> = computed(
  (): boolean =>
    name.value.trim().length >= 2 &&
    startsAt.value !== null &&
    participants.value.filter((item: TournamentParticipantInput): boolean =>
      Boolean(item.name.trim())
    ).length >= 2
);

watch(
  (): boolean => props.visible,
  (visible: boolean): void => {
    if (visible) {
      name.value = '';
      format.value = TournamentFormat.SINGLE_ELIMINATION;
      startsAt.value = null;
      endsAt.value = null;
      description.value = '';
      groupCount.value = 2;
      advanceCount.value = 2;
      participants.value = [
        { name: '', seed: 1, teamId: null },
        { name: '', seed: 2, teamId: null },
      ];
    }
  }
);

function addParticipant(): void {
  participants.value.push({
    name: '',
    seed: participants.value.length + 1,
    teamId: null,
  });
}

function removeParticipant(index: number): void {
  participants.value.splice(index, 1);
}

async function submit(): Promise<void> {
  if (!canSubmit.value || !startsAt.value) {
    return;
  }

  isLoading.value = true;

  const rows: TournamentParticipantCreateDto[] = participants.value
    .filter((item: TournamentParticipantInput): boolean =>
      Boolean(item.name.trim())
    )
    .map(
      (item: TournamentParticipantInput, index: number): TournamentParticipantCreateDto => ({
        name: item.name.trim(),
        seed: index + 1,
        ...(item.teamId ? { teamId: item.teamId } : {}),
      })
    );

  const dto: TournamentCreateDto = {
    name: name.value.trim(),
    format: format.value,
    startsAt: startsAt.value.toISOString(),
    participants: rows,
    ...(endsAt.value ? { endsAt: endsAt.value.toISOString() } : {}),
    ...(description.value ? { description: description.value } : {}),
    ...(showGroups.value ? { groupCount: groupCount.value } : {}),
    ...(showAdvance.value ? { advanceCount: advanceCount.value } : {}),
  };

  const response: HttpResponse<TournamentDto> = await tournamentService.create(
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
    :header="t('tournaments.create')"
    modal
    :style="{ width: '640px' }"
  >
    <form class="tournament-form" @submit.prevent="submit">
      <div class="tournament-form__row">
        <div class="tournament-form__field">
          <label>{{ t('tournaments.format') }}</label>
          <Select
            v-model="format"
            :options="formatOptions"
            option-label="label"
            option-value="value"
            fluid
          />
        </div>
        <div class="tournament-form__field">
          <label>{{ t('tournaments.name') }}</label>
          <InputText v-model="name" maxlength="64" required fluid />
        </div>
      </div>

      <div class="tournament-form__row">
        <div class="tournament-form__field">
          <label>{{ t('tournaments.startsAt') }}</label>
          <DatePicker
            v-model="startsAt"
            show-time
            hour-format="24"
            date-format="dd.mm.yy"
            fluid
          />
        </div>
        <div class="tournament-form__field">
          <label>{{ t('tournaments.endsAt') }}</label>
          <DatePicker
            v-model="endsAt"
            show-time
            hour-format="24"
            date-format="dd.mm.yy"
            fluid
          />
        </div>
      </div>

      <div v-if="showGroups" class="tournament-form__row">
        <div class="tournament-form__field">
          <label>{{ t('tournaments.groupCount') }}</label>
          <InputNumber v-model="groupCount" :min="1" :max="16" show-buttons fluid />
        </div>
        <div v-if="showAdvance" class="tournament-form__field">
          <label>{{ t('tournaments.advanceCount') }}</label>
          <InputNumber
            v-model="advanceCount"
            :min="1"
            :max="8"
            show-buttons
            fluid
          />
        </div>
      </div>

      <div class="tournament-form__participants">
        <div class="tournament-form__participants-head">
          <label>{{ t('tournaments.participants') }}</label>
          <Button
            type="button"
            :label="t('tournaments.addParticipant')"
            icon="pi pi-plus"
            size="small"
            text
            @click="addParticipant"
          />
        </div>

        <div
          v-for="(participant, index) in participants"
          :key="index"
          class="tournament-form__participant"
        >
          <span class="tournament-form__seed">{{ index + 1 }}</span>
          <InputText
            v-model="participant.name"
            :placeholder="t('tournaments.participantName')"
            maxlength="64"
            fluid
          />
          <Select
            v-model="participant.teamId"
            :options="teamOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('tournaments.ownTeam')"
            show-clear
            class="tournament-form__team"
          />
          <Button
            type="button"
            icon="pi pi-times"
            severity="danger"
            text
            rounded
            :disabled="participants.length <= 2"
            @click="removeParticipant(index)"
          />
        </div>
      </div>

      <div class="tournament-form__field">
        <label>{{ t('tournaments.description') }}</label>
        <Textarea v-model="description" rows="2" auto-resize fluid />
      </div>

      <div class="tournament-form__actions">
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          text
          @click="isVisible = false"
        />
        <Button
          type="submit"
          :label="t('tournaments.create')"
          icon="pi pi-check"
          :loading="isLoading"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </Dialog>
</template>

<style lang="scss" scoped>
.tournament-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__row {
    display: flex;
    gap: 1rem;

    .tournament-form__field {
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

  &__participants {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  &__participants-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    label {
      font-size: 0.9rem;
      color: $text-dim;
    }
  }

  &__participant {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__seed {
    width: 1.5rem;
    text-align: center;
    color: $text-muted;
    font-size: 0.85rem;
  }

  &__team {
    min-width: 180px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  @media (max-width: $mobile) {
    &__row {
      flex-direction: column;
    }

    &__team {
      min-width: 120px;
    }
  }
}
</style>
