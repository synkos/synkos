<template>
  <Teleport to="body">
    <!-- Backdrop — hidden when seamless -->
    <Transition name="app-bs-backdrop">
      <div
        v-if="modelValue && !seamless"
        class="app-bs-backdrop"
        @click="$emit('update:modelValue', false)"
      />
    </Transition>

    <!-- Sheet container -->
    <Transition name="app-bs-slide">
      <div
        v-if="modelValue"
        class="app-bs-container"
        :class="{ 'app-bs-container--seamless': seamless }"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    seamless?: boolean;
  }>(),
  { seamless: false }
);

defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<style lang="scss" scoped>
// ─── Backdrop ─────────────────────────────────────────────────────
.app-bs-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: $z-modal;
}

// ─── Sheet container ──────────────────────────────────────────────
.app-bs-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $z-modal;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  // Seamless: no backdrop, pointer events pass through empty area
  &--seamless {
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }
}

// ─── Backdrop transition ──────────────────────────────────────────
.app-bs-backdrop-enter-active {
  transition: opacity 0.22s ease;
}
.app-bs-backdrop-leave-active {
  transition: opacity 0.28s ease;
}
.app-bs-backdrop-enter-from,
.app-bs-backdrop-leave-to {
  opacity: 0;
}

// ─── Sheet slide transition ───────────────────────────────────────
.app-bs-slide-enter-active {
  transition: transform 0.38s cubic-bezier(0.32, 0.72, 0, 1);
}
.app-bs-slide-leave-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.app-bs-slide-enter-from,
.app-bs-slide-leave-to {
  transform: translateY(100%);
}
</style>
