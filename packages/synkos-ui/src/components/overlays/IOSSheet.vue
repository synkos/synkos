<template>
  <Teleport to="body">
    <Transition name="ios-sheet-backdrop">
      <div
        v-if="modelValue && !seamless"
        class="ios-sheet__backdrop"
        :style="backdropStyle"
        @click="onBackdropTap"
      />
    </Transition>

    <Transition name="ios-sheet-slide" @after-leave="onAfterLeave">
      <div
        v-if="modelValue"
        class="ios-sheet"
        :class="[`ios-sheet--${detent}`, { 'ios-sheet--seamless': seamless }]"
        :style="dragStyle"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div
          v-if="dragHandle || title || dismissLabel || confirmLabel"
          class="ios-sheet__top"
          @touchstart.passive="onDragStart"
          @touchmove.passive="onDragMove"
          @touchend="onDragEnd"
          @touchcancel="onDragEnd"
        >
          <div v-if="dragHandle" class="ios-sheet__handle" aria-hidden="true" />

          <slot name="header">
            <div v-if="title || dismissLabel || confirmLabel" class="ios-sheet__header">
              <button
                v-if="dismissLabel"
                type="button"
                class="ios-sheet__action ios-sheet__action--leading"
                @click="onDismiss"
              >
                {{ dismissLabel }}
              </button>
              <span v-else class="ios-sheet__action ios-sheet__action--leading" />

              <h3 v-if="title" class="ios-sheet__title">{{ title }}</h3>
              <span v-else class="ios-sheet__title" />

              <button
                v-if="confirmLabel"
                type="button"
                class="ios-sheet__action ios-sheet__action--trailing ios-sheet__action--strong"
                :disabled="confirmDisabled || confirmLoading"
                @click="onConfirm"
              >
                <IOSSpinner v-if="confirmLoading" size="18px" color="primary" />
                <template v-else>{{ confirmLabel }}</template>
              </button>
              <span v-else class="ios-sheet__action ios-sheet__action--trailing" />
            </div>
          </slot>
        </div>

        <div v-if="hasBelowHeader" class="ios-sheet__sticky-top">
          <slot name="belowHeader" />
        </div>

        <div ref="bodyEl" class="ios-sheet__body">
          <slot />
        </div>

        <div v-if="hasFooter" class="ios-sheet__footer">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * Modal sheet that emulates the native iOS 15+ "sheet presentation" — slides
 * up from the bottom over a dimmed, blurred backdrop, with an optional drag
 * handle, drag-to-dismiss gesture, and a built-in iOS-style header (cancel
 * left, title centered, confirm right).
 *
 * Use this over `AppBottomSheet` when you need a richer overlay: titled
 * picker, multi-step form, multi-select list. For lightweight, unstyled
 * overlays (e.g. tooltips, custom action menus), prefer `AppBottomSheet`.
 *
 * @example
 * <script setup lang="ts">
 * import { IOSSheet, useBottomSheet } from '@synkos/ui'
 * const sheet = useBottomSheet()
 * <\/script>
 *
 * <template>
 *   <IOSSheet
 *     v-bind="sheet.bindings"
 *     title="Pick a repo"
 *     dismiss-label="Cancel"
 *     confirm-label="Import"
 *     :confirm-disabled="!selected"
 *     @confirm="doImport"
 *   >
 *     <template #belowHeader>
 *       <input v-model="q" placeholder="Search…" />
 *     </template>
 *     <ul> ... </ul>
 *   </IOSSheet>
 * </template>
 */
import { computed, nextTick, ref, watch } from 'vue';
import IOSSpinner from '../feedback/IOSSpinner.vue';

