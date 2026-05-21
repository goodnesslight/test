<script setup lang="ts">
defineProps<{
  count: string;
}>();
</script>

<template>
  <div class="sidebar-online">
    <div class="sidebar-online-dot"></div>
    <span class="sidebar-online-count">{{ count }}</span>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-online {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
  gap: 10px;

  &-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: $accent;
    animation: pulse 5s ease-in-out infinite;
  }

  &-count {
    font-size: 0.8rem;
    font-weight: 700;
    color: #fff;
    line-height: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba($accent, 0);
    transform: scale(1);
  }
  10% {
    box-shadow: 0 0 0 4px rgba($accent, 0.15);
    transform: scale(1.15);
  }
  20% {
    box-shadow: 0 0 0 0 rgba($accent, 0);
    transform: scale(1);
  }
}
</style>
