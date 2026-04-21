<template>
  <q-dialog
    :model-value="modelValue"
    position="right"
    full-height
    transition-show="slide-left"
    :transition-hide="transitionHide"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div
      ref="drawerRef"
      class="app-menu"
      :style="dragStyle"
      @touchstart="onDragStart"
      @touchend="onDragEnd"
    >
      <!-- ── Header ─────────────────────────────────────────────────── -->
      <div class="menu-header">
        <div class="logo-icon">
          <q-icon name="verified" size="18px" color="white" />
        </div>
        <span class="logo-label">{{ appConfig.name }}</span>
      </div>

      <!-- ── Body ───────────────────────────────────────────────────── -->
      <div class="menu-body">
        <!-- ── MI CUENTA ──────────────────────────────────────────────── -->
        <div v-if="authStore.isAuthenticated" class="menu-section">
          <div class="section-group">
            <AppListRow
              icon="person"
              icon-color="#5E5CE6"
              icon-bg="rgba(94, 92, 230, 0.15)"
              :label="t('nav.myAccount')"
              :hint="t('pages.settings.menu.cuentaHint')"
              @click="navigate('settings-account')"
            />
          </div>
        </div>

        <!-- ── MAIN CATEGORIES ─────────────────────────────────────── -->
        <div class="menu-section">
          <div class="section-group">
            <AppListRow
              icon="tune"
              icon-color="#5E5CE6"
              icon-bg="rgba(94, 92, 230, 0.15)"
              :label="t('nav.preferences')"
              :hint="t('pages.settings.preferenciasSection.preferencesHint')"
              @click="navigate('settings-preferences')"
            />
            <div class="row-sep" />
            <AppListRow
              icon="credit_card"
              icon-color="#30D158"
              icon-bg="rgba(48, 209, 88, 0.15)"
              :label="t('nav.billing')"
              :hint="t('pages.settings.menu.facturacionHint')"
              @click="navigate('settings-billing')"
            />
            <div class="row-sep" />
            <AppListRow
              icon="shield"
              icon-color="#FF9F0A"
              icon-bg="rgba(255, 159, 10, 0.15)"
              :label="t('nav.security')"
              :hint="t('pages.settings.menu.seguridadHint')"
              @click="navigate('settings-security')"
            />
            <div class="row-sep" />
            <AppListRow
              icon="notifications"
              icon-color="#FF9F0A"
              icon-bg="rgba(255, 159, 10, 0.15)"
              :label="t('nav.notifications')"
              :hint="t('pages.settings.menu.notificacionesHint')"
              @click="navigate('settings-notifications')"
            />
            <div class="row-sep" />
            <AppListRow
              icon="help_outline"
              icon-color="#30D158"
              icon-bg="rgba(48, 209, 88, 0.15)"
              :label="t('nav.support')"
              :hint="t('pages.profile.actions.helpHint')"
              @click="navigate('settings-support')"
            />
            <div class="row-sep" />
            <AppListRow
              icon="gavel"
              icon-color="#8E8E93"
              icon-bg="rgba(142, 142, 147, 0.15)"
              :label="t('nav.legal')"
              :hint="t('pages.settings.menu.legalHint')"
              @click="navigate('settings-legal')"
            />
            <div class="row-sep" />
            <AppListRow
              icon="info_outline"
              icon-color="#FF9F0A"
              icon-bg="rgba(255, 159, 10, 0.15)"
              :label="t('nav.acercaDe')"
              :hint="t('pages.profile.actions.aboutHint')"
              @click="navigate('settings-about')"
            />
          </div>
        </div>

        <!-- ── VERSION ─────────────────────────────────────────────── -->
        <p class="menu-version">
          {{ appConfig.name }} · {{ t('pages.profile.version') }} {{ appVersion }}
        </p>

        <div class="menu-footer-spacer" />
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuthStore } from 'src/stores/auth.store';
import AppListRow from 'src/core/components/ui/AppListRow.vue';
import { appConfig } from 'src/app.config';

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const appVersion = appConfig.version;

