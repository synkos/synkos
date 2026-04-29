<script setup lang="ts">
import { ref } from 'vue';
import { AppButton } from '@synkos/ui';

const loading = ref(false);
async function simulate() {
  loading.value = true;
  await new Promise((r) => setTimeout(r, 1500));
  loading.value = false;
}

const code = `<script setup lang="ts">
import { ref } from 'vue'
import { AppButton } from '@synkos/ui'

const loading = ref(false)
async function save() {
  loading.value = true
  await api.save()
  loading.value = false
}
<\/script>

<template>
  <AppButton variant="primary" :loading="loading" @click="save">
    Continue
  </AppButton>
  <AppButton variant="ghost">Cancel</AppButton>
  <AppButton variant="link">Skip</AppButton>
  <AppButton variant="primary" disabled>Disabled</AppButton>
</template>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="appbutton-demo">
      <AppButton variant="primary" :loading="loading" @click="simulate"> Continue </AppButton>
      <AppButton variant="ghost">Cancel</AppButton>
      <AppButton variant="link">Skip</AppButton>
      <AppButton variant="primary" disabled>Disabled</AppButton>
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.appbutton-demo {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  width: 100%;
  max-width: 320px;
}
</style>
