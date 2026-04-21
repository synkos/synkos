<template>
  <q-dialog
    :model-value="modelValue"
    position="bottom"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div
      class="signout-sheet"
      :style="sheetDragStyle"
      @touchstart.passive="onDragStart"
      @touchmove.passive="onDragMove"
      @touchend="onDragEnd"
      @touchcancel="onDragEnd"
    >
      <Transition name="signout-flip" mode="out-in">
        <!-- Confirm state -->
        <div v-if="signOutState === 'confirm'" key="confirm" class="signout-confirm">
          <div class="signout-icon-wrap">
            <q-icon name="logout" size="26px" style="color: #ff453a" />
          </div>
          <h3 class="signout-title">
            {{
              isGuest
                ? t('pages.profile.exitGuestDialogTitle')
                : t('pages.profile.signOutDialogTitle')
            }}
          </h3>
          <p class="signout-desc">
            {{
              isGuest
                ? t('pages.profile.exitGuestDialogDesc')
                : t('pages.profile.signOutDialogDesc')
            }}
          </p>
          <button
            class="signout-btn signout-btn--danger"
            :disabled="isProcessing"
            @click="$emit('confirm')"
          >
            <q-spinner v-if="isProcessing" size="18px" color="white" />
            <span v-else>{{
              isGuest ? t('pages.profile.exitGuestConfirm') : t('pages.profile.signOutConfirm')
            }}</span>
          </button>
          <button
            class="signout-btn signout-btn--ghost"
            :disabled="isProcessing"
            @click="$emit('update:modelValue', false)"
          >
            {{ t('pages.profile.signOutCancel') }}
          </button>
        </div>

        <!-- Farewell state -->
        <div v-else key="farewell" class="signout-farewell">
          <div class="farewell-face-wrap">
            <svg class="farewell-face" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" fill="#6E5CE6" />
              <ellipse cx="18" cy="47" rx="7" ry="4.5" fill="rgba(255,255,255,0.18)" />
              <ellipse cx="62" cy="47" rx="7" ry="4.5" fill="rgba(255,255,255,0.18)" />
              <path
                class="farewell-eye farewell-eye--left"
                d="M 23 32 Q 28 28 33 32"
                fill="none"
                stroke="white"
                stroke-width="2.8"
                stroke-linecap="round"
              />
              <path
                class="farewell-eye farewell-eye--right"
                d="M 47 32 Q 52 28 57 32"
                fill="none"
                stroke="white"
                stroke-width="2.8"
                stroke-linecap="round"
              />
              <path
                class="farewell-smile"
                d="M 25 52 Q 40 64 55 52"
                fill="none"
                stroke="white"
                stroke-width="3.5"
                stroke-linecap="round"
              />
              <g class="farewell-wave" transform-origin="30px 55px">
                <path
                  d="M 14 56 Q 10 48 16 44 Q 20 41 22 46 Q 23 42 27 43 Q 31 44 29 49 Q 33 46 36 49 Q 38 53 33 57 Q 30 62 22 62 Z"
                  fill="white"
                  opacity="0.9"
                />
              </g>
            </svg>
          </div>
          <h3 class="farewell-title">{{ t('pages.profile.signOutFarewell') }}</h3>
          <p class="farewell-sub">
            {{
              isGuest
                ? t('pages.profile.exitGuestFarewellSub')
                : t('pages.profile.signOutFarewellSub')
            }}
          </p>
        </div>
      </Transition>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSheetDrag } from 'src/core/composables/useSheetDrag';

interface Props {
  modelValue: boolean;
  signOutState: 'confirm' | 'farewell';
  isProcessing: boolean;
  isGuest: boolean;
}

defineProps<Props>();
defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();

const { t } = useI18n();
const { sheetDragStyle, onDragStart, onDragMove, onDragEnd } = useSheetDrag();
</script>

<style lang="scss" scoped>
// Remove Quasar's default padding and stretch the inner wrapper so the sheet
// fills it edge-to-edge. The wrapper also gets a solid background as fallback
// to cover the safe-area zone in case the sheet doesn't reach the very bottom.
:deep(.q-dialog__inner) {
  padding: 0 !important;
  width: 100% !important;
  background: #1c1c1e;
}

.signout-sheet {
  width: 100%;
  background: rgba(28, 28, 30, 0.78);
  backdrop-filter: blur(48px) saturate(160%);
  -webkit-backdrop-filter: blur(48px) saturate(160%);
  border-radius: 24px 24px 0 0;
  border-top: 0.5px solid rgba(255, 255, 255, 0.12);
  // Push the sheet down by the safe-area height so the background visually
  // covers the gap, then compensate with the same amount in padding-bottom
  // so content stays above the home indicator.
  margin-bottom: calc(-1 * env(safe-area-inset-bottom, 0px));
  padding: 28px 24px calc(28px + env(safe-area-inset-bottom, 0px));
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Confirm content
.signout-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  width: 100%;
}

.signout-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(255, 69, 58, 0.12);
  border: 0.5px solid rgba(255, 69, 58, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.signout-title {
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: -0.4px;
  margin: 0;
}

.signout-desc {
  font-size: 14px;
  color: rgba(235, 235, 245, 0.45);
  margin: 0 0 8px;
  line-height: 1.45;
}

.signout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    opacity 0.15s ease,
    transform 0.1s ease;

  &:active:not(:disabled) {
    opacity: 0.82;
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--danger {
    background: #ff453a;
    color: #fff;
  }

  &--ghost {
    background: rgba(255, 255, 255, 0.07);
    border: 0.5px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
  }
}

// Farewell content
@keyframes farewell-bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  55% {
    transform: scale(1.15);
    opacity: 1;
  }
  75% {
    transform: scale(0.94);
  }
  90% {
    transform: scale(1.04);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes farewell-eye-draw {
  from {
    stroke-dashoffset: 16;
    opacity: 0;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes farewell-smile-draw {
  from {
    stroke-dashoffset: 50;
    opacity: 0;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes farewell-wave {
  0%,
  100% {
    transform: rotate(-10deg);
  }
  40% {
    transform: rotate(18deg);
  }
  70% {
    transform: rotate(-5deg);
  }
}

@keyframes farewell-fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.signout-farewell {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  width: 100%;
}

.farewell-face-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.farewell-face {
  width: 96px;
  height: 96px;
  filter: drop-shadow(0 8px 24px rgba(110, 92, 230, 0.4));
  animation: farewell-bounce-in 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

  .farewell-eye--left,
  .farewell-eye--right {
    stroke-dasharray: 16;
    stroke-dashoffset: 16;
    animation: farewell-eye-draw 0.3s ease 0.35s forwards;
  }

  .farewell-smile {
    stroke-dasharray: 50;
    stroke-dashoffset: 50;
    animation: farewell-smile-draw 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
  }

  .farewell-wave {
    transform-origin: 30px 55px;
    transform-box: fill-box;
    animation: farewell-wave 0.6s ease 0.7s 2 both;
  }
}

.farewell-title {
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: -0.4px;
  margin: 0;
  animation: farewell-fade-up 0.4s ease 0.4s both;
}

.farewell-sub {
  font-size: 14px;
  color: rgba(235, 235, 245, 0.45);
  margin: 0;
  letter-spacing: -0.1px;
  animation: farewell-fade-up 0.4s ease 0.55s both;
}

// Transition between confirm ↔ farewell states
.signout-flip-enter-active,
.signout-flip-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.signout-flip-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}

.signout-flip-leave-to {
  opacity: 0;
  transform: scale(1.02) translateY(-4px);
}
</style>
