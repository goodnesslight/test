<script setup lang="ts">
import { ServerType } from '@shared/types';

const { t } = useI18n();
useHead({ title: () => t('titles.play') });

const playService: PlayService = usePlayService();
</script>

<template>
  <div class="server-page">
    <div class="server-tabs">
      <PlayServerCategory
        v-for="category in Object.values(ServerType)"
        :key="category"
        :category="category"
        :active="playService.activeCategory.value === category"
        @select="playService.setCategory(category)"
      />
    </div>
    <div
      v-if="playService.servers.value.length === 0"
      class="server-page-empty"
    >
      <span class="server-page-empty-text">{{ $t('play.empty') }}</span>
    </div>
    <PlayServerTable
      v-else
      :servers="playService.servers.value"
      @copy="playService.copyAddress"
    />
  </div>
</template>

<style lang="scss" scoped>
.server-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: $bg-page;

  &-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    &-text {
      color: $text-subtle;
      font-size: 0.9rem;
    }
  }
}

.server-tabs {
  display: flex;
  background: $bg-dark;
  border-bottom: 1px solid $border-light;
}
</style>
