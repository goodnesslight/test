<script setup lang="ts">
import { computed, type ComputedRef } from 'vue';

import type { TournamentMatchDto } from '@erp/dtos';

interface TournamentBracketProps {
  matches: TournamentMatchDto[];
  canManage: boolean;
}

interface TournamentBracketEmits {
  (event: 'select', match: TournamentMatchDto): void;
}

interface BracketRound {
  round: number;
  label: string;
  matches: TournamentMatchDto[];
}

const props: TournamentBracketProps = defineProps<TournamentBracketProps>();
const emit: TournamentBracketEmits = defineEmits<TournamentBracketEmits>();

const { t } = useI18n();

const rounds: ComputedRef<BracketRound[]> = computed((): BracketRound[] => {
  const byRound: Map<number, TournamentMatchDto[]> = new Map();

  for (const match of props.matches) {
    if (match.round === null) {
      continue;
    }

    const list: TournamentMatchDto[] = byRound.get(match.round) ?? [];
    list.push(match);
    byRound.set(match.round, list);
  }

  const maxRound: number = Math.max(...byRound.keys(), 0);

  return Array.from(byRound.keys())
    .sort((a: number, b: number): number => a - b)
    .map((round: number): BracketRound => ({
      round,
      label:
        round === maxRound
          ? t('tournaments.final')
          : t('tournaments.round', { round }),
      matches: (byRound.get(round) ?? []).sort(
        (a: TournamentMatchDto, b: TournamentMatchDto): number =>
          (a.slot ?? 0) - (b.slot ?? 0)
      ),
    }));
});

function nameOf(id: number | null, match: TournamentMatchDto): string {
  if (id === null) {
    return t('tournaments.tbd');
  }

  if (match.participantOne?.id === id) {
    return match.participantOne.name;
  }

  if (match.participantTwo?.id === id) {
    return match.participantTwo.name;
  }

  return t('tournaments.tbd');
}
</script>

<template>
  <div class="bracket">
    <div v-for="round in rounds" :key="round.round" class="bracket__round">
      <span class="bracket__round-label">{{ round.label }}</span>
      <div class="bracket__matches">
        <button
          v-for="match in round.matches"
          :key="match.id"
          type="button"
          class="bracket-match"
          :class="{ 'bracket-match--clickable': canManage }"
          :disabled="!canManage"
          @click="emit('select', match)"
        >
          <div
            class="bracket-match__row"
            :class="{
              'bracket-match__row--winner':
                match.winnerId !== null &&
                match.winnerId === match.participantOneId,
              'bracket-match__row--loser':
                match.winnerId !== null &&
                match.winnerId !== match.participantOneId,
            }"
          >
            <span class="bracket-match__name">{{
              nameOf(match.participantOneId, match)
            }}</span>
            <span class="bracket-match__score">{{ match.scoreOne ?? '' }}</span>
          </div>
          <div
            class="bracket-match__row"
            :class="{
              'bracket-match__row--winner':
                match.winnerId !== null &&
                match.winnerId === match.participantTwoId,
              'bracket-match__row--loser':
                match.winnerId !== null &&
                match.winnerId !== match.participantTwoId,
            }"
          >
            <span class="bracket-match__name">{{
              nameOf(match.participantTwoId, match)
            }}</span>
            <span class="bracket-match__score">{{ match.scoreTwo ?? '' }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bracket {
  display: flex;
  gap: 2.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  &__round {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 200px;
  }

  &__round-label {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $text-muted;
  }

  &__matches {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 1rem;
    height: 100%;
  }
}

.bracket-match {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0;
  background: $border;
  border: 1px solid $border;
  border-radius: 10px;
  overflow: hidden;
  font-family: inherit;
  text-align: left;
  cursor: default;

  &--clickable {
    cursor: pointer;

    &:hover {
      border-color: $accent-border;
    }
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.55rem 0.75rem;
    background: $bg-card;
    color: $text-secondary;
    font-size: 0.9rem;

    &--winner {
      color: $text-primary;
      font-weight: 600;
      border-left: 3px solid $color-win;
    }

    &--loser {
      color: $text-dim;
      border-left: 3px solid transparent;
    }
  }

  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__score {
    flex-shrink: 0;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
  }
}
</style>
