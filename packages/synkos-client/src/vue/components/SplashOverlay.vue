<template>
  <Transition name="splash-out" @after-leave="$emit('done')">
    <div v-if="visible" class="splash-overlay">
      <Transition name="splash-in" appear>
        <img v-if="logoVisible && logoSrc" :src="logoSrc" alt="App logo" class="splash-logo" />
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth.store.js';

defineProps<{ logoSrc?: string }>();
defineEmits<{ done: [] }>();

const authStore = useAuthStore();
const visible = ref(true);
const logoVisible = ref(false);

// Minimum time the splash is visible so the animation has time to play
const MIN_DURATION_MS = 1800;

onMounted(() => {
  // Trigger logo entrance on next tick so the transition fires
  requestAnimationFrame(() => {
    logoVisible.value = true;
  });

  const startedAt = Date.now();

  const tryHide = () => {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_DURATION_MS - elapsed);
    setTimeout(() => {
      visible.value = false;
    }, remaining);
  };

  if (authStore.isInitialized) {
    tryHide();
  } else {
    const stop = watch(
      () => authStore.isInitialized,
      (ready) => {
        if (ready) {
          stop();
          tryHide();
        }
      }
    );
  }
});
</script>

<style scoped lang="scss">
.splash-overlay {
  position: fixed;
  inset: 0;
  z-index: $z-splash;
  background: $surface-bg;
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-logo {
  // Matches LaunchScreen.storyboard: width/height = 160pt, centerY offset = -20pt
  width: 160px;
  height: 160px;
  object-fit: contain;
  // transform is handled by splash-spin keyframes to keep translateY(-20px) consistent
}

// Continuous spin while visible
@keyframes splash-spin {
  from {
    transform: translateY(-20px) rotate(0deg);
  }
  to {
    transform: translateY(-20px) rotate(360deg);
  }
}

.splash-logo {
  animation: splash-spin 1.8s linear infinite;
}

// Overlay exit: fade out
.splash-out-leave-active {
  transition: opacity 0.4s ease;
}
.splash-out-leave-to {
  opacity: 0;
}
</style>
