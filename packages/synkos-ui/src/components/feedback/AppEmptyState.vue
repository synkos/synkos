<template>
  <div class="app-empty-state">
    <div class="empty-icon">
      <q-icon :name="icon" size="48px" color="white" style="opacity: 0.9" />
    </div>
    <h2 class="empty-title">{{ title }}</h2>
    <p v-if="subtitle" class="empty-subtitle">{{ subtitle }}</p>
    <button v-if="action" class="empty-cta" @click="action.onClick">
      <q-icon v-if="action.icon" :name="action.icon" size="18px" />
      {{ action.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface EmptyAction {
  label: string;
  icon?: string;
  onClick: () => void;
}

defineProps<{
  icon: string;
  title: string;
  subtitle?: string;
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
  background: rgba(255, 255, 255, 0.07);
  border: 0.5px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.empty-title {
  font-size: $font-title;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: $ls-tight;
  margin: 0 0 10px;
  line-height: $lh-tight;
}

.empty-subtitle {
  font-size: $font-body;
  color: $text-label;
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
