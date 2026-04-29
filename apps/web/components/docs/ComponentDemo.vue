<script setup lang="ts">
defineProps<{
  /** Source code shown below the live preview. */
  code: string;
  /** Optional caption above the preview. */
  caption?: string;
}>();

const copied = ref(false);
const codeRef = ref<HTMLElement | null>(null);

async function copy(value: string) {
  if (!import.meta.client) return;
  await navigator.clipboard.writeText(value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1600);
}
</script>

<template>
  <figure class="demo">
    <p v-if="caption" class="demo__caption">{{ caption }}</p>

    <div class="demo__preview">
      <slot />
    </div>

    <div class="demo__code">
      <button
        type="button"
        class="demo__copy"
        :data-copied="copied"
        :aria-label="$t('docs.copyCode')"
        @click="copy(code)"
      >
        <svg
          v-if="!copied"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
      <pre ref="codeRef"><code>{{ code }}</code></pre>
    </div>
  </figure>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.demo {
  margin: $space-6 0;
  border: 1px solid var(--border-default);
  border-radius: $radius-lg;
  overflow: hidden;
  background: var(--bg-elevated);

  &__caption {
    padding: $space-3 $space-4;
    border-bottom: 1px solid var(--border-subtle);
    font-size: $text-sm;
    color: var(--text-secondary);
  }

  &__preview {
    padding: $space-8 $space-6;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: $space-3;
    background: repeating-linear-gradient(
      45deg,
      var(--bg-elevated),
      var(--bg-elevated) 12px,
      var(--bg-canvas) 12px,
      var(--bg-canvas) 24px
    );
    background-size: 34px 34px;
    background-color: var(--bg-elevated);

    /* Gives demos breathing room without forcing a min-height that traps content */
    min-height: 120px;
    align-items: center;
    justify-content: center;

    /* When demos contain wide content (forms etc.) ensure they grow naturally */
    > * {
      max-width: 100%;
    }
  }

  &__code {
    position: relative;
    background: var(--bg-code);
    border-top: 1px solid var(--border-subtle);

    pre {
      margin: 0;
      padding: $space-4 $space-5;
      background: transparent;
      border: none;
      border-radius: 0;
      overflow-x: auto;
      font-size: $text-sm;
      line-height: $leading-snug;
      color: var(--text-primary);
    }

    code {
      background: none;
      border: none;
      padding: 0;
      font-family: 'JetBrains Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace;
    }
  }

  &__copy {
    position: absolute;
    top: $space-3;
    right: $space-3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $radius-sm;
    color: var(--text-tertiary);
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    transition: all $duration-fast $ease-out;

    &:hover {
      color: var(--text-primary);
      border-color: var(--border-default);
    }

    &[data-copied='true'] {
      color: var(--color-success);
      border-color: var(--color-success);
    }
  }
}
</style>
