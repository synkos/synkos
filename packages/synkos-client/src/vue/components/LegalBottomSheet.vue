<template>
  <AppBottomSheet :model-value="show" @update:model-value="$emit('update:show', $event)">
    <div ref="sheetRef" class="legal-sheet" :style="sheetStyle">
      <!-- Drag zone: handle + header — touch listeners live here -->
      <div
        class="drag-zone"
        @touchstart="onDragStart"
        @touchmove.prevent="onDragMove"
        @touchend="onDragEnd"
      >
        <!-- Drag handle -->
        <div class="drag-handle" />

        <!-- Header -->
        <div class="legal-header">
          <div class="legal-header-text">
            <h2 class="legal-title">{{ doc.title }}</h2>
            <p class="legal-updated">{{ t('legal.lastUpdated') }} {{ doc.lastUpdated }}</p>
          </div>
          <button class="legal-close-btn" @click="$emit('update:show', false)">
            {{ t('legal.close') }}
          </button>
        </div>
      </div>

      <!-- Separator -->
      <div class="legal-separator" />

      <!-- Scrollable content -->
      <div class="legal-body">
        <p class="legal-intro">{{ doc.intro }}</p>

        <div v-for="(section, i) in doc.sections" :key="i" class="legal-section">
          <h3 class="legal-section-title">{{ section.title }}</h3>
          <p v-for="(para, j) in section.paragraphs" :key="j" class="legal-para">
            {{ para }}
          </p>
        </div>

        <!-- Bottom safe area spacer -->
        <div class="legal-footer-spacer" />
      </div>
    </div>
  </AppBottomSheet>
</template>

<script setup lang="ts">
/**
 * Pre-built bottom sheet that renders the framework's terms or privacy text
 * (configured via `defineAppConfig({ links: { terms, privacy } })`). Includes
 * drag-to-dismiss and an iOS-style close button. Use it from auth pages to
 * surface the legal documents without authoring a sheet.
 *
 * @example
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { LegalBottomSheet } from '@synkos/client'
 *
 * const showTerms = ref(false)
 * <\/script>
 *
 * <template>
 *   <button @click="showTerms = true">Read terms</button>
 *   <LegalBottomSheet v-model:show="showTerms" type="terms" />
 * </template>
 */
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getLegalContent } from '../../legal/legalContent.js';
import { AppBottomSheet } from '@synkos/ui';

const props = defineProps<{
  /** Sheet visibility. Use `v-model:show`. */
  show: boolean;
  /** Which document to render. */
  type: 'terms' | 'privacy';
}>();

const emit = defineEmits<{
  /** Emitted when the user dismisses the sheet (drag, Escape, close button). */
  'update:show': [value: boolean];
}>();

const { t, locale } = useI18n();

const doc = computed(() => {
  const content = getLegalContent(locale.value);
  return props.type === 'terms' ? content.terms : content.privacy;
});

// ── Drag to dismiss ───────────────────────────────────────────────────────────

const sheetRef = ref<HTMLElement | null>(null);
const dragDeltaY = ref(0);
const isDragging = ref(false);
let dragStartY = 0;

const DISMISS_THRESHOLD = 0.42; // dismiss if dragged past 42% of sheet height

const sheetStyle = computed(() => {
  if (dragDeltaY.value <= 0) return {};
  return {
    transform: `translateY(${dragDeltaY.value}px)`,
    transition: isDragging.value ? 'none' : 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
  };
});

function onDragStart(e: TouchEvent) {
  isDragging.value = true;
  dragStartY = e.touches[0]!.clientY;
  dragDeltaY.value = 0;
}

function onDragMove(e: TouchEvent) {
  if (!isDragging.value) return;
  const delta = e.touches[0]!.clientY - dragStartY;
  dragDeltaY.value = delta > 0 ? delta : 0;
}

function onDragEnd() {
  if (!isDragging.value) return;
  isDragging.value = false;

  const sheetHeight = sheetRef.value?.offsetHeight ?? 500;
  if (dragDeltaY.value > sheetHeight * DISMISS_THRESHOLD) {
    dragDeltaY.value = 0;
    emit('update:show', false);
  } else {
    // Spring back
    dragDeltaY.value = 0;
  }
}
</script>

<style lang="scss" scoped>
.legal-sheet {
  background: $glass-bg;
  backdrop-filter: $glass-blur-heavy;
  -webkit-backdrop-filter: $glass-blur-heavy;
  border-radius: $radius-4xl $radius-4xl 0 0;
  display: flex;
  flex-direction: column;
  max-height: 92dvh;
  will-change: transform;
}

// ── Drag zone (handle + header, gesture area) ─────────────────────────────────
.drag-zone {
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
}

// ── Drag handle ───────────────────────────────────────────────────────────────
.drag-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.22);
  margin: $space-5 auto 0;
}

// ── Header ────────────────────────────────────────────────────────────────────
.legal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: $space-7 $space-10 $space-7;
  gap: $space-6;
}

.legal-header-text {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.legal-title {
  font-size: $font-body-lg;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: $ls-tight;
  margin: 0;
}

.legal-updated {
  font-size: $font-caption;
  color: var(--text-tertiary);
  margin: 0;
  letter-spacing: $ls-normal;
}

.legal-close-btn {
  font-size: $font-body;
  font-weight: 600;
  color: var(--color-primary);
  background: none;
  border: none;
  padding: $space-1 0;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;

  &:active {
    opacity: 0.6;
  }
}

// ── Header separator ──────────────────────────────────────────────────────────
.legal-separator {
  height: 1px;
  background: $glass-border;
  flex-shrink: 0;
}

// ── Scrollable body ───────────────────────────────────────────────────────────
.legal-body {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: $space-10 $space-10 0;
  flex: 1;
  min-height: 0;
}

.legal-intro {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(235, 235, 245, 0.65);
  margin: 0 0 $space-12;
  letter-spacing: $ls-normal;
}

// ── Sections ──────────────────────────────────────────────────────────────────
.legal-section {
  margin-bottom: $space-10;
}

.legal-section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: $ls-base;
  margin: 0 0 $space-4;
}

.legal-para {
  font-size: $font-body-sm;
  line-height: $lh-loose;
  color: $text-secondary-ios;
  margin: 0 0 $space-4;
  letter-spacing: $ls-normal;

  &:last-child {
    margin-bottom: 0;
  }
}

// ── Footer spacer ─────────────────────────────────────────────────────────────
.legal-footer-spacer {
  height: max(28px, env(safe-area-inset-bottom, 28px));
}
</style>
