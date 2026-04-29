<script setup lang="ts">
import { AppSpinner } from '@synkos/ui';

const code = `<AppSpinner />                                  <!-- default 24px white -->
<AppSpinner size="32px" color="primary" />
<AppSpinner size="40px" color="positive" />
<AppSpinner size="20px" color="negative" />`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="spinner-demo">
      <AppSpinner />
      <AppSpinner size="32px" color="primary" />
      <AppSpinner size="40px" color="positive" />
      <AppSpinner size="20px" color="negative" />
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.spinner-demo {
  display: flex;
  align-items: center;
  gap: $space-6;
}
</style>
