<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="app-drawer-backdrop">
      <div
        v-if="modelValue"
        ref="backdropEl"
        class="app-drawer-backdrop"
        @click="$emit('update:modelValue', false)"
      />
    </Transition>

    <!-- Drawer panel -->
    <Transition :name="currentTransition">
      <div v-if="modelValue" class="app-drawer-panel">
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ modelValue: boolean }>();
defineEmits<{ 'update:modelValue': [value: boolean] }>();

const backdropEl = ref<HTMLElement | null>(null);
const currentTransition = ref('app-drawer-slide');

defineExpose({
  backdropEl,
  disableAnimation() {
    currentTransition.value = '';
  },
  enableAnimation() {
    currentTransition.value = 'app-drawer-slide';
  },
});
</script>

<style lang="scss" scoped>
// ─── Backdrop ─────────────────────────────────────────────────────
.app-drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: $z-modal;
}

// ─── Drawer panel ─────────────────────────────────────────────────
.app-drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: $z-modal;
  display: flex;
  flex-direction: column;
}

// ─── Backdrop transition ──────────────────────────────────────────
.app-drawer-backdrop-enter-active {
  transition: opacity 0.25s ease;
}
.app-drawer-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.app-drawer-backdrop-enter-from,
.app-drawer-backdrop-leave-to {
  opacity: 0;
}

// ─── Drawer slide transition ──────────────────────────────────────
.app-drawer-slide-enter-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.app-drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.app-drawer-slide-enter-from,
.app-drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
