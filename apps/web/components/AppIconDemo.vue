<script setup lang="ts">
import { AppIcon } from '@synkos/ui';

const icons = [
  'home',
  'person',
  'bell',
  'lock',
  'globe',
  'chevron_right',
  'check_circle_outline',
  'error_outline',
  'visibility',
  'menu',
];

const code = `<AppIcon name="home" />
<AppIcon name="bell" size="32px" />
<AppIcon name="check_circle_outline" style="color: var(--color-success)" />
<AppIcon name="error_outline" style="color: var(--color-danger)" />`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="icon-demo">
      <span v-for="name in icons" :key="name" class="icon-demo__cell">
        <AppIcon :name="name" size="24px" />
        <code>{{ name }}</code>
      </span>
    </div>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.icon-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: $space-3 $space-4;
  width: 100%;
  max-width: 480px;
  color: var(--text-primary);

  &__cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-2;
    padding: $space-3 $space-2;
    border: 1px solid var(--border-subtle);
    border-radius: $radius-md;
    background: var(--bg-canvas);

    code {
      font-size: $text-xs;
      color: var(--text-secondary);
      background: none;
      border: none;
      padding: 0;
    }
  }
}
</style>
