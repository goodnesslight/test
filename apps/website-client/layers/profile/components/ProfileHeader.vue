<script setup lang="ts">
import type { AccountResponseDto } from '@shared/dtos';

defineProps<{
  account: AccountResponseDto;
}>();
</script>

<template>
  <div class="profile-header">
    <img
      v-if="account.avatar.imagePath"
      :src="account.avatar.imagePath"
      :alt="account.avatar.nameKey"
      class="profile-header-avatar"
    />
    <div class="profile-header-info">
      <span class="profile-header-name">{{ account.username }}</span>
      <span class="profile-header-steam">{{ account.steamId }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: $bg-card;
  border: 1px solid $border;
  border-radius: 4px;

  &-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid $border;
    object-fit: cover;
  }

  &-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &-name {
    color: $text-primary;
    font-size: 1.1rem;
    font-weight: 700;
  }

  &-steam {
    color: $text-muted;
    font-size: 0.75rem;
    font-family: monospace;
    word-break: break-all;
  }
}

@media (max-width: $mobile) {
  .profile-header {
    gap: 12px;
    padding: 14px;

    &-avatar {
      width: 48px;
      height: 48px;
    }

    &-name {
      font-size: 0.95rem;
    }

    &-steam {
      font-size: 0.65rem;
    }
  }
}
</style>
