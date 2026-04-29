<script setup lang="ts">
import { AppListSection, AppListRow, AppListDivider } from '@synkos/ui';

function open(_section: string) {
  /* navigate */
}

const code = `<script setup lang="ts">
import { AppListSection, AppListRow, AppListDivider } from '@synkos/ui'
<\/script>

<template>
  <AppListSection title="Account">
    <AppListRow icon="person" label="Profile" @click="open('profile')" />
    <AppListDivider />
    <AppListRow icon="lock" label="Password" @click="open('password')" />
    <AppListDivider />
    <AppListRow icon="trash" label="Delete account" danger @click="confirmDelete" />
  </AppListSection>
</template>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="list-demo">
      <AppListSection title="Account">
        <AppListRow icon="person" label="Profile" @click="open('profile')" />
        <AppListDivider />
        <AppListRow icon="lock" label="Password" @click="open('password')" />
        <AppListDivider />
        <AppListRow icon="trash" label="Delete account" danger @click="open('delete')" />
      </AppListSection>
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
.list-demo {
  width: 100%;
  max-width: 360px;
}
</style>
