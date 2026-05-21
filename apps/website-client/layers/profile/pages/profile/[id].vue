<script setup lang="ts">
const { t } = useI18n();
const profileService: ProfileService = useProfileService();

useHead({
  title: () =>
    profileService.account.value
      ? t('titles.profile', { username: profileService.account.value.username })
      : t('titles.profile', { username: '...' }),
});
</script>

<template>
  <div class="profile-page">
    <div v-if="!profileService.account.value" class="profile-page-empty">
      <span class="profile-page-empty-text">{{ $t('profile.loading') }}</span>
    </div>
    <div v-else class="profile-page-content">
      <ProfileHeader :account="profileService.account.value" />
      <ProfileInventory :items="profileService.account.value.inventory.items" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
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

  &-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
  }
}

@media (max-width: $mobile) {
  .profile-page {
    &-content {
      gap: 16px;
      padding: 12px;
    }
  }
}
</style>
