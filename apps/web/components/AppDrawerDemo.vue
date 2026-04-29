<script setup lang="ts">
import { AppButton, AppDrawer, useDrawer } from '@synkos/ui';

const menu = useDrawer();

const code = `<script setup lang="ts">
import { AppButton, AppDrawer, useDrawer } from '@synkos/ui'

const menu = useDrawer()
<\/script>

<template>
  <AppButton variant="ghost" @click="menu.open">Open menu</AppButton>

  <AppDrawer v-bind="menu.bindings">
    <nav class="my-drawer"> ... </nav>
  </AppDrawer>
</template>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="drawer-demo">
      <AppButton variant="primary" @click="menu.open">Open menu</AppButton>
    </div>
    <ClientOnly>
      <AppDrawer v-bind="menu.bindings">
        <nav class="drawer-demo__panel">
          <h3 class="drawer-demo__title">Menu</h3>
          <a class="drawer-demo__link">Account</a>
          <a class="drawer-demo__link">Settings</a>
          <a class="drawer-demo__link">Help</a>
          <AppButton variant="ghost" @click="menu.close">Close</AppButton>
        </nav>
      </AppDrawer>
    </ClientOnly>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.drawer-demo {
  width: 100%;
  max-width: 240px;

  &__panel {
    width: min(320px, 86vw);
    height: 100%;
    background: var(--bg-elevated);
    color: var(--text-primary);
    padding: $space-8 $space-6;
    display: flex;
    flex-direction: column;
    gap: $space-3;
    border-inline-start: 1px solid var(--border-subtle);
  }

  &__title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    margin: 0 0 $space-3;
  }

  &__link {
    padding: $space-3 0;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-subtle);
  }
}
</style>
