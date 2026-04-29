<script setup lang="ts">
import { ref } from 'vue';
import { OtpInput } from '@synkos/client';

const code_ = ref<string[]>(Array(6).fill(''));
const error = ref(false);
const shake = ref(false);

function onComplete() {
  const value = code_.value.join('');
  if (value !== '123456') {
    error.value = true;
    shake.value = true;
  } else {
    error.value = false;
  }
}

function onShakeEnd() {
  shake.value = false;
}

const code = `<script setup lang="ts">
import { ref } from 'vue'
import { OtpInput } from '@synkos/client'

const code = ref<string[]>(Array(6).fill(''))
const error = ref(false)
const shake = ref(false)

function onComplete() {
  if (code.value.join('') !== expected) {
    error.value = true
    shake.value = true
  }
}
<\/script>

<template>
  <OtpInput
    v-model="code"
    :error="error"
    :shake="shake"
    @complete="onComplete"
    @shake-end="shake = false"
  />
</template>`;
</script>

<template>
  <DocsComponentDemo :code="code" caption="Try 123456 to clear the error.">
    <div class="otp-demo">
      <OtpInput
        v-model="code_"
        :error="error"
        :shake="shake"
        @complete="onComplete"
        @shake-end="onShakeEnd"
      />
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
.otp-demo {
  width: 100%;
  max-width: 360px;
  --auth-surface-1: rgba(255, 255, 255, 0.06);
  --auth-surface-2: rgba(255, 255, 255, 0.1);
  --auth-surface-focus: rgba(255, 255, 255, 0.12);
  --auth-text-primary: var(--text-primary);
  --auth-border-strong: rgba(255, 255, 255, 0.16);
  --auth-border-focus: var(--color-primary);
  --auth-sheet-bg: var(--bg-elevated);
  --auth-border: rgba(255, 69, 58, 0.4);
}
</style>