// ── Swipe-to-close gesture ────────────────────────────────────────────
const drawerRef = ref<HTMLElement | null>(null);
const dragDeltaX = ref(0);
const isDragging = ref(false);
const transitionHide = ref('slide-right');

let startX = 0;
let startY = 0;
let isHorizontal: boolean | null = null;
let thresholdCrossed = false;

// Velocity tracking
let lastTouchX = 0;
let lastTouchTime = 0;
let swipeVelocity = 0; // px/ms, positive = rightward

const DISMISS_THRESHOLD = 80; // px before threshold haptic fires
const VELOCITY_THRESHOLD = 0.45; // px/ms — fast flick always dismisses
const MIN_DRAG_TO_FLICK = 12; // px minimum drag to count a flick

const dragStyle = computed(() => {
  if (dragDeltaX.value <= 0) return {};
  return {
    transform: `translateX(${dragDeltaX.value}px)`,
    transition: isDragging.value ? 'none' : 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
    willChange: 'transform',
  };
});

// ── Backdrop opacity sync ─────────────────────────────────────────────
function getBackdropEl(): HTMLElement | null {
  const inner = drawerRef.value?.closest('.q-dialog__inner');
  return (inner?.previousElementSibling as HTMLElement) ?? null;
}

function syncBackdrop(deltaX: number): void {
  const backdrop = getBackdropEl();
  if (!backdrop) return;
  const drawerWidth = drawerRef.value?.offsetWidth ?? 340;
  const opacity = 1 - Math.min(deltaX / drawerWidth, 1) * 0.85;
  backdrop.style.opacity = String(opacity);
  backdrop.style.transition = 'none';
}

function restoreBackdrop(): void {
  const backdrop = getBackdropEl();
  if (!backdrop) return;
  backdrop.style.opacity = '1';
  backdrop.style.transition = 'opacity 0.32s ease';
}

function clearBackdrop(): void {
  const backdrop = getBackdropEl();
  if (!backdrop) return;
  backdrop.style.opacity = '0';
  backdrop.style.transition = 'opacity 0.3s ease';
}

// ── Touch handlers ────────────────────────────────────────────────────
function onDragStart(e: TouchEvent): void {
  isDragging.value = true;
  isHorizontal = null;
  thresholdCrossed = false;
  startX = e.touches[0]!.clientX;
  startY = e.touches[0]!.clientY;
  lastTouchX = startX;
  lastTouchTime = Date.now();
  swipeVelocity = 0;
  dragDeltaX.value = 0;
}

function onTouchMove(e: TouchEvent): void {
  if (!isDragging.value) return;
  const dx = e.touches[0]!.clientX - startX;
  const dy = e.touches[0]!.clientY - startY;

  // Lock direction on first significant movement
  if (isHorizontal === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
    isHorizontal = Math.abs(dx) > Math.abs(dy);
  }

  if (!isHorizontal) return;

  e.preventDefault();

  // Track instantaneous velocity
  const now = Date.now();
  const dt = now - lastTouchTime;
  if (dt > 0) {
    swipeVelocity = (e.touches[0]!.clientX - lastTouchX) / dt;
  }
  lastTouchX = e.touches[0]!.clientX;
  lastTouchTime = now;

  dragDeltaX.value = dx > 0 ? dx : 0;
  syncBackdrop(dragDeltaX.value);

  // Haptic feedback when crossing dismiss threshold
  if (!thresholdCrossed && dragDeltaX.value >= DISMISS_THRESHOLD) {
    thresholdCrossed = true;
    void Haptics.impact({ style: ImpactStyle.Light });
  } else if (thresholdCrossed && dragDeltaX.value < DISMISS_THRESHOLD) {
    thresholdCrossed = false;
  }
}

function onDragEnd(): void {
  if (!isDragging.value) return;
  isDragging.value = false;

  const shouldDismiss =
    dragDeltaX.value >= DISMISS_THRESHOLD ||
    (swipeVelocity > VELOCITY_THRESHOLD && dragDeltaX.value > MIN_DRAG_TO_FLICK);

  if (shouldDismiss) {
    void dragDismiss();
  } else {
    dragDeltaX.value = 0;
    restoreBackdrop();
  }
}

