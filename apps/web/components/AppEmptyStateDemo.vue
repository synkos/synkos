<script setup lang="ts">
import { AppEmptyState } from '@synkos/ui';

const code = `<script setup lang="ts">
import { AppEmptyState } from '@synkos/ui'

function refresh() { /* refetch */ }
<\/script>

<template>
  <AppEmptyState
    icon="inbox"
    title="Inbox is empty"
    subtitle="You're all caught up.\\nNew messages will appear here."
    :action="{ label: 'Refresh', icon: 'refresh', onClick: refresh }"
  />
</template>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="empty-demo">
      <AppEmptyState
        icon="inbox"
        title="Inbox is empty"
        :subtitle="`You're all caught up.\nNew messages will appear here.`"
        :action="{ label: 'Refresh', icon: 'refresh', onClick: () => {} }"
      />
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
.empty-demo {
  width: 100%;
  max-width: 380px;
  padding: 24px 0;
}
</style>
