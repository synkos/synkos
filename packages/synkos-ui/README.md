# @synkos/ui

iOS-styled Vue 3 component library for Synkos apps.

## Install

```bash
pnpm add @synkos/ui
```

Peer dependencies: `vue@^3`, `quasar@^2`

### Import the CSS

```ts
// src/boot/synkos-ui.ts (Quasar boot file)
import '@synkos/ui/styles';
```

### Allow Vite to process the package

Add to `quasar.config.ts`:

```ts
build: {
  viteVuePluginOptions: {
    // @synkos/ui ships compiled JS — no extra config needed
  },
}
```

## Components

### `AppEmptyState`

Empty state with icon, title, optional subtitle, and optional CTA button.

```vue
<AppEmptyState
  icon="inbox"
  title="Nothing here yet"
  subtitle="Create your first item to get started."
  :action="{ label: 'Create', icon: 'add', onClick: handleCreate }"
/>
```

### `AppListSection` + `AppListRow` + `AppListDivider`

iOS-style grouped list.

```vue
<AppListSection title="Account">
  <AppListRow
    icon="person"
    icon-bg="#0A84FF"
    icon-color="#fff"
    label="Edit Profile"
    @click="router.push({ name: 'edit-profile' })"
  />
  <AppListDivider :indent="60" />
  <AppListRow
    icon="lock"
    icon-bg="#30D158"
    icon-color="#fff"
    label="Change Password"
    @click="router.push({ name: 'change-password' })"
  />
</AppListSection>
```

`AppListRow` props:

| Prop              | Type      | Description                                    |
| ----------------- | --------- | ---------------------------------------------- |
| `label`           | `string`  | Row label (required)                           |
| `icon`            | `string`  | Material icon name                             |
| `iconBg`          | `string`  | Icon background color                          |
| `iconColor`       | `string`  | Icon color                                     |
| `hint`            | `string`  | Secondary text below label                     |
| `value`           | `string`  | Static value (renders as div, no chevron)      |
| `danger`          | `boolean` | Red label                                      |
| `disabled`        | `boolean` | Disabled state                                 |
| `comingSoon`      | `boolean` | Shows "Coming soon" badge                      |
| `comingSoonLabel` | `string`  | Override badge text (default: `'Coming soon'`) |

### `AppPageLargeTitle`

iOS large-title page header with optional right slot.

```vue
<AppPageLargeTitle title="Settings" subtitle="Manage your account">
  <template #right>
    <AppButton icon="edit" @click="handleEdit" />
  </template>
</AppPageLargeTitle>
```

### `SegmentControl`

iOS-style segmented control, v-model compatible.

```vue
<SegmentControl
  v-model="activeTab"
  :options="[
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'done', label: 'Done' },
  ]"
/>
```

## Composables

### `useSheetDrag`

Rubber-band drag behaviour for bottom sheets (iOS-like, no external dependencies).

```vue
<script setup lang="ts">
import { useSheetDrag } from '@synkos/ui';

const { sheetDragStyle, onDragStart, onDragMove, onDragEnd } = useSheetDrag();
</script>

<template>
  <div
    :style="sheetDragStyle"
    @touchstart="onDragStart"
    @touchmove="onDragMove"
    @touchend="onDragEnd"
  >
    <slot />
  </div>
</template>
```

## Design tokens

The package ships the full SCSS variable system used by the components. Import in your `quasar.variables.scss` to use the same tokens:

```scss
// src/css/quasar.variables.scss
@use '@synkos/ui/variables.scss' as *;

// Override any token:
$primary: #ff6b00;
```
