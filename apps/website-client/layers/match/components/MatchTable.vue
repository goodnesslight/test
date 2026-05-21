<script setup lang="ts">
import type { MatchResponseDto } from '@shared/dtos';

defineProps<{
  matches: MatchResponseDto[];
}>();
</script>

<template>
  <div class="match-table">
    <table class="match-table-grid">
      <thead>
        <tr>
          <th>{{ $t('matches.createdAt') }}</th>
          <th>{{ $t('matches.finishedAt') }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <MatchRow v-for="(match, i) in matches" :key="i" :match="match" />
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.match-table {
  flex: 1;
  overflow-x: auto;

  &-grid {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;

    thead {
      position: sticky;
      top: 0;
      z-index: 5;
    }

    th {
      text-align: left;
      padding: 12px 16px;
      color: $text-subtle;
      font-weight: 700;
      font-size: 0.65rem;
      letter-spacing: 1.2px;
      background: $bg-dark;
      border-bottom: 1px solid $border-light;
      white-space: nowrap;
    }
  }
}

@media (max-width: $mobile) {
  .match-table {
    -webkit-overflow-scrolling: touch;

    &-grid {
      th {
        padding: 10px 8px;
        font-size: 0.55rem;
      }
    }
  }
}
</style>
