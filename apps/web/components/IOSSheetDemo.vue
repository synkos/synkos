<script setup lang="ts">
import { ref } from 'vue';
import { AppButton, IOSSheet, useBottomSheet } from '@synkos/ui';

const sheet = useBottomSheet();
const query = ref('');
const selected = ref<string[]>([]);

const repos = ['acme/web', 'acme/api', 'acme/docs', 'alex/dotfiles', 'alex/synkos'];

function toggle(repo: string) {
  const i = selected.value.indexOf(repo);
  if (i === -1) selected.value.push(repo);
  else selected.value.splice(i, 1);
}

function onConfirm() {
  sheet.close();
  selected.value = [];
}

const code = `<script setup lang="ts">
import { IOSSheet, useBottomSheet } from '@synkos/ui'
const sheet = useBottomSheet()
const selected = ref<string[]>([])
<\/script>

<template>
  <IOSSheet
    v-bind="sheet.bindings"
    title="Import repos"
    dismiss-label="Cancel"
    :confirm-label="\`Import (\${selected.length})\`"
    :confirm-disabled="!selected.length"
    @confirm="doImport"
  >
    <template #belowHeader>
      <input v-model="q" placeholder="Search…" />
    </template>
    <ul> ... </ul>
  </IOSSheet>
</template>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <div class="ios-demo">
      <AppButton variant="primary" @click="sheet.open">Open IOSSheet</AppButton>
    </div>
    <ClientOnly>
      <IOSSheet
        v-bind="sheet.bindings"
        title="Import repos"
        dismiss-label="Cancel"
        :confirm-label="`Import (${selected.length})`"
        :confirm-disabled="!selected.length"
        @confirm="onConfirm"
      >
        <template #belowHeader>
          <div class="ios-demo__search">
            <input v-model="query" placeholder="Search…" class="ios-demo__input" />
          </div>
        </template>

        <ul class="ios-demo__list">
          <li
            v-for="r in repos.filter((x) => x.includes(query))"
            :key="r"
            class="ios-demo__row"
            :class="{ 'ios-demo__row--selected': selected.includes(r) }"
            @click="toggle(r)"
          >
            <span>{{ r }}</span>
            <span class="ios-demo__check">{{ selected.includes(r) ? '●' : '○' }}</span>
          </li>
        </ul>
      </IOSSheet>
    </ClientOnly>
  </DocsComponentDemo>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.ios-demo {
  width: 100%;
  max-width: 240px;
}

.ios-demo__search {
  padding: $space-3 $space-4;
}

.ios-demo__input {
  width: 100%;
  padding: $space-3 $space-4;
  border-radius: $radius-md;
  background: rgba(118, 118, 128, 0.24);
  border: none;
  color: var(--text-primary);
  font-size: $text-base;
  outline: none;
}

.ios-demo__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ios-demo__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-4 $space-5;
  border-bottom: 0.5px solid var(--separator);
  cursor: pointer;
  color: var(--text-primary);

  &--selected {
    background: rgba(10, 132, 255, 0.08);
  }
}

.ios-demo__check {
  color: var(--color-primary);
  font-size: 20px;
}
</style>
