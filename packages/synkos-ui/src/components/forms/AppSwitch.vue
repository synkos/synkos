<template>
  <button
    type="button"
    role="switch"
    class="app-switch"
    :class="{ 'is-on': modelValue, 'is-disabled': disabled }"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="app-switch__thumb" />
  </button>
</template>

<script setup lang="ts">
/**
 * iOS-style toggle switch (UISwitch). Animated thumb glide with the
 * native cubic-bezier curve, system-green fill when on, light haptic
 * impact on each flip. Use it standalone or as the right-hand control
 * of an `AppListRow` for a settings-style row.
 *
 * @example
 * <AppSwitch v-model="enabled" />
 *
 * @example
 * <AppListRow label="Notifications">
 *   <template #right>
 *     <AppSwitch v-model="prefs.push" />
 *   </template>
 * </AppListRow>
 */
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const props = withDefaults(
  defineProps<{
    /** Bound boolean — toggles between on (true) and off (false). */
    modelValue: boolean;
    /** When true, blocks interaction and dims the control. */
    disabled?: boolean;
    /** Optional accessible label for screen readers. */
    ariaLabel?: string;
    /**
     * Whether to fire a light haptic impact on flip. Defaults to `true`,
     * matching iOS UISwitch behaviour. Pass `false` for silent toggles
     * (e.g. when wiring lots of switches and the parent will batch one
     * confirmation haptic).
     */
    haptic?: boolean;
  }>(),
  { disabled: false, haptic: true }
);

const emit = defineEmits<{
  /** Emitted on each flip with the new value. */
  'update:modelValue': [value: boolean];
}>();

defineSlots<{}>();

function toggle() {
  if (props.disabled) return;
  if (props.haptic) {
    void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  }
  emit('update:modelValue', !props.modelValue);
}
</script>

<style lang="scss" scoped>
// iOS UISwitch geometry: 51 × 31 track with a 27 px thumb that glides
// 20 px between off and on. Background is the system "off" tint when
// off and the system green by default when on (overridable via
// `--app-switch-on-bg`).
.app-switch {
  width: 51px;
  height: 31px;
  border-radius: 9999px;
  background: var(--app-switch-off-bg, rgba(120, 120, 128, 0.32));
  border: none;
  position: relative;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  transition: background 0.2s ease;

  &.is-on {
    background: var(--app-switch-on-bg, var(--color-positive, #30d158));
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--color-primary, #0a84ff);
  }
}

.app-switch__thumb {
  position: absolute;
  width: 27px;
  height: 27px;
  top: 2px;
  left: 2px;
  border-radius: 9999px;
  background: #fff;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.15),
    0 1px 1px rgba(0, 0, 0, 0.1);
  // iOS push curve — gives the thumb its characteristic short, snappy glide.
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  pointer-events: none;
}

.app-switch.is-on .app-switch__thumb {
  transform: translateX(20px);
}

@media (prefers-reduced-motion: reduce) {
  .app-switch,
  .app-switch__thumb {
    transition-duration: 0.01ms !important;
  }
}
</style>
