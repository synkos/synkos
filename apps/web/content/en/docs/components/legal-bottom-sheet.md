---
title: LegalBottomSheet
description: "Pre-built bottom sheet that renders the framework's terms or privacy text\n(configured via `defineAppConfig({ links: { terms, privacy } })`). Includes\ndrag-to-dismiss and an iOS-style close button. Use it from auth pages to\nsurface the legal documents without authoring a sheet."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/client`

Pre-built bottom sheet that renders the framework's terms or privacy text
(configured via `defineAppConfig({ links: { terms, privacy } })`). Includes
drag-to-dismiss and an iOS-style close button. Use it from auth pages to
surface the legal documents without authoring a sheet.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LegalBottomSheet } from '@synkos/client'

const showTerms = ref(false)
<\/script>

<template>
  <button @click="showTerms = true">Read terms</button>
  <LegalBottomSheet v-model:show="showTerms" type="terms" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `show` _(required)_ | `boolean` | — | Sheet visibility. Use `v-model:show`. |
| `type` _(required)_ | `"terms" \| "privacy"` | — | Which document to render. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `update:show` | `boolean` | Emitted when the user dismisses the sheet (drag, Escape, close button). |