const props = withDefaults(
  defineProps<{
    /** Visibility of the sheet. Use with `v-model` or via `useBottomSheet()`. */
    modelValue: boolean;
    /** Optional title rendered centered in the built-in header. */
    title?: string;
    /** Label for the leading (left) header button. Omit to hide. */
    dismissLabel?: string;
    /** Label for the trailing (right) header button. Omit to hide. */
    confirmLabel?: string;
    /** When true, the trailing action is dimmed and ignores taps. */
    confirmDisabled?: boolean;
    /** When true, the trailing action shows a spinner instead of its label. */
    confirmLoading?: boolean;
    /** Sheet height. `medium` is roughly half-screen; `large` near full. */
    detent?: 'medium' | 'large';
    /** Show the small grabber handle at the top. Defaults to true. */
    dragHandle?: boolean;
    /** Allow swiping the sheet down to dismiss. Defaults to true. */
    dragToDismiss?: boolean;
    /** Apply a blurred backdrop in addition to the dim overlay. */
    backdropBlur?: boolean;
    /** Hide backdrop and let pointer events fall through empty space. */
    seamless?: boolean;
    /** Allow tapping the backdrop to close. Defaults to true. */
    backdropDismiss?: boolean;
  }>(),
  {
    detent: 'large',
    dragHandle: true,
    dragToDismiss: true,
    backdropBlur: true,
    seamless: false,
    backdropDismiss: true,
    confirmDisabled: false,
    confirmLoading: false,
  }
);

const emit = defineEmits<{
  /** Fired with the new value on every visibility change. */
  'update:modelValue': [value: boolean];
  /** Fired when the user taps the leading button or backdrop. */
  dismiss: [];
  /** Fired when the user taps the trailing (confirm) button. */
  confirm: [];
}>();

const slots = defineSlots<{
  /** Sheet body (scrollable). */
  default: () => unknown;
  /** Replaces the entire built-in header (handle + title + actions). */
  header: () => unknown;
  /** Sticky region directly below the header — ideal for a search bar. */
  belowHeader: () => unknown;
  /** Sticky bottom region — ideal for a primary action / toolbar. */
  footer: () => unknown;
}>();

const hasBelowHeader = computed<boolean>(() => Boolean(slots.belowHeader));
const hasFooter = computed<boolean>(() => Boolean(slots.footer));

// ─── Drag-to-dismiss ──────────────────────────────────────────────
const dragOffset = ref(0);
const isDragging = ref(false);
let dragStartY = 0;

const dragStyle = computed(() => ({
  transform: dragOffset.value > 0 ? `translateY(${dragOffset.value}px)` : '',
  transition: isDragging.value ? 'none' : 'transform 0.34s cubic-bezier(0.32, 0.72, 0, 1)',
}));

/**
 * Backdrop is a subtle blur + light dim that scales with the sheet's
 * vertical position: full strength when the sheet is up, fading out as the
 * user drags it down, gone by the time the dismissal threshold is reached.
 * The fade-in on entry is handled by the `<Transition>` opacity class.
 */
const backdropStyle = computed<Record<string, string>>(() => {
  const t = Math.min(1, dragOffset.value / 240);
  const maxBlur = 8;
  const maxDim = 0.22;
  const blur = maxBlur * (1 - t);
  const dim = maxDim * (1 - t);
  const style: Record<string, string> = { background: `rgba(0, 0, 0, ${dim})` };
  if (props.backdropBlur && blur > 0.1) {
    style.backdropFilter = `saturate(160%) blur(${blur}px)`;
    style.WebkitBackdropFilter = `saturate(160%) blur(${blur}px)`;
  }
  return style;
});

function onDragStart(e: TouchEvent) {
  if (!props.dragToDismiss) return;
  dragStartY = e.touches[0]!.clientY;
  isDragging.value = true;
}

function onDragMove(e: TouchEvent) {
  if (!isDragging.value) return;
  const delta = e.touches[0]!.clientY - dragStartY;
  dragOffset.value = Math.max(0, delta);
}

function onDragEnd() {
  if (!isDragging.value) return;
  isDragging.value = false;
  const DISMISS_THRESHOLD = 100;
  if (dragOffset.value > DISMISS_THRESHOLD) {
    // Continue the slide off-screen using the inline transition, then fire
    // the dismiss so Vue's leave animation can take over for the backdrop fade.
    const target = typeof window !== 'undefined' ? window.innerHeight : 1000;
    dragOffset.value = target;
    setTimeout(() => onDismiss(), 320);
  } else {
    dragOffset.value = 0;
  }
}

