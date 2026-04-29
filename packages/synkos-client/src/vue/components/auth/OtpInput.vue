<template>
  <div
    class="otp-row"
    :class="{ 'otp-row--error': error, 'otp-row--shake': shake }"
    @animationend="emit('shakeEnd')"
  >
    <input
      v-for="(_, i) in length"
      :key="i"
      :ref="(el) => setRef(el, i)"
      :value="modelValue[i] ?? ''"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      autocomplete="one-time-code"
      class="otp-cell"
      :class="{ 'otp-cell--filled': (modelValue[i] ?? '') !== '' }"
      @keydown="(e) => onKeydown(e, i)"
      @input="(e) => onInput(e, i)"
      @paste="(e) => onPaste(e)"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 6-digit (configurable) OTP input. Auto-advances on type, supports paste of
 * the whole code, accepts only digits, and emits `complete` when every cell
 * is filled. Toggle the `shake` prop to play an error animation.
 *
 * The `modelValue` is an array of single-digit strings — one per cell —
 * for easy two-way binding with reactive cells.
 *
 * @example
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { OtpInput } from '@synkos/client'
 *
 * const code = ref<string[]>(Array(6).fill(''))
 * const error = ref(false)
 * const shake = ref(false)
 *
 * function onComplete() {
 *   // submit code.value.join('')
 * }
 * <\/script>
 *
 * <template>
 *   <OtpInput v-model="code" :error="error" :shake="shake" @complete="onComplete" />
 * </template>
 */
import { nextTick } from 'vue';

interface Props {
  /** Array of digit strings. Length matches `length`. */
  modelValue: string[];
  /** Number of digit cells. Defaults to 6. */
  length?: number;
  /** Apply the error styling (red border, error background). */
  error?: boolean;
  /** Trigger the shake animation once. Set back to false in `shakeEnd`. */
  shake?: boolean;
}

const props = withDefaults(defineProps<Props>(), { length: 6 });

const emit = defineEmits<{
  /** Fired on every change. The new array is passed. */
  'update:modelValue': [value: string[]];
  /** Fired when the user has filled every cell. */
  complete: [];
  /** Fired when the shake animation ends (use to reset the `shake` prop). */
  shakeEnd: [];
}>();

const cellRefs: HTMLInputElement[] = [];

function setRef(el: unknown, i: number) {
  if (el) cellRefs[i] = el as HTMLInputElement;
}

function update(digits: string[]) {
  emit('update:modelValue', [...digits]);
}

function onKeydown(e: KeyboardEvent, i: number) {
  const digits = [...props.modelValue];

  if (/^[0-9]$/.test(e.key)) {
    (e.target as HTMLInputElement).value = '';
    return;
  }

  if (e.key === 'Backspace') {
    e.preventDefault();
    if (digits[i] !== '') {
      digits[i] = '';
      update(digits);
    } else if (i > 0) {
      digits[i - 1] = '';
      update(digits);
      cellRefs[i - 1]?.focus();
    }
  } else if (e.key === 'ArrowLeft' && i > 0) {
    e.preventDefault();
    cellRefs[i - 1]?.focus();
  } else if (e.key === 'ArrowRight' && i < props.length - 1) {
    e.preventDefault();
    cellRefs[i + 1]?.focus();
  }
}

function onInput(e: Event, i: number) {
  const input = e.target as HTMLInputElement;
  const raw = input.value.replace(/[^0-9]/g, '');
  const digits = [...props.modelValue];

  if (raw.length > 1) {
    const chars = raw.slice(0, props.length).split('');
    chars.forEach((ch, idx) => {
      if (idx < props.length) digits[idx] = ch;
    });
    update(digits);
    void nextTick(() => {
      const nextEmpty = digits.findIndex((d) => d === '');
      cellRefs[nextEmpty === -1 ? props.length - 1 : nextEmpty]?.focus();
      if (nextEmpty === -1) emit('complete');
    });
    return;
  }

  const val = raw.slice(-1);
  digits[i] = val;
  input.value = val;
  update(digits);

  if (val && i < props.length - 1) {
    void nextTick(() => cellRefs[i + 1]?.focus());
  } else if (val && i === props.length - 1 && digits.every((d) => d !== '')) {
    emit('complete');
  }
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault();
  const nums = (e.clipboardData?.getData('text') ?? '')
    .replace(/[^0-9]/g, '')
    .slice(0, props.length)
    .split('');
  const digits = [...props.modelValue];
  nums.forEach((n, idx) => {
    if (idx < props.length) digits[idx] = n;
  });
  update(digits);
  void nextTick(() => {
    const nextEmpty = digits.findIndex((d) => d === '');
    cellRefs[nextEmpty === -1 ? props.length - 1 : nextEmpty]?.focus();
    if (nextEmpty === -1) emit('complete');
  });
}

function focus(i = 0) {
  cellRefs[i]?.focus();
}

defineExpose({ focus });
</script>

<style lang="scss" scoped>
@keyframes otp-shake {
  0% {
    transform: translateX(0);
  }
  15% {
    transform: translateX(-6px);
  }
  30% {
    transform: translateX(5px);
  }
  45% {
    transform: translateX(-4px);
  }
  60% {
    transform: translateX(3px);
  }
  75% {
    transform: translateX(-2px);
  }
  90% {
    transform: translateX(1px);
  }
  100% {
    transform: translateX(0);
  }
}

.otp-row {
  display: flex;
  gap: $space-2;
  justify-content: center;

  &--shake {
    animation: otp-shake 0.45s ease;
  }
}

.otp-cell {
  flex: 1;
  min-width: 0;
  max-width: 52px;
  height: 56px;
  border-radius: $radius-lg;
  background: var(--auth-surface-1);
  border: 0.5px solid transparent;
  color: var(--auth-text-primary);
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  caret-color: transparent;
  outline: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
  -webkit-tap-highlight-color: transparent;

  &--filled {
    border-color: var(--auth-border-strong);
    background: var(--auth-surface-2);
  }

  &:focus {
    border-color: var(--auth-border-focus);
    background: var(--auth-surface-focus);
    caret-color: var(--auth-text-primary);
  }

  &:-webkit-autofill {
    -webkit-text-fill-color: var(--auth-text-primary);
    -webkit-box-shadow: 0 0 0 100px var(--auth-sheet-bg) inset;
  }
}

.otp-row--error .otp-cell {
  border-color: var(--auth-border);
  background: var(--auth-surface-1);
}
</style>
