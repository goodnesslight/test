<template>
  <div class="app">
    <SidebarPanel />
    <main class="content">
      <nuxt-page />
    </main>
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Play', sans-serif;
  background: $bg-card-alt;
  color: $text-primary;
  min-height: 100vh;
}

.app {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  min-width: 0;
}

@media (max-width: $mobile) {
  .app {
    flex-direction: column;
    padding-bottom: $bottom-bar-height;
  }

  .content {
    order: -1;
  }
}
</style>
