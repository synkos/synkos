<template>
  <AppDrawer
    ref="appDrawer"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div
      ref="drawerEl"
      class="app-menu"
      :style="dragStyle"
      @touchstart="onDragStart"
      @touchend="onDragEnd"
    >
      <!-- ── Header ─────────────────────────────────────────────────── -->
      <div class="menu-header">
        <div class="logo-icon">
          <AppIcon name="verified" size="18px" style="color: white" />
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
        <div v-if="visibleMainItems.length > 0" class="menu-section">
          <div class="section-group">
            <template v-for="(item, idx) in visibleMainItems" :key="item.name">
              <div v-if="idx > 0" class="row-sep" />
              <AppListRow
                :icon="item.icon"
                :icon-color="item.iconColor"
                :icon-bg="item.iconBg"
                :label="t(item.labelKey)"
                :hint="t(item.hintKey)"
                @click="navigate(item.name)"
              />
            </template>
          </div>
        </div>

        <!-- ── CUSTOM SECTIONS ─────────────────────────────────────── -->
        <div v-if="customSections.length > 0" class="menu-section">
          <div class="section-group">
            <template v-for="(item, idx) in customSections" :key="item.name">
              <div v-if="idx > 0" class="row-sep" />
              <AppListRow
                icon="settings"
                icon-color="#8E8E93"
                icon-bg="rgba(142, 142, 147, 0.15)"
                :label="t(item.titleKey)"
                @click="navigate(item.name)"
              />
            </template>
          </div>
        </div>

        <!-- ── VERSION ─────────────────────────────────────────────── -->
        <p class="menu-version">
          {{ appConfig.name }} · {{ t('pages.profile.version') }} {{ appVersion }}
        </p>

        <div class="menu-footer-spacer" />
      </div>
    </div>
  </AppDrawer>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuthStore } from '../../../auth/store.js';
import { AppDrawer, AppIcon, AppListRow } from '@synkos/ui';
import { getClientConfig } from '../../../internal/app-config.js';
import { getSettingsConfig } from '../../../navigation/internal/settings-config.js';

const appConfig = getClientConfig();
const settingsConfig = getSettingsConfig();

// All built-in menu items in order
const ALL_MENU_ITEMS = [
  {
    section: 'preferences' as const,
    name: 'settings-preferences',
    icon: 'tune',
    iconColor: '#5E5CE6',
    iconBg: 'rgba(94, 92, 230, 0.15)',
    labelKey: 'nav.preferences',
    hintKey: 'pages.settings.preferenciasSection.preferencesHint',
  },
  {
    section: 'billing' as const,
    name: 'settings-billing',
    icon: 'credit_card',
    iconColor: '#30D158',
    iconBg: 'rgba(48, 209, 88, 0.15)',
    labelKey: 'nav.billing',
    hintKey: 'pages.settings.menu.facturacionHint',
  },
  {
    section: 'security' as const,
    name: 'settings-security',
    icon: 'shield',
    iconColor: '#FF9F0A',
    iconBg: 'rgba(255, 159, 10, 0.15)',
    labelKey: 'nav.security',
    hintKey: 'pages.settings.menu.seguridadHint',
  },
  {
    section: 'notifications' as const,
    name: 'settings-notifications',
    icon: 'notifications',
    iconColor: '#FF9F0A',
    iconBg: 'rgba(255, 159, 10, 0.15)',
    labelKey: 'nav.notifications',
    hintKey: 'pages.settings.menu.notificacionesHint',
  },
  {
    section: 'support' as const,
    name: 'settings-support',
    icon: 'help_outline',
    iconColor: '#30D158',
    iconBg: 'rgba(48, 209, 88, 0.15)',
    labelKey: 'nav.support',
    hintKey: 'pages.profile.actions.helpHint',
  },
  {
    section: 'legal' as const,
    name: 'settings-legal',
    icon: 'gavel',
    iconColor: '#8E8E93',
    iconBg: 'rgba(142, 142, 147, 0.15)',
    labelKey: 'nav.legal',
    hintKey: 'pages.settings.menu.legalHint',
  },
  {
    section: 'about' as const,
    name: 'settings-about',
    icon: 'info_outline',
    iconColor: '#FF9F0A',
    iconBg: 'rgba(255, 159, 10, 0.15)',
    labelKey: 'nav.acercaDe',
    hintKey: 'pages.profile.actions.aboutHint',
  },
];

const visibleMainItems = computed(() =>
  ALL_MENU_ITEMS.filter((item) => settingsConfig.sections.includes(item.section))
);

const customSections = settingsConfig.customSections;

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const appVersion = appConfig.version;

// ── Template refs ─────────────────────────────────────────────────
const appDrawer = ref<InstanceType<typeof AppDrawer> | null>(null);
const drawerEl = ref<HTMLElement | null>(null);

// ── Swipe-to-close gesture ────────────────────────────────────────
const dragDeltaX = ref(0);
const isDragging = ref(false);

