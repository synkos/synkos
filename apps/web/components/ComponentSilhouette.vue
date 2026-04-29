<script setup lang="ts">
defineProps<{
  /** Component name (PascalCase) — picks the right silhouette. */
  name: string;
}>();
</script>

<template>
  <div class="sil" :data-name="name">
    <!-- ── Actions ─────────────────────────────────────────────── -->
    <div v-if="name === 'AppButton'" class="sil__stack">
      <div class="primitive primitive--pill primitive--primary" />
      <div class="primitive primitive--pill primitive--ghost" />
    </div>

    <!-- ── Lists ───────────────────────────────────────────────── -->
    <div v-else-if="name === 'AppListSection'" class="primitive primitive--card">
      <div class="primitive__cap">
        <div class="primitive__caption" />
      </div>
      <div class="primitive__row">
        <div class="primitive__dot" />
        <div class="primitive__line" />
        <div class="primitive__chevron" />
      </div>
      <div class="primitive__sep" />
      <div class="primitive__row">
        <div class="primitive__dot" />
        <div class="primitive__line" />
        <div class="primitive__chevron" />
      </div>
      <div class="primitive__sep" />
      <div class="primitive__row">
        <div class="primitive__dot" />
        <div class="primitive__line primitive__line--short" />
        <div class="primitive__chevron" />
      </div>
    </div>

    <div v-else-if="name === 'AppListRow'" class="primitive primitive--card primitive--single">
      <div class="primitive__row">
        <div class="primitive__dot primitive__dot--accent" />
        <div class="primitive__row-body">
          <div class="primitive__line" />
          <div class="primitive__line primitive__line--hint" />
        </div>
        <div class="primitive__chevron" />
      </div>
    </div>

    <div v-else-if="name === 'AppListDivider'" class="primitive primitive--card">
      <div class="primitive__row">
        <div class="primitive__dot" />
        <div class="primitive__line" />
      </div>
      <div class="primitive__sep primitive__sep--strong" />
      <div class="primitive__row">
        <div class="primitive__dot" />
        <div class="primitive__line primitive__line--short" />
      </div>
    </div>

    <!-- ── Forms ───────────────────────────────────────────────── -->
    <div v-else-if="name === 'SegmentControl'" class="primitive primitive--segments">
      <span />
      <span class="primitive--active" />
      <span />
    </div>

    <!-- ── Feedback ────────────────────────────────────────────── -->
    <div v-else-if="name === 'AppSpinner'" class="primitive primitive--ring primitive--ring-arc" />

    <div
      v-else-if="name === 'AppCircularProgress'"
      class="primitive primitive--ring primitive--ring-progress"
    />

    <div v-else-if="name === 'AppEmptyState'" class="primitive primitive--empty">
      <div class="primitive__square" />
      <div class="primitive__line primitive__line--center" />
      <div class="primitive__line primitive__line--center primitive__line--short" />
      <div class="primitive--pill primitive--ghost primitive--small" />
    </div>

    <!-- ── Media ───────────────────────────────────────────────── -->
    <div v-else-if="name === 'AppIcon'" class="primitive primitive--icons">
      <span class="primitive__square" />
      <span class="primitive__circle" />
      <span class="primitive__triangle" />
      <span class="primitive__square primitive__square--rounded" />
    </div>

    <!-- ── Overlays ────────────────────────────────────────────── -->
    <div v-else-if="name === 'AppBottomSheet' || name === 'LegalBottomSheet'" class="phone">
      <div class="phone__chrome" />
      <div class="phone__sheet">
        <div class="phone__handle" />
        <div class="phone__line" />
        <div class="phone__line phone__line--short" />
      </div>
    </div>

    <div v-else-if="name === 'AppDrawer'" class="phone">
      <div class="phone__chrome" />
      <div class="phone__drawer">
        <div class="phone__line" />
        <div class="phone__line phone__line--short" />
        <div class="phone__line" />
      </div>
    </div>

    <!-- ── Layout ──────────────────────────────────────────────── -->
    <div v-else-if="name === 'AppPage'" class="phone">
      <div class="phone__body">
        <div class="phone__line" />
        <div class="phone__line phone__line--short" />
        <div class="phone__line" />
      </div>
    </div>

    <div v-else-if="name === 'AppPageLargeTitle'" class="phone">
      <div class="phone__body">
        <div class="phone__title" />
        <div class="phone__line phone__line--short" />
        <div class="phone__line" />
      </div>
    </div>

    <div v-else-if="name === 'MainLayout'" class="phone">
      <div class="phone__chrome">
        <div class="phone__line phone__line--xs" />
      </div>
      <div class="phone__body">
        <div class="phone__line" />
        <div class="phone__line phone__line--short" />
      </div>
      <div class="phone__tabs">
        <span />
        <span class="primitive--active" />
        <span />
        <span />
      </div>
    </div>

    <div v-else-if="name === 'AuthLayout'" class="phone">
      <div class="phone__body phone__body--center">
        <div class="phone__title phone__title--centered" />
        <div class="primitive--field" />
        <div class="primitive--field" />
        <div class="primitive--pill primitive--primary primitive--small" />
      </div>
    </div>

    <div v-else-if="name === 'SynkosApp'" class="phone phone--root">
      <div class="phone__chrome" />
      <div class="phone__body">
        <div class="phone__line" />
        <div class="phone__line phone__line--short" />
      </div>
      <div class="phone__tabs">
        <span />
        <span />
        <span />
      </div>
    </div>

    <!-- ── Auth UI ─────────────────────────────────────────────── -->
    <div v-else-if="name === 'OtpInput'" class="primitive primitive--otp">
      <span />
      <span />
      <span class="primitive--active" />
      <span />
      <span />
      <span />
    </div>

    <div v-else-if="name === 'AuthFieldGroup'" class="primitive primitive--field-group">
      <div class="primitive--field">
        <div class="primitive__line primitive__line--label" />
      </div>
      <div class="primitive__sep" />
      <div class="primitive--field">
        <div class="primitive__line primitive__line--label primitive__line--short" />
      </div>
    </div>

    <div
      v-else-if="name === 'AuthFieldRow'"
      class="primitive primitive--field primitive--field-large"
    >
      <div class="primitive__line primitive__line--label" />
      <div class="primitive__eye" />
    </div>

    <div v-else-if="name === 'AuthFeedback'" class="primitive primitive--feedback">
      <div class="primitive__icon-dot primitive__icon-dot--danger" />
      <div class="primitive__line" />
    </div>

    <div v-else-if="name === 'PasswordStrengthBar'" class="primitive primitive--strength">
      <div class="primitive__bar">
        <div class="primitive__bar-fill" />
      </div>
      <div class="primitive__line primitive__line--xs" />
    </div>

    <!-- Fallback -->
    <div v-else class="primitive primitive--fallback">
      <span class="primitive__square" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.sil {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-4;
  position: relative;
  overflow: hidden;

  &__stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-2;
  }
}

