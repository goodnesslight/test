<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';

import type {
  TournamentMatchDto,
  TournamentParticipantDto,
} from '@erp/dtos';

import type { TournamentStandingRow } from '../utils/build-tournament-standings';

interface TournamentGroupTableProps {
  participants: TournamentParticipantDto[];
  matches: TournamentMatchDto[];
  groupIndex: number;
  canManage: boolean;
}

interface TournamentGroupTableEmits {
  (event: 'select', match: TournamentMatchDto): void;
}

const props: TournamentGroupTableProps =
  defineProps<TournamentGroupTableProps>();
const emit: TournamentGroupTableEmits = defineEmits<TournamentGroupTableEmits>();

const { t } = useI18n();

const standings: ComputedRef<TournamentStandingRow[]> = computed(
  (): TournamentStandingRow[] =>
    buildTournamentStandings(
      props.participants,
      props.matches,
      props.groupIndex
    )
);
const groupMatches: ComputedRef<TournamentMatchDto[]> = computed(
  (): TournamentMatchDto[] =>
    props.matches.filter(
      (match: TournamentMatchDto): boolean =>
        match.groupIndex === props.groupIndex
    )
);
const groupName: ComputedRef<string> = computed((): string =>
  String.fromCharCode(65 + props.groupIndex)
);
</script>

<template>
  <div class="group">
    <h3 class="group__title">
      {{ t('tournaments.group', { name: groupName }) }}
    </h3>

    <table class="group__standings">
      <thead>
        <tr>
          <th class="group__cell group__cell--name">
            {{ t('tournaments.team') }}
          </th>
          <th class="group__cell">{{ t('tournaments.played') }}</th>
          <th class="group__cell">{{ t('tournaments.wins') }}</th>
          <th class="group__cell">{{ t('tournaments.diff') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in standings"
          :key="row.participant.id"
          class="group__row"
        >
          <td class="group__cell group__cell--name">
            <span class="group__rank">{{ index + 1 }}</span>
            {{ row.participant.name }}
          </td>
          <td class="group__cell">{{ row.played }}</td>
          <td class="group__cell">{{ row.wins }}</td>
          <td class="group__cell">{{ row.diff }}</td>
        </tr>
      </tbody>
    </table>

    <div class="group__matches">
      <button
        v-for="match in groupMatches"
        :key="match.id"
        type="button"
        class="group-match"
        :class="{ 'group-match--clickable': canManage }"
        :disabled="!canManage"
        @click="emit('select', match)"
      >
        <span
          class="group-match__name"
          :class="{
            'group-match__name--winner': match.winnerId === match.participantOneId,
          }"
          >{{ match.participantOne?.name }}</span
        >
        <span class="group-match__score">
          {{ match.scoreOne ?? '–' }} : {{ match.scoreTwo ?? '–' }}
        </span>
        <span
          class="group-match__name group-match__name--right"
          :class="{
            'group-match__name--winner': match.winnerId === match.participantTwoId,
          }"
          >{{ match.participantTwo?.name }}</span
        >
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.group {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;

  &__title {
    font-size: 1rem;
    font-weight: 600;
  }

  &__standings {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  &__cell {
    padding: 0.5rem 0.6rem;
    text-align: center;
    color: $text-secondary;
    border-bottom: 1px solid $border;

    &--name {
      text-align: left;
      color: $text-primary;
    }
  }

  &__rank {
    display: inline-block;
    width: 1.2rem;
    color: $text-muted;
  }

  &__matches {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
}

.group-match {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: $bg-card-alt;
  border: 1px solid $border;
  border-radius: 8px;
  color: $text-secondary;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: default;

  &--clickable {
    cursor: pointer;

    &:hover {
      border-color: $accent-border;
    }
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--right {
      text-align: right;
    }

    &--winner {
      color: $text-primary;
      font-weight: 600;
    }
  }

  &__score {
    color: $text-primary;
    font-variant-numeric: tabular-nums;
  }
}
</style>
