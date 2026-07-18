<template>
  <div class="layout">
    <Toast position="top-center" />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
}
</style>
