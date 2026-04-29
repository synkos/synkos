<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName">
      <component :is="Component" :key="route.matched[0]?.path ?? route.path" />
    </transition>
  </router-view>
  <SplashOverlay v-if="showSplash" :logo-src="logoSrc" @done="showSplash = false" />
  <slot />
</template>

<script setup lang="ts">
/**
 * Root component of a Synkos app. Wraps the route view with the
 * platform-aware page transitions (slide for tabs, fade for fullscreen flows,
 * vertical push for entering/leaving the auth stack), drives the splash
 * overlay on native, and applies the active theme via `useTheme()`.
 *
 * Use it as the root of your `app.vue` (or equivalent). Optionally pass a
 * logo source for the splash overlay shown during native app boot.
 *
 * @example
 * <script setup lang="ts">
 * import { SynkosApp } from '@synkos/client'
 * import logo from '~/assets/logo.svg'
 * <\/script>
 *
 * <template>
 *   <SynkosApp :logo-src="logo" />
 * </template>
 */
import { ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import SplashOverlay from './components/SplashOverlay.vue';
import { useSettingsStore } from '../stores/settings.store.js';
import { useTheme } from '../composables/useTheme.js';

defineProps<{ logoSrc?: string }>();

const route = useRoute();
const showSplash = ref(Capacitor.isNativePlatform());

const settingsStore = useSettingsStore();
const { applyTheme } = useTheme();
watchEffect(() => applyTheme(settingsStore.theme));
const transitionName = ref('');

const isAuthPath = (path: string) => path.startsWith('/auth');

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (isAuthPath(oldPath) && !isAuthPath(newPath)) {
      transitionName.value = 'login-exit';
    } else if (!isAuthPath(oldPath) && isAuthPath(newPath)) {
      transitionName.value = 'login-enter';
    } else {
      transitionName.value = '';
    }
  }
);
</script>

<style>
.login-exit-leave-active {
  position: fixed;
  inset: 0;
  z-index: 10;
  transition: transform 0.58s cubic-bezier(0.4, 0, 0.2, 1);
}
.login-exit-leave-to {
  transform: translateY(-100%);
}
.login-exit-enter-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.login-exit-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.login-enter-enter-active {
  position: fixed;
  inset: 0;
  z-index: 10;
  transition: transform 0.58s cubic-bezier(0.4, 0, 0.2, 1);
}
.login-enter-enter-from {
  transform: translateY(-100%);
}
.login-enter-leave-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.login-enter-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.fullscreen-open-enter-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.fullscreen-open-enter-from {
  opacity: 0;
  transform: scale(1.06);
}
.fullscreen-open-leave-active {
  transition: opacity 0.22s ease;
}
.fullscreen-open-leave-to {
  opacity: 0;
}
</style>
