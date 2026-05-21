<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  label: string;
  icon: Component;
  count: number;
  active: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button class="match-category" :class="{ active }" @click="$emit('click')">
    <component :is="icon" class="match-category-icon" />
    {{ label }}
    <span class="match-category-count">{{ count }}</span>
  </button>
</template>

<style lang="scss" scoped>
.match-category {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: $text-dim;
  font-family: 'Play', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;

  & + & {
    border-left: 1px solid $border;
  }

  &:hover {
    color: #ccc;
    background: rgba($accent, 0.05);

    .match-category-icon {
      color: $accent;
    }
  }

  &.active {
    color: #fff;
    background: rgba($accent, 0.08);
    border-bottom-color: $accent;

    .match-category-icon {
      color: $accent;
    }

    .match-category-count {
      background: $accent;
      color: #fff;
    }
  }

  &-icon {
    width: 16px;
    height: 16px;
    color: $text-dim;
    transition: color 0.2s ease;
  }

  &-count {
    font-size: 0.65rem;
    padding: 2px 7px;
    border-radius: 10px;
    background: #222;
    color: $text-muted;
    letter-spacing: 0;
    transition: all 0.2s ease;
  }
}

@media (max-width: $mobile) {
  .match-category {
    gap: 6px;
    padding: 10px 12px;
    font-size: 0.65rem;
    letter-spacing: 0.8px;

    &-icon {
      width: 14px;
      height: 14px;
    }

    &-count {
      font-size: 0.55rem;
      padding: 2px 5px;
    }
  }
}
</style>
