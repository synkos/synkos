<script setup lang="ts">
import { AppListSection, AppListRow, AppListDivider } from '@synkos/ui';

const code = `<AppListSection>
  <AppListRow icon="person" label="Profile" />
  <AppListDivider />              <!-- default indent past the icon -->
  <AppListRow icon="bell" label="Notifications" />
  <AppListDivider :indent="0" />  <!-- full-width divider -->
  <AppListRow label="Build version" value="v1.2.3" />
</AppListSection>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="divider-demo">
      <AppListSection>
        <AppListRow icon="person" label="Profile" />
        <AppListDivider />
        <AppListRow icon="bell" label="Notifications" />
        <AppListDivider :indent="0" />
        <AppListRow label="Build version" value="v1.2.3" />
      </AppListSection>
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
.divider-demo {
  width: 100%;
  max-width: 360px;
}
</style>
