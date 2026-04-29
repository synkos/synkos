<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { AppCircularProgress } from '@synkos/ui';

const value = ref(35);
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    value.value = (value.value + 7) % 100;
  }, 700);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

const code = `<script setup lang="ts">
import { ref } from 'vue'
import { AppCircularProgress } from '@synkos/ui'

const uploadPct = ref(35)
<\/script>

<template>
  <AppCircularProgress :value="uploadPct" size="40px" track-color="rgba(255,255,255,0.1)" />
  <AppCircularProgress indeterminate size="40px" />
</template>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="circular-demo">
      <AppCircularProgress :value="value" size="48px" track-color="rgba(255,255,255,0.1)" />
      <AppCircularProgress indeterminate size="48px" />
      <AppCircularProgress
        :value="value"
        size="32px"
        color="positive"
        track-color="rgba(255,255,255,0.1)"
      />
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.circular-demo {
  display: flex;
  align-items: center;
  gap: $space-8;
}
</style>
