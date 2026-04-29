<template>
  <component
    :is="value ? 'div' : 'button'"
    class="app-list-row"
    :disabled="!value ? disabled : undefined"
    @click="!value && !disabled ? $emit('click') : undefined"
  >
    <div v-if="icon" class="row-icon-wrap" :style="{ background: iconBg }">
      <AppIcon :name="icon" size="18px" :style="{ color: iconColor }" />
    </div>

    <div class="row-body">
      <span
        class="row-label"
        :class="{ 'row-label--muted': disabled && !value, 'row-label--danger': danger }"
        >{{ label }}</span
      >
      <span v-if="hint" class="row-hint">{{ hint }}</span>
    </div>

    <slot name="right">
      <template v-if="value">
        <span class="row-value">{{ value }}</span>
      </template>
      <template v-else>
        <span v-if="comingSoon" class="badge-soon">{{ comingSoonLabel }}</span>
        <AppIcon name="chevron_right" class="row-chevron" />
      </template>
    </slot>
  </component>
</template>

<script setup lang="ts">
/**
 * A single row inside a list section. Renders as a `<button>` (interactive) or
 * a `<div>` when a static `value` is provided (read-only display row).
 *
 * Use it for settings entries, navigation items, and key/value displays.
 *
 * @example
 * <AppListSection title="Account">
 *   <AppListRow icon="person" label="Profile" @click="open('profile')" />
 *   <AppListRow icon="lock" label="Password" @click="open('password')" />
 *   <AppListRow icon="trash" label="Delete account" danger @click="confirmDelete" />
 * </AppListSection>
 */

import AppIcon from '../media/AppIcon.vue';

withDefaults(
  defineProps<{
    /** Icon name from the synkos-ui icon registry. Omit for text-only rows. */
    icon?: string;
    /** Foreground color for the icon (CSS color). */
    iconColor?: string;
    /** Background color of the icon tile. */
    iconBg?: string;
    /** Primary label of the row. Required. */
    label: string;
    /** Secondary hint shown under the label. */
    hint?: string;
    /** Dim the row and block interaction. */
    disabled?: boolean;
    /** Render label in the destructive color (delete actions). */
    danger?: boolean;
    /** Show a "coming soon" badge instead of the chevron. */
    comingSoon?: boolean;
    /** Override the badge label when `comingSoon` is true. */
    comingSoonLabel?: string;
    /** Read-only value (e.g. "Premium", "v1.2.3"). When set the row is non-interactive. */
    value?: string;
  }>(),
  {
    comingSoonLabel: 'Coming soon',
  }
);

defineEmits<{
  /** Fired when the row is tapped. Not emitted on disabled or value rows. */
  click: [];
}>();
</script>

<style lang="scss" scoped>
.app-list-row {
  display: flex;
  align-items: center;
  gap: $space-6;
  padding: $space-6 $space-8;
  min-height: 52px;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
  cursor: default;
}

button.app-list-row {
  cursor: pointer;

  &:active:not(:disabled) {
    background: var(--surface-press, #{$surface-press});
  }
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
}

.row-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.row-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $space-1;
  min-width: 0;
}

.row-label {
  font-size: $font-body;
  font-weight: 400;
  color: var(--text-secondary, #{$text-secondary});
  letter-spacing: $ls-normal;

  &--muted {
    color: var(--text-disabled, #{$text-disabled});
  }
  &--danger {
    color: var(--color-negative, #{$negative});
  }
}

.row-hint {
  font-size: $font-caption;
  color: var(--text-tertiary, #{$text-tertiary});
  letter-spacing: $ls-normal;
  line-height: 1.3;
}

.row-value {
  font-size: $font-body;
  color: var(--text-quaternary, #{$text-quaternary});
  letter-spacing: $ls-normal;
  flex-shrink: 0;
}

.row-chevron {
  color: var(--text-quaternary, rgba(255, 255, 255, 0.22));
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.badge-soon {
  font-size: $font-xs;
  font-weight: 600;
  color: var(--text-label, #{$text-label});
  background: var(--separator, #{$separator});
  border: 0.5px solid var(--border-medium, #{$border-medium});
  border-radius: $radius-full;
  padding: $space-1 $space-4;
  letter-spacing: $ls-caps;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>
