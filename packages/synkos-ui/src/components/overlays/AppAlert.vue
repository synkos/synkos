<template>
  <Teleport to="body">
    <Transition name="app-alert-backdrop">
      <div v-if="modelValue" class="app-alert-backdrop" @click="onBackdrop" />
    </Transition>

    <Transition name="app-alert-card">
      <div
        v-if="modelValue"
        class="app-alert"
        role="alertdialog"
        :aria-labelledby="title ? 'app-alert-title' : undefined"
        :aria-describedby="message ? 'app-alert-message' : undefined"
      >
        <div class="app-alert__head">
          <p v-if="title" id="app-alert-title" class="app-alert__title">{{ title }}</p>
          <p v-if="message" id="app-alert-message" class="app-alert__message">
            {{ message }}
          </p>
        </div>

        <div
          class="app-alert__actions"
          :class="{ 'app-alert__actions--stacked': actions.length > 2 }"
        >
          <button
            v-for="(action, i) in actions"
            :key="i"
            class="app-alert__btn"
            :class="{
              'app-alert__btn--default': action.role === 'default',
              'app-alert__btn--destructive': action.role === 'destructive',
              'app-alert__btn--cancel': action.role === 'cancel',
            }"
            :disabled="action.disabled"
            @click="onSelect(action)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * iOS-style alert dialog (UIAlertController in alert style). A centered,
 * compact modal that surfaces a title, an optional message and one or
 * more action buttons. Use it for consequential prompts that demand a
 * decision — confirmations, errors that need acknowledgement, "are you
 * sure?" flows.
 *
 * For long lists of choices or a clear "destructive vs the rest"
 * separation, prefer `AppActionSheet` instead — it slides up from the
 * bottom and handles many actions more comfortably.
 *
 * @example
 * <AppAlert
 *   v-model="show"
 *   title="Discard draft?"
 *   message="Your changes haven't been saved."
 *   :actions="[
 *     { label: 'Cancel', role: 'cancel' },
 *     { label: 'Discard', role: 'destructive', onSelect: discard },
 *   ]"
 * />
 */

export interface AlertAction {
  /** Visible label for the button. */
  label: string;
  /**
   * Visual role:
   * - `'default'` — bold, system tint. Used for the recommended action.
   * - `'cancel'` — regular weight, system tint, dismisses without harm.
   * - `'destructive'` — red, used for irreversible actions.
   * Omitted → regular default tint.
   */
  role?: 'default' | 'cancel' | 'destructive';
  /** Handler invoked when the user taps. The alert closes afterwards. */
  onSelect?: () => void;
  /** When true, the button is dimmed and ignores taps. */
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    /** Visibility — bind with v-model. */
    modelValue: boolean;
    /** Bold heading at the top of the card. */
    title?: string;
    /** Smaller body text under the title. */
    message?: string;
    /**
     * Action buttons. 1-2 actions render side-by-side; 3+ stack
     * vertically (matching iOS UIAlertController behaviour).
     */
    actions: AlertAction[];
    /**
     * Whether tapping the dimmed backdrop dismisses the alert. Defaults
     * to false — alerts in iOS are typically modal and require a
     * deliberate button press.
     */
    dismissOnBackdrop?: boolean;
  }>(),
  { dismissOnBackdrop: false }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

defineSlots<{}>();

function onSelect(action: AlertAction) {
  if (action.disabled) return;
  action.onSelect?.();
  emit('update:modelValue', false);
}

function onBackdrop() {
  if (!props.dismissOnBackdrop) return;
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
// 270 px wide card — exactly the iOS UIAlertController width. The card
// uses a saturated blur for the same translucent surface as the system.
.app-alert-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  z-index: 9999;
  -webkit-tap-highlight-color: transparent;
}

.app-alert {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 270px;
  max-width: calc(100vw - 32px);
  z-index: 10000;
  background: var(--glass-bg, rgba(28, 28, 30, 0.82));
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-alert__head {
  padding: 20px 16px 16px;
  text-align: center;
}

.app-alert__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, rgba(255, 255, 255, 0.95));
  margin: 0;
  letter-spacing: -0.2px;
}

.app-alert__message {
  font-size: 13px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.9));
  line-height: 1.4;
  margin: 4px 0 0;
  letter-spacing: -0.1px;
}

.app-alert__actions {
  display: flex;
  border-top: 0.5px solid var(--separator, rgba(255, 255, 255, 0.08));

  &--stacked {
    flex-direction: column;
  }
}

.app-alert__btn {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 17px;
  font-weight: 400;
  color: var(--color-primary, #0a84ff);
  padding: 12px 16px;
  cursor: pointer;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: -0.2px;

  &:not(:first-child) {
    border-left: 0.5px solid var(--separator, rgba(255, 255, 255, 0.08));
  }
}

.app-alert__actions--stacked .app-alert__btn {
  &:not(:first-child) {
    border-left: none;
    border-top: 0.5px solid var(--separator, rgba(255, 255, 255, 0.08));
  }
}

.app-alert__btn--default {
  font-weight: 600;
}

.app-alert__btn--destructive {
  color: var(--color-negative, #ff453a);
}

.app-alert__btn:active:not(:disabled) {
  background: var(--surface-press, rgba(255, 255, 255, 0.04));
}

.app-alert__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

// Backdrop fade
.app-alert-backdrop-enter-active,
.app-alert-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.app-alert-backdrop-enter-from,
.app-alert-backdrop-leave-to {
  opacity: 0;
}

// Card scale-in / fade-out — closer to UIKit's spring without using JS.
.app-alert-card-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.app-alert-card-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.app-alert-card-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.18);
}
.app-alert-card-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .app-alert-backdrop-enter-active,
  .app-alert-backdrop-leave-active,
  .app-alert-card-enter-active,
  .app-alert-card-leave-active {
    transition-duration: 0.01ms !important;
  }
}
</style>
