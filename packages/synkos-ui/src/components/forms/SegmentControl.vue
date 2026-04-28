<template>
  <div class="segment-control">
    <button
      v-for="option in options"
      :key="option.value"
      class="segment-btn"
      :class="{ 'segment-btn--active': modelValue === option.value }"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: { value: string; label: string }[];
  modelValue: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<style lang="scss" scoped>
.segment-control {
  display: flex;
  background: var(--separator, #{$separator});
  border-radius: 9px;
  padding: $space-1;
  gap: $space-1;
  width: 100%;
}

.segment-btn {
  flex: 1;
  height: 32px;
  border: none;
  border-radius: 7px;
  background: transparent;
  font-size: $font-body-sm;
  font-weight: 500;
  color: var(--text-disabled, #{$text-disabled});
  cursor: pointer;
  transition:
    background $transition-quick,
    color $transition-quick;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: $ls-normal;

  &--active {
    background: var(--surface-1, rgba(255, 255, 255, 0.13));
    color: var(--text-primary, #{$text-primary});
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  }

  &:active:not(.segment-btn--active) {
    background: var(--surface-press, #{$surface-press});
  }
}
</style>
