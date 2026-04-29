<script setup lang="ts">
import { ref, computed } from 'vue';
import { PasswordStrengthBar } from '@synkos/client';

const password = ref('');

type Level = 'weak' | 'fair' | 'good' | 'strong';

const evaluation = computed<{ level: Level | null; pct: number }>(() => {
  const v = password.value;
  if (!v) return { level: null, pct: 0 };
  let score = 0;
  if (v.length >= 6) score += 25;
  if (v.length >= 10) score += 20;
  if (/[A-Z]/.test(v)) score += 15;
  if (/[0-9]/.test(v)) score += 15;
  if (/[^A-Za-z0-9]/.test(v)) score += 25;
  const pct = Math.min(100, score);
  const level: Level = pct < 25 ? 'weak' : pct < 55 ? 'fair' : pct < 80 ? 'good' : 'strong';
  return { level, pct };
});

const code = `<script setup lang="ts">
import { ref } from 'vue'
import { PasswordStrengthBar, usePasswordStrength } from '@synkos/client'

const password = ref('')
const strength = usePasswordStrength(password)
<\/script>

<template>
  <input v-model="password" type="password" placeholder="Password" />
  <PasswordStrengthBar :level="strength.level" :pct="strength.pct" />
</template>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="strength-demo">
      <input
        v-model="password"
        type="text"
        placeholder="Type a password"
        class="strength-demo__input"
      />
      <PasswordStrengthBar :level="evaluation.level" :pct="evaluation.pct" />
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.strength-demo {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: $space-3;

  &__input {
    height: 40px;
    padding: 0 $space-3;
    border-radius: $radius-md;
    border: 1px solid var(--border-default);
    background: var(--bg-canvas);
    color: var(--text-primary);
    font-size: $text-sm;
    outline: none;

    &:focus {
      border-color: var(--color-primary);
    }
  }
}
</style>
