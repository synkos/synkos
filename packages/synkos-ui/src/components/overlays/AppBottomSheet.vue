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
/**
 * Modal sheet that slides up from the bottom edge. Pair with `useBottomSheet()`
 * for the easiest two-way binding. The component itself is unstyled — pass a
 * card surface inside the slot for the visible body.
 *
 * @example
 * <script setup lang="ts">
 * import { AppBottomSheet, useBottomSheet } from '@synkos/ui'
 * const sheet = useBottomSheet()
 * <\/script>
 *
 * <template>
 *   <AppButton @click="sheet.open">Open sheet</AppButton>
 *   <AppBottomSheet v-bind="sheet.bindings">
 *     <div class="my-sheet"> ... </div>
 *   </AppBottomSheet>
 * </template>
 */
withDefaults(
  defineProps<{
    /** Visibility of the sheet. Use with `v-model` or via `useBottomSheet()`. */
    modelValue: boolean;
    /** Hide the dimmed backdrop and pass pointer events to underlying UI. */
    seamless?: boolean;
  }>(),
  { seamless: false }
);

defineEmits<{
  /** Fired when the user dismisses the sheet (backdrop tap, Escape key). */
  'update:modelValue': [value: boolean];
}>();

defineSlots<{
  /** Sheet body. Render your card surface and content here. */
  default: () => unknown;
}>();
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