// ─── Body scroll lock ─────────────────────────────────────────────
let savedOverflow = '';
watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return;
    if (open) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = savedOverflow;
    }
  },
  { immediate: true }
);

// ─── Handlers ─────────────────────────────────────────────────────
function onBackdropTap() {
  if (!props.backdropDismiss) return;
  onDismiss();
}

function onDismiss() {
  emit('dismiss');
  emit('update:modelValue', false);
}

function onConfirm() {
  if (props.confirmDisabled || props.confirmLoading) return;
  emit('confirm');
}

const bodyEl = ref<HTMLElement | null>(null);

function onAfterLeave() {
  // Drag-to-dismiss leaves dragOffset at off-screen so the inline transform
  // can complete the slide. Once the leave transition is done, reset it —
  // otherwise the next open would mount the sheet outside the viewport.
  dragOffset.value = 0;
  void nextTick(() => {
    if (bodyEl.value) bodyEl.value.scrollTop = 0;
  });
}
</script>

<style lang="scss" scoped>
// ─── Backdrop ─────────────────────────────────────────────────────
// Look (dim + blur) is driven inline by `backdropStyle` so it can react to
// the drag offset; the static rules here only cover layering.
.ios-sheet__backdrop {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
}

// ─── Sheet ────────────────────────────────────────────────────────
.ios-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-modal + 1; // ensure above any tab bar / fab
  display: flex;
  flex-direction: column;
  background: $glass-bg;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  // 20px corner radius matches iOS 26's "Liquid Glass" sheet presentation —
  // visibly rounder than the older 14px without crossing into pill territory.
  border-top-left-radius: $radius-4xl;
  border-top-right-radius: $radius-4xl;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.32);
  overflow: hidden;
  max-height: 92vh;

  &--medium {
    height: 56vh;
    max-height: 56vh;
  }

  &--large {
    height: 92vh;
    max-height: 92vh;
  }

  &--seamless {
    pointer-events: auto;
  }
}

// ─── Top region (handle + header) ─────────────────────────────────
.ios-sheet__top {
  flex: 0 0 auto;
  touch-action: none;
}

.ios-sheet__handle {
  width: 36px;
  height: 5px;
  border-radius: 999px;
  background: $separator-strong;
  margin: $space-3 auto $space-2;
}

.ios-sheet__header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: $space-4;
  padding: $space-3 $space-4 $space-4;
  min-height: 44px;
  border-bottom: 0.5px solid $separator;
}

.ios-sheet__title {
  font-size: $font-body-lg;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
  text-align: center;
  letter-spacing: $ls-base;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ios-sheet__action {
  appearance: none;
  background: transparent;
  border: none;
  padding: $space-2 $space-1;
  font-size: $font-body-lg;
  font-weight: 400;
  color: $primary;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: $ls-base;
  min-height: 32px;
  display: inline-flex;
  align-items: center;

  &--leading {
    justify-self: start;
  }

  &--trailing {
    justify-self: end;
  }

  &--strong {
    font-weight: 600;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    opacity: 0.6;
  }
}

// ─── Sticky regions ───────────────────────────────────────────────
.ios-sheet__sticky-top {
  flex: 0 0 auto;
  border-bottom: 0.5px solid $separator;
}

.ios-sheet__body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.ios-sheet__footer {
  flex: 0 0 auto;
  padding: $space-4 $space-4 max($space-4, env(safe-area-inset-bottom, $space-4));
  border-top: 0.5px solid $separator;
  background: $glass-bg;
}

// ─── Backdrop transition ──────────────────────────────────────────
.ios-sheet-backdrop-enter-active {
  transition: opacity 0.22s ease;
}
.ios-sheet-backdrop-leave-active {
  transition: opacity 0.28s ease;
}
.ios-sheet-backdrop-enter-from,
.ios-sheet-backdrop-leave-to {
  opacity: 0;
}

// ─── Slide transition ─────────────────────────────────────────────
.ios-sheet-slide-enter-active {
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
.ios-sheet-slide-leave-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.ios-sheet-slide-enter-from,
.ios-sheet-slide-leave-to {
  transform: translateY(100%);
}
</style>
