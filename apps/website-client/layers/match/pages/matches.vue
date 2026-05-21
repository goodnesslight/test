<script setup lang="ts">
const { t } = useI18n();
useHead({ title: () => t('titles.matches') });

const authService: AuthService = useAuthService();
const matchService: MatchService = useMatchService();
</script>

<template>
  <div class="match-page">
    <div v-if="!authService.isLoggedIn.value" class="match-page-empty">
      <span class="match-page-empty-text">{{
        $t('matches.unauthorized')
      }}</span>
    </div>
    <div
      v-else-if="matchService.matches.value.length === 0"
      class="match-page-empty"
    >
      <span class="match-page-empty-text">{{ $t('matches.empty') }}</span>
    </div>
    <MatchTable v-else :matches="matchService.matches.value" />
  </div>
</template>

<style lang="scss" scoped>
.match-page {
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
</style>
