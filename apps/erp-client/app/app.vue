<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: $bg-page;
  color: $text-primary;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3 {
  font-weight: 600;
  letter-spacing: -0.02em;
}
</style>