// Animate drawer off-screen, then close bypassing q-dialog exit animation
async function dragDismiss(): Promise<void> {
  void Haptics.impact({ style: ImpactStyle.Medium });

  // Slide drawer fully off screen
  const offscreen = (drawerRef.value?.offsetWidth ?? 380) + 20;
  isDragging.value = false;
  dragDeltaX.value = offscreen;
  clearBackdrop();

  // Wait for our CSS transition (0.38s)
  await new Promise<void>((r) => setTimeout(r, 360));

  // Disable Quasar's exit animation so it doesn't re-animate
  transitionHide.value = '';
  emit('update:modelValue', false);

  // Reset state after dialog closes
  await nextTick();
  setTimeout(() => {
    dragDeltaX.value = 0;
    transitionHide.value = 'slide-right';
    restoreBackdrop();
  }, 80);
}

// Watch drawerRef because q-dialog mounts content via teleport only when open —
// onMounted runs before the portal content exists, so drawerRef is null there.
watch(drawerRef, (el, prevEl) => {
  prevEl?.removeEventListener('touchmove', onTouchMove);
  el?.addEventListener('touchmove', onTouchMove, { passive: false });
});

// ── Actions ───────────────────────────────────────────────────────────
function close(): void {
  emit('update:modelValue', false);
}

function navigate(routeName: string): void {
  void Haptics.impact({ style: ImpactStyle.Light });
  close();
  void router.push({ name: routeName });
}
</script>

<style lang="scss" scoped>
// ── Container ─────────────────────────────────────────────────────────
// Global iOS dialog padding override lives in app.scss.
.app-menu {
  width: min(380px, 92vw);
  height: 100dvh;
  background: #111111;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── Header ────────────────────────────────────────────────────────────
// Compensate the top safe area so content sits below the notch/island.
.menu-header {
  display: flex;
  align-items: center;
  gap: $space-5;
  padding-top: calc(18px + env(safe-area-inset-top, 0px));
  padding-bottom: $space-8;
  padding-left: 18px;
  padding-right: 18px;
  border-bottom: 0.5px solid $border-subtle;
  flex-shrink: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(145deg, #5e5ce6, $primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-label {
  font-size: $font-body;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: $ls-base;
}

// ── Body ──────────────────────────────────────────────────────────────
.menu-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-top: $space-4;
}

// ── Section ───────────────────────────────────────────────────────────
.menu-section {
  padding: 0 14px $space-2;
}

.section-group {
  background: $surface-2;
  border: 0.5px solid $surface-2-border;
  border-radius: $radius-xl;
  overflow: hidden;
  margin-top: $space-6;
}

.row-sep {
  height: 0.5px;
  background: $separator;
  margin-left: 56px;
}

// ── Danger rows ───────────────────────────────────────────────────────
.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: $space-7 $space-8;
  background: transparent;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  min-height: 50px;

  &--centered {
    justify-content: center;
  }

  &:active {
    background: rgba(255, 69, 58, 0.06);
  }
}

.danger-label {
  font-size: $font-body;
  font-weight: 500;
  color: $negative;
  letter-spacing: $ls-normal;
}

// ── Footer spacer — compensates bottom safe area (home indicator) ─────
.menu-footer-spacer {
  height: calc(32px + env(safe-area-inset-bottom, 0px));
}

// ── Version ───────────────────────────────────────────────────────────
.menu-version {
  font-size: $font-sm;
  color: rgba(235, 235, 245, 0.18);
  text-align: center;
  padding: $space-12 $space-8 $space-2;
  margin: 0;
  letter-spacing: 0.1px;
}

// ── Toggle overrides ──────────────────────────────────────────────────
:deep(.q-toggle) {
  padding: 0;

  .q-toggle__inner {
    font-size: 32px;
  }
}
</style>
