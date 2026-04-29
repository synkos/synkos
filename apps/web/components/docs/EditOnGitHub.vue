<script setup lang="ts">
const props = defineProps<{
  path: string;
}>();

const { t, locale } = useI18n();
const config = useRuntimeConfig();

const editUrl = computed(
  () => `${config.public.githubRepo}/edit/main/apps/web/content/${locale.value}/${props.path}`
);
</script>

<template>
  <a :href="editUrl" target="_blank" rel="noopener" class="edit-on-github">
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
    {{ t('docs.editOnGitHub') }}
  </a>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.edit-on-github {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-3;
  border-radius: $radius-sm;
  font-size: $text-sm;
  color: var(--text-secondary);

  &:hover {
    color: var(--text-primary);
    background: var(--bg-elevated);
  }
}
</style>
