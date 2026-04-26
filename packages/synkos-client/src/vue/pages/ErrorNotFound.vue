<template>
  <div class="not-found">
    <q-icon name="search_off" size="64px" color="grey-6" />
    <p class="not-found-text">404 — Page not found</p>
    <q-btn flat color="primary" label="Go home" :to="{ name: 'home' }" />
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  gap: 16px;
}
.not-found-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}
</style>
