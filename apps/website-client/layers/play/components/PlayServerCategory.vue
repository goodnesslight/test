<script setup lang="ts">
import { ServerType } from '@shared/types';

defineProps<{
  category: ServerType;
  active: boolean;
}>();

defineEmits<{
  select: [];
}>();

const SERVER_TYPE_NAME_KEY: Record<ServerType, string> = {
  [ServerType.DEATHMATCH]: 'play.serverCategory.deathmatch',
  [ServerType.RETAKE]: 'play.serverCategory.retake',
  [ServerType.KREEDZ_CLIMBING]: 'play.serverCategory.kreedzClimbing',
};
</script>

<template>
  <button
    class="server-category-tab"
    :class="{ active }"
    @click="$emit('select')"
  >
    {{ $t(SERVER_TYPE_NAME_KEY[category]) }}
  </button>
</template>

<style lang="scss" scoped>
.server-category-tab {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: $text-muted;
  font-family: 'Play', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: $accent;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover {
    color: #aaa;
  }

  &.active {
    color: $text-primary;

    &::after {
      opacity: 1;
    }
  }
}

@media (max-width: $mobile) {
  .server-category-tab {
    padding: 10px 12px;
    font-size: 0.6rem;
    letter-spacing: 0.5px;
  }
}
</style>