// ── Pill (button-like shape) ───────────────────────────────────────────────────
.primitive--pill {
  height: 28px;
  width: 110px;
  border-radius: 14px;
  display: block;

  &.primitive--small {
    height: 22px;
    width: 70px;
    border-radius: 11px;
  }
}

.primitive--primary {
  background: var(--color-primary);
}

.primitive--ghost {
  background: var(--bg-canvas);
  border: 1px solid var(--border-default);
}

// ── Card surface (list section) ────────────────────────────────────────────────
.primitive--card {
  width: 220px;
  border-radius: 14px;
  border: 1px solid var(--border-default);
  background: var(--bg-canvas);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.primitive--single {
    width: 220px;
  }
}

.primitive__cap {
  padding: $space-2 $space-3 $space-1;
}

.primitive__caption {
  width: 38px;
  height: 5px;
  border-radius: 2.5px;
  background: var(--text-tertiary);
  opacity: 0.7;
}

.primitive__row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
}

.primitive__row-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.primitive__dot {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--color-primary-soft);
  flex-shrink: 0;

  &--accent {
    background: var(--color-primary);
    opacity: 0.85;
  }
}

.primitive__line {
  height: 7px;
  border-radius: 3.5px;
  background: var(--border-strong);
  flex: 1;

  &--short {
    width: 60%;
    flex: none;
  }

  &--hint {
    height: 4px;
    width: 75%;
    opacity: 0.55;
  }

  &--center {
    margin-inline: auto;
    width: 90px;
  }

  &--label {
    height: 6px;
    width: 50%;
  }

  &--xs {
    height: 4px;
    width: 30px;
    border-radius: 2px;
  }
}

