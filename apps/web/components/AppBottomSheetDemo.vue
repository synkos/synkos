<script setup lang="ts">
import { AppButton, AppBottomSheet, useBottomSheet } from '@synkos/ui';

const sheet = useBottomSheet();

const code = `<script setup lang="ts">
import { AppButton, AppBottomSheet, useBottomSheet } from '@synkos/ui'

const sheet = useBottomSheet()
<\/script>

<template>
  <AppButton @click="sheet.open">Open sheet</AppButton>

  <AppBottomSheet v-bind="sheet.bindings">
    <div class="my-sheet">
      <h3>Hi from a bottom sheet</h3>
      <AppButton variant="ghost" @click="sheet.close">Close</AppButton>
    </div>
  </AppBottomSheet>
</template>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="bs-demo">
      <AppButton variant="primary" @click="sheet.open">Open sheet</AppButton>
    </div>
    <ClientOnly>
      <AppBottomSheet v-bind="sheet.bindings">
        <div class="bs-demo__sheet">
          <div class="bs-demo__handle" />
          <h3 class="bs-demo__title">Hi from a bottom sheet</h3>
          <p class="bs-demo__desc">
            Tap outside or press Escape to dismiss. Pair this with
            <code>useBottomSheet()</code> for the cleanest API.
          </p>
          <AppButton variant="ghost" @click="sheet.close">Close</AppButton>
        </div>
      </AppBottomSheet>
    </ClientOnly>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.bs-demo {
  width: 100%;
  max-width: 240px;

  &__sheet {
    background: var(--bg-elevated);
    color: var(--text-primary);
    border-top-left-radius: $radius-2xl;
    border-top-right-radius: $radius-2xl;
    padding: $space-5 $space-6 $space-8;
    display: flex;
    flex-direction: column;
    gap: $space-4;
    max-width: 440px;
    margin: 0 auto;
  }

  &__handle {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: var(--border-strong);
    margin: 0 auto $space-2;
  }

  &__title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    margin: 0;
  }

  &__desc {
    font-size: $text-sm;
    color: var(--text-secondary);
    line-height: $leading-snug;
    margin: 0;
  }
}
</style>
