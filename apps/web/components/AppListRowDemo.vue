<script setup lang="ts">
import { AppListSection, AppListRow } from '@synkos/ui';

const code = `<AppListSection>
  <AppListRow icon="person" label="Profile" hint="alex@synkos.dev" @click="..." />
  <AppListRow icon="bell" label="Notifications" hint="On" @click="..." />
  <AppListRow icon="globe" label="Region" value="Europe" />
  <AppListRow icon="rocket" label="New feature" coming-soon />
  <AppListRow icon="trash" label="Delete account" danger @click="..." />
</AppListSection>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="row-demo">
      <AppListSection>
        <AppListRow icon="person" label="Profile" hint="alex@synkos.dev" />
        <AppListRow icon="bell" label="Notifications" hint="On" />
        <AppListRow icon="globe" label="Region" value="Europe" />
        <AppListRow icon="rocket" label="New feature" coming-soon />
        <AppListRow icon="trash" label="Delete account" danger />
      </AppListSection>
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
.row-demo {
  width: 100%;
  max-width: 360px;
}
</style>
