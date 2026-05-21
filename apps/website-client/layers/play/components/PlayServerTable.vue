<script setup lang="ts">
import type { ServerResponseDto } from '@shared/dtos';

defineProps<{
  servers: ServerResponseDto[];
}>();

const emit: (evt: 'copy', server: ServerResponseDto) => void = defineEmits<{
  copy: [server: ServerResponseDto];
}>();
</script>

<template>
  <div class="server-table">
    <table class="server-table-grid">
      <thead>
        <tr>
          <th>{{ $t('play.ip') }}</th>
          <th>{{ $t('play.map') }}</th>
          <th>{{ $t('play.players') }}</th>
          <th>{{ $t('play.location') }}</th>
        </tr>
      </thead>
      <tbody>
        <PlayServerRow
          v-for="(server, i) in servers"
          :key="i"
          :server="server"
          @copy="emit('copy', server)"
        />
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.server-table {
  flex: 1;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &-grid {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 0.8rem;

    thead {
      position: sticky;
      top: 0;
      z-index: 5;
    }

    th {
      text-align: center;
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
  .server-table {
    &-grid {
      table-layout: auto;

      th {
        padding: 10px 8px;
        font-size: 0.55rem;
        letter-spacing: 0.8px;

        &:nth-child(4) {
          display: none;
        }
      }
    }
  }
}
</style>
