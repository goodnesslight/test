<script setup lang="ts">
import type { MatchResponseDto } from '@shared/dtos';

defineProps<{
  match: MatchResponseDto;
}>();
</script>

<template>
  <tr class="match-row">
    <td class="cell-date">
      <span class="date-main">{{ match.createdAt }}</span>
    </td>
    <td class="cell-date">
      <span class="date-main">{{ match.finishedAt }}</span>
    </td>
  </tr>
</template>

<style lang="scss" scoped>
.match-row {
  background: $bg-card;
  transition: all 0.15s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  &.row-win::before {
    background: $color-win;
  }

  &.row-loss::before {
    background: $color-loss;
  }

  &:hover {
    background: $bg-card-hover;

    &::before {
      opacity: 1;
    }
  }

  &:nth-child(even) {
    background: $bg-card-alt;

    &:hover {
      background: $bg-card-hover;
    }
  }

  td {
    padding: 12px 16px;
    white-space: nowrap;
    vertical-align: middle;
    border-bottom: 1px solid $border;
  }
}

.cell-date {
  min-width: 140px;
}

.date-main {
  display: block;
  color: $text-secondary;
  font-size: 0.8rem;
}

@media (max-width: $mobile) {
  .match-row {
    td {
      padding: 10px 8px;
    }
  }

  .cell-date {
    min-width: 100px;
  }

  .date-main {
    font-size: 0.7rem;
  }
}
</style>
