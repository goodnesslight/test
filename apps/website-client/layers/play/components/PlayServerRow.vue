<script setup lang="ts">
import { ref } from 'vue';

import type { ServerResponseDto } from '@shared/dtos';

import IconCheck from './icons/IconCheck.vue';
import IconCopy from './icons/IconCopy.vue';

defineProps<{
  server: ServerResponseDto;
}>();

const emit: (evt: 'copy') => void = defineEmits<{
  copy: [];
}>();

const copied: Ref<boolean, boolean> = ref(false);

function handleCopy(): void {
  emit('copy');
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
}
</script>

<template>
  <tr class="server-row">
    <td class="cell-ip">
      <span class="ip-text">{{ server.ip }}:{{ server.port }}</span>
      <button class="copy-icon" :class="{ copied }" @click="handleCopy">
        <IconCopy v-if="!copied" />
        <IconCheck v-else />
      </button>
    </td>
    <td class="cell-map">
      <span class="map-text">{{ server.map }}</span>
    </td>
    <td class="cell-players">
      <span class="players-text"
        >{{ server.currentPlayers }}/{{ server.maxPlayers }}</span
      >
    </td>
    <td class="cell-location">
      <span class="location-text">Kyiv</span>
    </td>
  </tr>
</template>

<style lang="scss" scoped>
.server-row {
  background: $bg-card;
  transition: all 0.15s ease;

  &:hover {
    background: $bg-card-hover;
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
    text-align: center;
    border-bottom: 1px solid $border;
  }
}

.cell-ip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ip-text {
  color: $text-secondary;
  font-size: 0.8rem;
  font-family: monospace;
}

.map-text,
.players-text,
.location-text {
  color: $text-dim;
  font-size: 0.8rem;
}

.copy-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  transition: all 0.2s ease;

  :deep(svg) {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: $accent;
  }

  &.copied {
    color: $color-win;
  }
}

@media (max-width: $mobile) {
  .server-row {
    td {
      padding: 10px 8px;
    }
  }

  .cell-ip {
    gap: 4px;
  }

  .ip-text {
    font-size: 0.7rem;
  }

  .map-text,
  .players-text,
  .location-text {
    font-size: 0.7rem;
  }

  .cell-location {
    display: none;
  }
}
</style>
