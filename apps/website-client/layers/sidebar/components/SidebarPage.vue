<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  to: string;
  label: string;
  icon: Component;
  active: boolean;
}>();
</script>

<template>
  <NuxtLink :to="to" class="sidebar-page" :class="{ active }">
    <span class="sidebar-page-icon">
      <component :is="icon" />
    </span>
    <span class="sidebar-page-label">{{ label }}</span>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.sidebar-page {
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% + 20px);
  margin-left: -10px;
  margin-right: -10px;
  padding: 10px 9px 10px 10px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: $text-dim;
  font-family: 'Play', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-decoration: none;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    border-radius: 0;
    background: $accent;
    opacity: 0;
    transition: all 0.2s ease;
  }

  &:hover {
    color: #ccc;
    background: rgba($accent, 0.05);

    .sidebar-page-icon {
      color: $accent;
    }
  }

  &.active {
    color: #fff;
    background: rgba($accent, 0.08);

    &::after {
      opacity: 1;
    }

    .sidebar-page-icon {
      color: $accent;
    }
  }

  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-dim;
    flex-shrink: 0;
    transition: all 0.2s ease;

    :deep(svg) {
      width: 14px;
      height: 14px;
    }
  }

  &-label {
    white-space: nowrap;
  }
}

@media (max-width: $mobile) {
  .sidebar-page {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    width: auto;
    margin: 0;
    padding: 8px 0;
    font-size: 0.5rem;

    &::after {
      top: 0;
      bottom: auto;
      left: 0;
      right: 0;
      width: auto;
      height: 2px;
    }

    &-icon {
      :deep(svg) {
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