let startX = 0;
let startY = 0;
let isHorizontal: boolean | null = null;
let thresholdCrossed = false;
let lastTouchX = 0;
let lastTouchTime = 0;
let swipeVelocity = 0;

const DISMISS_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.45;
const MIN_DRAG_TO_FLICK = 12;

const dragStyle = computed(() => {
  if (dragDeltaX.value <= 0) return {};
  return {
    transform: `translateX(${dragDeltaX.value}px)`,
    transition: isDragging.value ? 'none' : 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
    willChange: 'transform',
  };
});

// ── Backdrop opacity sync ─────────────────────────────────────────
function syncBackdrop(deltaX: number): void {
  const backdrop = appDrawer.value?.backdropEl;
  if (!backdrop) return;
  const drawerWidth = drawerEl.value?.offsetWidth ?? 340;
  const opacity = 1 - Math.min(deltaX / drawerWidth, 1) * 0.85;
  backdrop.style.opacity = String(opacity);
  backdrop.style.transition = 'none';
}

function restoreBackdrop(): void {
  const backdrop = appDrawer.value?.backdropEl;
  if (!backdrop) return;
  backdrop.style.opacity = '1';
  backdrop.style.transition = 'opacity 0.32s ease';
}

function clearBackdrop(): void {
  const backdrop = appDrawer.value?.backdropEl;
  if (!backdrop) return;
  backdrop.style.opacity = '0';
  backdrop.style.transition = 'opacity 0.3s ease';
}

// ── Touch handlers ────────────────────────────────────────────────
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

  if (isHorizontal === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
    isHorizontal = Math.abs(dx) > Math.abs(dy);
  }

  if (!isHorizontal) return;

  e.preventDefault();

  const now = Date.now();
  const dt = now - lastTouchTime;
  if (dt > 0) swipeVelocity = (e.touches[0]!.clientX - lastTouchX) / dt;
  lastTouchX = e.touches[0]!.clientX;
  lastTouchTime = now;

  dragDeltaX.value = dx > 0 ? dx : 0;
  syncBackdrop(dragDeltaX.value);

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

async function dragDismiss(): Promise<void> {
  void Haptics.impact({ style: ImpactStyle.Medium });

  const offscreen = (drawerEl.value?.offsetWidth ?? 380) + 20;
  isDragging.value = false;
  dragDeltaX.value = offscreen;
  clearBackdrop();

  await new Promise<void>((r) => setTimeout(r, 360));

  // Disable AppDrawer's exit animation — drawer is already off-screen
  appDrawer.value?.disableAnimation();
  emit('update:modelValue', false);

  await nextTick();
  setTimeout(() => {
    dragDeltaX.value = 0;
    appDrawer.value?.enableAnimation();
    restoreBackdrop();
  }, 80);
}

// Watch drawerEl because AppDrawer mounts via Teleport — need to attach
// touchmove listener with { passive: false } so we can call preventDefault.
watch(drawerEl, (el, prevEl) => {
  prevEl?.removeEventListener('touchmove', onTouchMove);
  el?.addEventListener('touchmove', onTouchMove, { passive: false });
});

// ── Actions ───────────────────────────────────────────────────────
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
// ── Container ─────────────────────────────────────────────────────
.app-menu {
  width: min(380px, 92vw);
  height: 100dvh;
  background: var(--surface-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── Header ────────────────────────────────────────────────────────
.menu-header {
  display: flex;
  align-items: center;
  gap: $space-5;
  padding-top: calc(18px + env(safe-area-inset-top, 0px));
  padding-bottom: $space-8;
  padding-left: 18px;
  padding-right: 18px;
  border-bottom: 0.5px solid var(--border-subtle, #{$border-subtle});
  flex-shrink: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(145deg, #5e5ce6, var(--color-primary, #{$primary}));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-label {
  font-size: $font-body;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: $ls-base;
}

// ── Body ──────────────────────────────────────────────────────────
.menu-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-top: $space-4;
}

// ── Section ───────────────────────────────────────────────────────
.menu-section {
  padding: 0 14px $space-2;
}

.section-group {
  background: var(--surface-2, #{$surface-2});
  border: 0.5px solid var(--surface-2-border, #{$surface-2-border});
  border-radius: $radius-xl;
  overflow: hidden;
  margin-top: $space-6;
}

.row-sep {
  height: 0.5px;
  background: var(--separator, #{$separator});
  margin-left: 56px;
}

// ── Footer spacer ─────────────────────────────────────────────────
.menu-footer-spacer {
  height: calc(32px + env(safe-area-inset-bottom, 0px));
}

// ── Version ───────────────────────────────────────────────────────
.menu-version {
  font-size: $font-sm;
  color: var(--text-quaternary);
  text-align: center;
  padding: $space-12 $space-8 $space-2;
  margin: 0;
  letter-spacing: 0.1px;
}
</style>
