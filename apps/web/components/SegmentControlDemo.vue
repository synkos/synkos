<script setup lang="ts">
import { ref } from 'vue';
import { SegmentControl } from '@synkos/ui';

const filter = ref('all');

const code = `<script setup lang="ts">
import { ref } from 'vue'
import { SegmentControl } from '@synkos/ui'

const filter = ref('all')
<\/script>

<template>
  <SegmentControl
    v-model="filter"
    :options="[
      { value: 'all', label: 'All' },
      { value: 'unread', label: 'Unread' },
      { value: 'flagged', label: 'Flagged' },
    ]"
  />
</template>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="segment-demo">
      <SegmentControl
        v-model="filter"
        :options="[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread' },
          { value: 'flagged', label: 'Flagged' },
        ]"
      />
      <p class="segment-demo__value">
        Selected: <code>{{ filter }}</code>
      </p>
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.segment-demo {
  width: 100%;
  max-width: 360px;

  &__value {
    margin-top: $space-4;
    font-size: $text-sm;
    color: var(--text-secondary);
    text-align: center;
  }
}
</style>
