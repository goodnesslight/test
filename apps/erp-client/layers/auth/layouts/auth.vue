<script setup lang="ts">
import { onMounted } from 'vue';

import type { LocaleService } from '#layers/i18n';

const localeService: LocaleService = useLocaleService();

onMounted((): void => {
  localeService.restore();
});
</script>

<template>
  <div class="auth-layout">
    <Toast />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background: radial-gradient(
      ellipse at top,
      rgba(79, 125, 249, 0.07),
      transparent 60%
    ),
    $bg-page;
}
</style>
