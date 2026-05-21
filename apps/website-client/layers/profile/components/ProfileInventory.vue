<script setup lang="ts">
import type { ItemResponseDto } from '@shared/dtos';

defineProps<{
  items: ItemResponseDto[];
}>();
</script>

<template>
  <div class="profile-inventory">
    <h3 class="profile-inventory-title">{{ $t('profile.inventory') }}</h3>
    <div v-if="items.length === 0" class="profile-inventory-empty">
      <span class="profile-inventory-empty-text">{{
        $t('profile.noItems')
      }}</span>
    </div>
    <div v-else class="profile-inventory-grid">
      <ProfileItem v-for="(item, i) in items" :key="i" :item="item" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-inventory {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &-title {
    color: $text-subtle;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }

  &-empty {
    padding: 24px;
    text-align: center;

    &-text {
      color: $text-subtle;
      font-size: 0.8rem;
    }
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
}

@media (max-width: $mobile) {
  .profile-inventory {
    &-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 8px;
    }
  }
}
</style>
