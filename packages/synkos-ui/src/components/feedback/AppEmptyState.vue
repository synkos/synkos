<template>
  <div class="app-empty-state">
    <div class="empty-icon">
      <AppIcon :name="icon" size="48px" style="color: white; opacity: 0.9" />
    </div>
    <h2 class="empty-title">{{ title }}</h2>
    <p v-if="subtitle" class="empty-subtitle">{{ subtitle }}</p>
    <button v-if="action" class="empty-cta" @click="action.onClick">
      <AppIcon v-if="action.icon" :name="action.icon" size="18px" />
      {{ action.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * Centered placeholder shown when a list, page or feed has nothing to display.
 * Optionally takes a single primary action that the user can tap to recover
 * (refresh, create the first item, change a filter).
 *
 * @example
 * <AppEmptyState
 *   icon="inbox"
 *   title="Inbox is empty"
 *   subtitle="You're all caught up. New messages will appear here."
 *   :action="{ label: 'Refresh', icon: 'refresh', onClick: refetch }"
 * />
 */
import AppIcon from '../media/AppIcon.vue';

/** Primary action shown as a CTA below the title. */
interface EmptyAction {
  /** Button label. */
  label: string;
  /** Optional leading icon (from the synkos-ui icon registry). */
  icon?: string;
  /** Called when the CTA is pressed. */
  onClick: () => void;
}

defineProps<{
  /** Icon name shown in the rounded square above the title. */
  icon: string;
  /** Bold headline communicating the empty state. */
  title: string;
  /** Optional helper text under the title (line breaks preserved). */
  subtitle?: string;
  /** Optional primary action. Renders a CTA below the subtitle. */
  action?: EmptyAction;
}>();
</script>

<style lang="scss" scoped>
.app-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
  text-align: center;
}

.empty-icon {
  width: 88px;
  height: 88px;
  border-radius: 22px;
  background: var(--surface-1, rgba(255, 255, 255, 0.07));
  border: 0.5px solid var(--surface-1-border, rgba(255, 255, 255, 0.12));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.empty-title {
  font-size: $font-title;
  font-weight: 700;
  color: var(--text-primary, #{$text-primary});
  letter-spacing: $ls-tight;
  margin: 0 0 10px;
  line-height: $lh-tight;
}

.empty-subtitle {
  font-size: $font-body;
  color: var(--text-label, #{$text-label});
  line-height: $lh-relaxed;
  margin: 0 0 32px;
  white-space: pre-line;
}

.empty-cta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: $radius-xl;
  background: #fff;
  color: #000;
  font-size: $font-body;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity $transition-quick;
  -webkit-tap-highlight-color: transparent;

  &:active {
    opacity: 0.85;
  }
}
</style>
