<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

const sidebarService: SidebarService = useSidebarService();
const route: RouteLocationNormalized = useRoute();

onMounted(() => {
  sidebarService.startOnlinePolling();
});

onUnmounted(() => {
  sidebarService.stopOnlinePolling();
});
</script>

<template>
  <aside class="sidebar-panel">
    <div class="sidebar-panel-top">
      <img src="/logo.png" alt="Logo" class="sidebar-panel-logo" />
      <SidebarOnline :count="sidebarService.onlineCount.value" />
    </div>

    <nav class="sidebar-panel-nav">
      <SidebarPage
        v-for="item in sidebarService.navItems.value"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :icon="item.icon"
        :active="route.path === item.to"
      />
    </nav>

    <SidebarAuth />
  </aside>
</template>

<style lang="scss" scoped>
.sidebar-panel {
  width: 140px;
  min-height: 100vh;
  background: $bg-sidebar;
  display: flex;
  flex-direction: column;
  padding: 24px 10px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      transparent 0%,
      rgba($accent, 0.05) 50%,
      transparent 100%
    );
    pointer-events: none;
  }

  &-top {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  &-logo {
    max-width: 120px;
    width: 100%;
    height: auto;
  }

  &-nav {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-top: 24px;
  }
}

@media (max-width: $mobile) {
  .sidebar-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    width: 100%;
    min-height: auto;
    height: $bottom-bar-height;
    flex-direction: row;
    align-items: center;
    padding: 0;
    border-top: 1px solid $border;

    &::before {
      display: none;
    }

    &-top {
      display: none;
    }

    &-nav {
      flex: 1;
      flex-direction: row;
      margin-top: 0;
      height: 100%;
    }
  }
}
</style>
