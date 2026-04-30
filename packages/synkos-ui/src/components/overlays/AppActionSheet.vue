<template>
  <AppBottomSheet :model-value="modelValue" @update:model-value="onDismiss">
    <div class="app-action-sheet">
      <!-- Actions group (title + message + actions) -->
      <div class="app-action-sheet__group">
        <div v-if="title || message" class="app-action-sheet__header">
          <p v-if="title" class="app-action-sheet__title">{{ title }}</p>
          <p v-if="message" class="app-action-sheet__message">{{ message }}</p>
        </div>

        <button
          v-for="(action, i) in actions"
          :key="i"
          class="app-action-sheet__btn"
          :class="{
            'app-action-sheet__btn--destructive': action.role === 'destructive',
            'app-action-sheet__btn--disabled': action.disabled,
          }"
          :disabled="action.disabled"
          @click="onSelect(action)"
        >
          {{ action.label }}
        </button>
      </div>

      <!-- Cancel group (separated by a gap) -->
      <div class="app-action-sheet__group">
        <button
          class="app-action-sheet__btn app-action-sheet__btn--cancel"
          @click="onDismiss(false)"
        >
          {{ cancelLabel }}
        </button>
      </div>
    </div>
  </AppBottomSheet>
</template>

<script setup lang="ts">
/**
 * iOS-style action sheet (UIActionSheet). Renders a grouped list of
 * actions sliding up from the bottom, with a separated cancel button —
 * the iOS pattern for "what do you want to do?" prompts where one of
 * the choices is destructive (delete, sign out, …).
 *
 * Built on top of `AppBottomSheet` so dismiss-on-backdrop, transitions
 * and accessibility behave like every other Synkos sheet.
 *
 * @example
 * <AppActionSheet
 *   v-model="show"
 *   title="Delete item?"
 *   message="This cannot be undone."
 *   :actions="[
 *     { label: 'Delete', role: 'destructive', onSelect: doDelete },
 *     { label: 'Archive', onSelect: doArchive },
 *   ]"
 * />
 */
import AppBottomSheet from './AppBottomSheet.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface ActionSheetAction {
  /** Visible label for the row. */
  label: string;
  /**
   * `'default'` (the only option besides destructive) renders in the system
   * tint colour. `'destructive'` is rendered in red and is intended for
   * actions like "Delete", "Sign out", "Discard changes".
   */
  role?: 'default' | 'destructive';
  /** Handler invoked when the user taps the row. The sheet closes after. */
  onSelect?: () => void;
  /** When true, the row is rendered dimmed and ignores taps. */
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    /** Visibility of the sheet. Use with `v-model`. */
    modelValue: boolean;
    /** Optional title shown at the top of the action group. */
    title?: string;
    /** Optional secondary line under the title (call-to-action context). */
    message?: string;
    /** Label of the cancel button. Defaults to 'Cancel'. */
    cancelLabel?: string;
    /** Action rows to render inside the main group. */
    actions: ActionSheetAction[];
  }>(),
  { cancelLabel: 'Cancel' }
);

const emit = defineEmits<{
  /** Fired with the new value on every visibility change. */
  'update:modelValue': [value: boolean];
  /** Fired right after the user dismisses without selecting an action. */
  cancel: [];
}>();

defineSlots<{}>();

function onSelect(action: ActionSheetAction) {
  if (action.disabled) return;
  void Haptics.impact({
    style: action.role === 'destructive' ? ImpactStyle.Medium : ImpactStyle.Light,
  }).catch(() => undefined);
  action.onSelect?.();
  emit('update:modelValue', false);
}

function onDismiss(_open: boolean) {
  // Either backdrop tap or cancel button — both result in closed + cancel event.
  if (props.modelValue) emit('cancel');
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
// iOS UIActionSheet uses two stacked groups: actions on top, cancel below.
// 8 px gap between groups so they read as distinct cards. 14 px corner
// radius matches the system. Glass background + saturated blur match the
// iOS 13+ appearance. The rows inside each group are separated by a
// hairline rather than a margin so the group reads as a single surface.
.app-action-sheet {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 8px max(8px, env(safe-area-inset-bottom, 8px));
}

.app-action-sheet__group {
  background: var(--glass-bg, rgba(28, 28, 30, 0.82));
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 14px;
  overflow: hidden;
}

.app-action-sheet__header {
  padding: 16px 16px 12px;
  text-align: center;
  border-bottom: 0.5px solid var(--separator, rgba(255, 255, 255, 0.07));
}

.app-action-sheet__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-tertiary, rgba(235, 235, 245, 0.6));
  margin: 0;
  letter-spacing: -0.1px;
}

.app-action-sheet__message {
  font-size: 12px;
  color: var(--text-quaternary, rgba(235, 235, 245, 0.45));
  margin: 4px 0 0;
  letter-spacing: -0.1px;
}

.app-action-sheet__btn {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  font-size: 17px;
  font-weight: 400;
  color: var(--color-primary, #0a84ff);
  padding: 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: -0.2px;

  & + & {
    border-top: 0.5px solid var(--separator, rgba(255, 255, 255, 0.07));
  }

  &:active:not(:disabled) {
    background: var(--surface-press, rgba(255, 255, 255, 0.04));
  }

  &--destructive {
    color: var(--color-negative, #ff453a);
  }

  &--cancel {
    font-weight: 600;
  }

  &--disabled,
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