.primitive__chevron {
  width: 5px;
  height: 5px;
  border-right: 1.5px solid var(--text-tertiary);
  border-top: 1.5px solid var(--text-tertiary);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.primitive__sep {
  height: 1px;
  background: var(--border-subtle);
  margin-left: 38px;

  &--strong {
    background: var(--border-default);
    margin-left: 0;
  }
}

// ── Segments (segment control) ─────────────────────────────────────────────────
.primitive--segments {
  display: flex;
  width: 220px;
  height: 32px;
  background: var(--border-subtle);
  border-radius: 8px;
  padding: 3px;
  gap: 3px;

  span {
    flex: 1;
    border-radius: 6px;
    background: transparent;

    &.primitive--active {
      background: var(--bg-canvas);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
  }
}

// ── Ring (spinners / progress) ─────────────────────────────────────────────────
.primitive--ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 5px solid var(--border-default);
  position: relative;

  &.primitive--ring-arc {
    border-top-color: var(--color-primary);
    border-right-color: var(--color-primary);
  }

  &.primitive--ring-progress {
    background: conic-gradient(
      var(--color-primary) 0deg,
      var(--color-primary) 240deg,
      transparent 240deg,
      transparent 360deg
    );
    -webkit-mask: radial-gradient(circle at center, transparent 0, transparent 24px, #000 25px);
    mask: radial-gradient(circle at center, transparent 0, transparent 24px, #000 25px);
    border: none;
  }
}

// ── Empty state ────────────────────────────────────────────────────────────────
.primitive--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.primitive__square {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--bg-canvas);
  border: 1px solid var(--border-default);
  display: inline-block;
  flex-shrink: 0;

  &--rounded {
    border-radius: 50%;
  }
}

.primitive__circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  border: 1.5px solid var(--color-primary);
  display: inline-block;
  flex-shrink: 0;
}

.primitive__triangle {
  width: 0;
  height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-bottom: 26px solid var(--border-strong);
  display: inline-block;
}

// ── Icons grid ─────────────────────────────────────────────────────────────────
.primitive--icons {
  display: flex;
  align-items: center;
  gap: $space-3;
}

// ── Phone (layouts and overlays) ───────────────────────────────────────────────
.phone {
  width: 96px;
  height: 130px;
  border-radius: 14px;
  border: 1.5px solid var(--border-default);
  background: var(--bg-canvas);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &--root {
    border-color: var(--color-primary);
  }

  &__chrome {
    height: 16px;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    padding: 0 6px;
  }

  &__body {
    flex: 1;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    &--center {
      justify-content: center;
      align-items: center;
    }
  }

  &__line {
    height: 5px;
    border-radius: 2.5px;
    background: var(--border-strong);

    &--short {
      width: 60%;
    }

    &--xs {
      width: 18px;
      height: 4px;
    }
  }

  &__title {
    height: 9px;
    width: 64px;
    border-radius: 3px;
    background: var(--text-primary);
    opacity: 0.55;
    margin-bottom: 4px;

    &--centered {
      align-self: center;
      margin-bottom: 8px;
    }
  }

  &__tabs {
    height: 18px;
    background: var(--bg-elevated);
    border-top: 1px solid var(--border-subtle);
    display: flex;
    padding: 3px 6px;
    gap: 4px;

    span {
      flex: 1;
      border-radius: 2px;
      background: var(--border-default);

      &.primitive--active {
        background: var(--color-primary);
      }
    }
  }

  // Drawer slid in from the right
  &__drawer {
    position: absolute;
    inset-block-start: 17px;
    inset-block-end: 0;
    inset-inline-end: 0;
    width: 60%;
    background: var(--bg-elevated);
    border-inline-start: 1px solid var(--border-default);
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  // Bottom sheet docked at bottom
  &__sheet {
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    background: var(--bg-elevated);
    border-top: 1px solid var(--border-default);
    border-radius: 10px 10px 0 0;
    padding: 6px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    height: 56%;
  }

  &__handle {
    width: 22px;
    height: 3px;
    border-radius: 1.5px;
    background: var(--border-strong);
    margin: 0 auto 4px;
  }
}

// ── OTP cells ──────────────────────────────────────────────────────────────────
.primitive--otp {
  display: flex;
  gap: 4px;

  span {
    width: 22px;
    height: 30px;
    border-radius: 6px;
    background: var(--bg-canvas);
    border: 1px solid var(--border-default);

    &.primitive--active {
      border-color: var(--color-primary);
      background: var(--color-primary-soft);
    }
  }
}

// ── Field shapes ───────────────────────────────────────────────────────────────
.primitive--field {
  height: 34px;
  width: 200px;
  border-radius: 10px;
  background: var(--bg-canvas);
  border: 1px solid var(--border-default);
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  &.primitive--field-large {
    height: 44px;
  }
}

.primitive--field-group {
  width: 220px;
  border-radius: 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-canvas);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .primitive--field {
    width: 100%;
    border: none;
    border-radius: 0;
    background: transparent;
  }

  .primitive__sep {
    margin-left: 12px;
  }
}

.primitive__eye {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid var(--text-tertiary);
  margin-inline-start: auto;

  &::after {
    content: '';
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--text-tertiary);
    margin: 3px auto 0;
  }
}

// ── Feedback banner ────────────────────────────────────────────────────────────
.primitive--feedback {
  width: 220px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 69, 58, 0.1);
  border: 1px solid rgba(255, 69, 58, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}

.primitive__icon-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;

  &--danger {
    background: var(--color-danger);
  }
}

// ── Strength bar ───────────────────────────────────────────────────────────────
.primitive--strength {
  width: 220px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.primitive__bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--border-default);
  overflow: hidden;
}

.primitive__bar-fill {
  width: 65%;
  height: 100%;
  background: var(--color-warning);
}

// ── Fallback ───────────────────────────────────────────────────────────────────
.primitive--fallback {
  opacity: 0.5;
}
</style>
