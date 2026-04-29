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
/**
 * Side drawer that slides in from the right edge. Pair with `useDrawer()` for
 * the easiest two-way binding. Renders teleported to `<body>` and dismisses
 * on backdrop tap.
 *
 * @example
 * <script setup lang="ts">
 * import { AppDrawer, useDrawer } from '@synkos/ui'
 * const menu = useDrawer()
 * <\/script>
 *
 * <template>
 *   <AppButton variant="ghost" @click="menu.open">Menu</AppButton>
 *   <AppDrawer v-bind="menu.bindings">
 *     <nav class="my-drawer"> ... </nav>
 *   </AppDrawer>
 * </template>
 */
import { ref } from 'vue';

defineProps<{
  /** Drawer visibility. Use `v-model` or `useDrawer()`. */
  modelValue: boolean;
}>();

defineEmits<{
  /** Fired when the user dismisses the drawer (backdrop tap). */
  'update:modelValue': [value: boolean];
}>();

defineSlots<{
  /** Drawer panel content. */
  default: () => unknown;
}>();

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
