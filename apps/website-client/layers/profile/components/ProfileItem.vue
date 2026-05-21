<script setup lang="ts">
import type { ItemResponseDto } from '@shared/dtos';
import { ItemRarity } from '@shared/types';

defineProps<{
  item: ItemResponseDto;
}>();

const RARITY_COLORS: Record<ItemRarity, string> = {
  [ItemRarity.CONSUMER_GRADE]: '#b0c3d9',
  [ItemRarity.INDUSTRIAL_GRADE]: '#5e98d9',
  [ItemRarity.MIL_SPEC]: '#4b69ff',
  [ItemRarity.RESTRICTED]: '#8847ff',
  [ItemRarity.CLASSIFIED]: '#d32ce6',
  [ItemRarity.COVERT]: '#eb4b4b',
  [ItemRarity.CONTRABAND]: '#e4ae39',
};
</script>

<template>
  <div class="item-card" :style="{ borderColor: RARITY_COLORS[item.rarity] }">
    <img :src="item.imagePath" :alt="item.nameKey" class="item-card-image" />
    <div class="item-card-info">
      <span class="item-card-name">{{ item.nameKey }}</span>
      <span
        class="item-card-rarity"
        :style="{ color: RARITY_COLORS[item.rarity] }"
        >{{ item.rarity.replace('_', ' ') }}</span
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item-card {
  display: flex;
  flex-direction: column;
  background: $bg-card;
  border: 1px solid $border;
  border-radius: 4px;
  border-top-width: 2px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    background: $bg-card-hover;
  }

  &-image {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: contain;
    padding: 12px;
    background: $bg-card-alt;
  }

  &-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
  }

  &-name {
    color: $text-secondary;
    font-size: 0.75rem;
    font-weight: 700;
  }

  &-rarity {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

@media (max-width: $mobile) {
  .item-card {
    &-image {
      padding: 8px;
    }

    &-info {
      padding: 8px;
    }

    &-name {
      font-size: 0.65rem;
    }

    &-rarity {
      font-size: 0.5rem;
    }
  }
}
</style>
