<template>
  <div class="auth-field-row" :class="{ 'auth-field-row--error': error }">
    <slot name="prefix" />
    <input
      ref="inputRef"
      v-bind="inputAttrs"
      :value="modelValue"
      :type="isPassword ? (showPasswordInternal ? 'text' : 'password') : type"
      class="auth-field-input"
      @input="onInput"
    />
    <button
      v-if="isPassword"
      type="button"
      class="auth-field-eye"
      tabindex="-1"
      @click="togglePassword"
    >
      <AppIcon :name="showPasswordInternal ? 'visibility_off' : 'visibility'" size="18px" />
    </button>
    <slot name="suffix" />
  </div>
</template>

<script setup lang="ts">
/**
 * A single input row for the auth screens. Designed to be placed inside
 * `AuthFieldGroup`. When `type="password"` it renders a built-in eye toggle
 * for visibility. Forwards unknown attributes (autocomplete, inputmode,
 * placeholder...) to the underlying `<input>`.
 *
 * @example
 * <AuthFieldGroup>
 *   <AuthFieldRow
 *     v-model="email"
 *     type="email"
 *     autocomplete="email"
 *     placeholder="Email"
 *     :error="!!errors.email"
 *   />
 *   <AuthFieldRow v-model="password" type="password" placeholder="Password" />
 * </AuthFieldGroup>
 */
import { ref, computed, useAttrs } from 'vue';
import { AppIcon } from '@synkos/ui';

defineOptions({ inheritAttrs: false });

interface Props {
  /** Bound value. Use `v-model`. */
  modelValue?: string;
  /** HTML `type` attribute. `password` enables the visibility toggle. */
  type?: string;
  /** Apply error styling to the row. */
  error?: boolean;
  /** Force the password to be visible (overrides the internal toggle). */
  showPassword?: boolean;
}

const props = withDefaults(defineProps<Props>(), { type: 'text' });

const emit = defineEmits<{
  /** Emitted on input. */
  'update:modelValue': [value: string];
  /** Emitted when the user toggles password visibility. */
  'update:showPassword': [value: boolean];
  /** Re-emitted native `input` event. */
  input: [event: Event];
}>();

defineSlots<{
  /** Slot rendered before the `<input>` (icon, country flag, currency, ...). */
  prefix: () => unknown;
  /** Slot rendered after the `<input>` (clear button, status icon, ...). */
  suffix: () => unknown;
}>();

const attrs = useAttrs();

const isPassword = computed(() => props.type === 'password');

const showPasswordInternal = ref(props.showPassword ?? false);

function togglePassword() {
  showPasswordInternal.value = !showPasswordInternal.value;
  emit('update:showPassword', showPasswordInternal.value);
}

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
  emit('input', e);
}

const inputAttrs = computed(() => {
  const { class: _, style: __, ...rest } = attrs as Record<string, unknown>;
  return rest;
});

const inputRef = ref<HTMLInputElement | null>(null);
function focus() {
  inputRef.value?.focus();
}
defineExpose({ focus });
</script>

<style lang="scss" scoped>
.auth-field-row {
  display: flex;
  align-items: center;
  min-height: 50px;
  background: transparent;
  transition: background 0.15s;

  &--error {
    background: rgba(255, 69, 58, 0.06);
  }
}

.auth-field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 14px 16px;
  font-size: $font-body-lg;
  color: var(--auth-text-primary);
  letter-spacing: -0.2px;
  caret-color: var(--color-primary);
  width: 100%;
  font-family: inherit;

  &::placeholder {
    color: var(--auth-text-subtle);
  }

  &:-webkit-autofill {
    -webkit-text-fill-color: var(--auth-text-primary);
    -webkit-box-shadow: 0 0 0 100px var(--auth-sheet-bg) inset;
    caret-color: var(--color-primary);
  }
}

.auth-field-eye {
  background: none;
  border: none;
  padding: 14px 16px 14px 0;
  color: var(--auth-text-subtle);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
</style>
