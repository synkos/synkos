<template>
  <div class="auth-root">
    <!-- ── Loading overlay (app initialization) ──────────────────────────── -->
    <Transition name="fade">
      <div v-if="!authStore.isInitialized" class="splash-overlay">
        <div class="splash-logo">
          <div class="splash-icon">
            <!-- Replace with your app icon/logo -->
            <AppIcon name="style" size="40px" style="color: #fff" />
          </div>
        </div>
        <AppCircularProgress
          indeterminate
          size="24px"
          color="white"
          class="splash-spinner"
          track-color="transparent"
        />
      </div>
    </Transition>

    <!-- ── Main auth screen ───────────────────────────────────────────────── -->
    <div class="auth-screen">
      <!-- Logo block — always visible, outside the form transition -->
      <div class="auth-header">
        <div class="auth-app-icon">
          <!-- Replace with your app icon/logo -->
          <AppIcon name="style" size="38px" style="color: #fff" />
        </div>
        <h1 class="app-title">{{ appName }}</h1>
        <p class="app-tagline">{{ t('pages.auth.tagline') }}</p>
      </div>

      <!-- ── Form area — transitions between social / login / register ─────── -->
      <Transition :name="transitionName" mode="out-in" @after-enter="onFormAfterEnter">
        <!-- ── Social mode ────────────────────────────────────────────────── -->
        <div v-if="mode === 'social'" key="social" class="form-block form-block--social">
          <button
            v-if="appConfig.features.appleAuth"
            class="social-btn social-btn--apple"
            :disabled="authStore.isLoading"
            @click="handleApple"
          >
            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.28.07 2.17.74 2.9.8 1.1-.23 2.16-.94 3.34-.84 1.42.12 2.49.7 3.19 1.77-2.91 1.74-2.22 5.56.24 6.67-.47 1.31-1.06 2.6-1.67 3.46zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
              />
            </svg>
            {{ t('pages.auth.continueApple') }}
          </button>

          <button
            v-if="appConfig.features.googleAuth"
            class="social-btn social-btn--google"
            :disabled="authStore.isLoading"
            @click="handleGoogle"
          >
            <svg class="social-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {{ t('pages.auth.continueGoogle') }}
          </button>

          <!-- Global error -->
          <Transition name="fade">
            <div v-if="globalError" class="global-error">
              <AppIcon name="error_outline" size="16px" />
              {{ globalError }}
            </div>
          </Transition>

          <AppButton variant="link" :disabled="authStore.isLoading" @click="goTo('login')">
            {{ t('pages.auth.continueEmail') }}
          </AppButton>

          <button v-if="appConfig.features.guestMode" class="guest-btn" @click="handleGuest">
            {{ t('pages.auth.continueGuest') }}
          </button>
        </div>

        <!-- ── Email login mode ───────────────────────────────────────────── -->
        <div v-else-if="mode === 'login'" key="login" class="form-block">
          <button class="back-btn" @click="goTo('social')">
            <AppIcon name="chevron_left" size="22px" />
            {{ t('nav.back') }}
          </button>

          <p class="form-subtitle">{{ t('pages.auth.loginSubtitle') }}</p>

          <div class="field-group">
            <div class="field-wrap" :class="{ 'field-wrap--error': errors.email }">
              <input
                v-model="form.email"
                type="email"
                class="field-input"
                :placeholder="t('pages.auth.emailPlaceholder')"
                autocomplete="email"
                inputmode="email"
                @input="errors.email = ''"
              />
            </div>
            <div class="field-separator" />
            <div class="field-wrap" :class="{ 'field-wrap--error': errors.password }">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input"
                :placeholder="t('pages.auth.passwordPlaceholder')"
                autocomplete="current-password"
                @input="errors.password = ''"
              />
              <button class="field-eye" tabindex="-1" @click="showPassword = !showPassword">
                <AppIcon :name="showPassword ? 'visibility_off' : 'visibility'" size="18px" />
              </button>
            </div>
          </div>

          <button class="forgot-btn" @click="goTo('forgot')">
            {{ t('pages.auth.forgotPassword') }}
          </button>

          <div class="feedback-area">
            <div v-if="errors.email || errors.password" class="error-text">
              {{ errors.email || errors.password }}
            </div>
            <div v-else-if="globalError" class="global-error">
              <AppIcon name="error_outline" size="16px" />
              {{ globalError }}
            </div>
          </div>

          <AppButton
            :loading="authStore.isLoading"
            :disabled="!form.email || !form.password"
            @click="handleEmailLogin"
          >
            {{ t('pages.auth.signIn') }}
          </AppButton>

          <p class="switch-text">
            {{ t('pages.auth.noAccount') }}
            <button class="switch-link" @click="goTo('register')">
              {{ t('pages.auth.createAccount') }}
            </button>
          </p>
        </div>

        <!-- ── Register mode ──────────────────────────────────────────────── -->
        <div v-else-if="mode === 'register'" key="register" class="form-block">
          <button class="back-btn" @click="goTo('login')">
            <AppIcon name="chevron_left" size="22px" />
            {{ t('pages.auth.backToLogin') }}
          </button>

          <p class="form-subtitle">{{ t('pages.auth.createSubtitle') }}</p>

          <div class="field-group">
            <div class="field-wrap" :class="{ 'field-wrap--error': errors.email }">
              <input
                v-model="form.email"
                type="email"
                class="field-input"
                :placeholder="t('pages.auth.emailPlaceholder')"
                autocomplete="email"
                inputmode="email"
                @input="errors.email = ''"
              />
            </div>
            <div class="field-separator" />
            <div class="field-wrap" :class="{ 'field-wrap--error': errors.password }">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input"
                :placeholder="t('pages.auth.newPasswordPlaceholder')"
                autocomplete="new-password"
                @input="
                  errors.password = '';
                  validatePassword();
                "
              />
              <button class="field-eye" tabindex="-1" @click="showPassword = !showPassword">
                <AppIcon :name="showPassword ? 'visibility_off' : 'visibility'" size="18px" />
              </button>
            </div>
          </div>

          <div v-if="form.password" class="password-strength">
            <div class="strength-bar">
              <div
                class="strength-fill"
                :style="{ width: passwordStrength.pct + '%' }"
                :class="`strength-fill--${passwordStrength.level}`"
              />
            </div>
            <span class="strength-label" :class="`strength-label--${passwordStrength.level}`">
              {{ t(`pages.auth.passwordStrength.${passwordStrength.level}`) }}
            </span>
          </div>

          <div class="feedback-area">
            <div v-if="errors.email || errors.password" class="error-text">
              {{ errors.email || errors.password }}
            </div>
            <div v-else-if="globalError" class="global-error">
              <AppIcon name="error_outline" size="16px" />
              {{ globalError }}
            </div>
          </div>

          <AppButton
            :loading="authStore.isLoading"
            :disabled="!canRegister"
            @click="handleRegister"
          >
            {{ t('pages.auth.createAccountBtn') }}
          </AppButton>

          <p class="terms-text">
            {{ t('pages.auth.termsPrefix') }}
            <button class="switch-link" @click="showLegal('terms')">
              {{ t('pages.auth.terms') }}
            </button>
            {{ t('pages.auth.and') }}
            <button class="switch-link" @click="showLegal('privacy')">
              {{ t('pages.auth.privacy') }}
            </button>
          </p>
        </div>

        <!-- ── Forgot password mode ───────────────────────────────────────── -->
        <div v-else-if="mode === 'forgot'" key="forgot" class="form-block">
          <button class="back-btn" @click="goTo('login')">
            <AppIcon name="chevron_left" size="22px" />
            {{ t('nav.back') }}
          </button>

          <p class="form-subtitle">{{ t('pages.auth.forgotSubtitle') }}</p>

          <div class="field-group">
            <div class="field-wrap" :class="{ 'field-wrap--error': errors.email }">
              <input
                v-model="forgotEmail"
                type="email"
                class="field-input"
                :placeholder="t('pages.auth.emailPlaceholder')"
                autocomplete="email"
                inputmode="email"
                @input="errors.email = ''"
              />
            </div>
          </div>

          <div class="feedback-area">
            <div v-if="errors.email" class="error-text">{{ errors.email }}</div>
            <div v-else-if="globalError" class="global-error">
              <AppIcon name="error_outline" size="16px" />
              {{ globalError }}
            </div>
          </div>

          <AppButton
            :loading="authStore.isLoading"
            :disabled="!forgotEmail"
            @click="handleForgotPassword"
          >
            {{ t('pages.auth.forgotSend') }}
          </AppButton>
        </div>

        <!-- ── Reset password mode ────────────────────────────────────────── -->
        <div v-else-if="mode === 'reset'" key="reset" class="form-block">
          <button class="back-btn" @click="handleResetBack">
            <AppIcon name="chevron_left" size="22px" />
            {{ t('nav.back') }}
          </button>

          <Transition :name="resetStepTransition" mode="out-in" @after-enter="onFormAfterEnter">
            <div v-if="resetStep === 'code'" key="reset-code" class="reset-step">
              <p class="form-subtitle">
                {{ t('pages.auth.resetSubtitle') }} <strong>{{ forgotEmail }}</strong>
              </p>

              <div
                class="otp-row"
                :class="{ 'otp-row--error': errors.email, 'otp-row--shake': otpShake }"
                @animationend="otpShake = false"
              >
                <input
                  v-for="(_, i) in resetDigits"
                  :key="i"
                  :ref="
                    (el) => {
                      if (el) resetRefs[i] = el as HTMLInputElement;
                    }
                  "
                  :value="resetDigits[i]"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  autocomplete="one-time-code"
                  class="otp-cell"
                  :class="{ 'otp-cell--filled': resetDigits[i] !== '' }"
                  @keydown="(e) => onOtpKeydown(e, i, resetDigits, resetRefs)"
                  @input="(e) => onOtpInput(e, i, resetDigits, resetRefs, handleValidateResetCode)"
                  @paste="(e) => onOtpPaste(e, resetDigits, resetRefs, handleValidateResetCode)"
                />
              </div>

              <div class="feedback-area">
                <div v-if="authStore.isLoading" class="otp-verifying">
                  <AppSpinner size="18px" color="white" />
                </div>
                <div v-else-if="errors.email" class="error-text">{{ errors.email }}</div>
                <div v-else-if="globalError" class="global-error">
                  <AppIcon name="error_outline" size="16px" />
                  {{ globalError }}
                </div>
              </div>

              <div class="verify-footer">
                <Transition name="fade" mode="out-in">
                  <p
                    v-if="resetCountdown === 0"
                    key="expired"
                    class="verify-countdown verify-countdown--expired"
                  >
                    {{ t('pages.auth.resetExpired') }}
                  </p>
                  <p v-else key="countdown" class="verify-countdown">
                    {{ t('pages.auth.resetExpires', { time: resetCountdownFormatted }) }}
                  </p>
                </Transition>
                <button
                  class="switch-link"
                  :disabled="authStore.isLoading || resetResendCooldown > 0"
                  @click="() => handleForgotPassword(true)"
                >
                  {{
                    resetResendCooldown > 0
                      ? `${t('pages.auth.verifySend')} (${resetResendCooldown}s)`
                      : t('pages.auth.verifySend')
                  }}
                </button>
              </div>
            </div>

            <div v-else key="reset-password" class="reset-step">
              <p class="form-subtitle">{{ t('pages.auth.resetPasswordSubtitle') }}</p>

              <div class="field-group">
                <div class="field-wrap" :class="{ 'field-wrap--error': errors.password }">
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="field-input"
                    :placeholder="t('pages.auth.resetNewPassword')"
                    autocomplete="new-password"
                    @input="
                      errors.password = '';
                      validatePassword();
                    "
                  />
                  <button class="field-eye" tabindex="-1" @click="showPassword = !showPassword">
                    <AppIcon :name="showPassword ? 'visibility_off' : 'visibility'" size="18px" />
                  </button>
                </div>
              </div>

              <div v-if="form.password" class="password-strength">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :style="{ width: passwordStrength.pct + '%' }"
                    :class="`strength-fill--${passwordStrength.level}`"
                  />
                </div>
                <span class="strength-label" :class="`strength-label--${passwordStrength.level}`">
                  {{ t(`pages.auth.passwordStrength.${passwordStrength.level}`) }}
                </span>
              </div>

              <div class="feedback-area">
                <div v-if="resetSuccess" class="success-text">
                  <AppIcon name="check_circle_outline" size="16px" />
                  {{ t('pages.auth.resetSuccessHint') }}
                </div>
                <div v-else-if="errors.password" class="error-text">{{ errors.password }}</div>
                <div v-else-if="globalError" class="global-error">
                  <AppIcon name="error_outline" size="16px" />
                  {{ globalError }}
                </div>
              </div>

              <AppButton
                :loading="authStore.isLoading"
                :disabled="resetSuccess || !form.password"
                @click="handleResetPassword"
              >
                {{ t('pages.auth.resetSubmit') }}
              </AppButton>
            </div>
          </Transition>
        </div>

        <!-- ── Email verify mode ──────────────────────────────────────────── -->
        <div v-else-if="mode === 'verify'" key="verify" class="form-block">
          <button class="back-btn" @click="handleVerifyBack">
            <AppIcon name="chevron_left" size="22px" />
            {{ t('nav.back') }}
          </button>

          <p class="form-subtitle">
            {{ t('pages.auth.verifySubtitle') }} <strong>{{ authStore.user?.email }}</strong>
          </p>

          <div
            class="otp-row"
            :class="{ 'otp-row--error': errors.email, 'otp-row--shake': otpShake }"
            @animationend="otpShake = false"
          >
            <input
              v-for="(_, i) in verifyDigits"
              :key="i"
              :ref="
                (el) => {
                  if (el) verifyRefs[i] = el as HTMLInputElement;
                }
              "
              :value="verifyDigits[i]"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="one-time-code"
              class="otp-cell"
              :class="{ 'otp-cell--filled': verifyDigits[i] !== '' }"
              @keydown="(e) => onOtpKeydown(e, i, verifyDigits, verifyRefs)"
              @input="(e) => onOtpInput(e, i, verifyDigits, verifyRefs, handleVerifyEmail)"
              @paste="(e) => onOtpPaste(e, verifyDigits, verifyRefs, handleVerifyEmail)"
            />
          </div>

          <div class="feedback-area">
            <div v-if="authStore.isLoading" class="otp-verifying">
              <AppSpinner size="18px" color="white" />
            </div>
            <div v-else-if="errors.email" class="error-text">{{ errors.email }}</div>
            <div v-else-if="globalError" class="global-error">
              <AppIcon name="error_outline" size="16px" />
              {{ globalError }}
            </div>
          </div>

          <div class="verify-footer">
            <Transition name="fade" mode="out-in">
              <p v-if="verifyResent" key="resent" class="verify-resent">
                <AppIcon name="check_circle_outline" size="14px" />
                {{ t('pages.auth.verifyResent') }}
              </p>
              <p v-else key="valid" class="verify-countdown">
                {{ t('pages.auth.verifyValid') }}
              </p>
            </Transition>
            <button
              class="switch-link"
              :disabled="authStore.isLoading || verifyResendCooldown > 0"
              @click="handleResendVerification"
            >
              {{
                verifyResendCooldown > 0
                  ? `${t('pages.auth.verifySend')} (${verifyResendCooldown}s)`
                  : t('pages.auth.verifySend')
              }}
            </button>
          </div>
        </div>

        <!-- ── Username picker ────────────────────────────────────────────── -->
        <div v-else-if="mode === 'username'" key="username" class="form-block">
          <p class="form-subtitle">{{ t('pages.usernamePicker.subtitle') }}</p>

          <div class="field-group">
            <div
              class="field-wrap username-field-wrap"
              :class="{
                'field-wrap--error': usernameStatusType === 'error',
                'field-wrap--success': usernameStatusType === 'success',
              }"
            >
              <span class="username-at">@</span>
              <input
                ref="usernameInputRef"
                v-model="usernameInput"
                type="text"
                class="field-input"
                :placeholder="t('pages.usernamePicker.placeholder')"
                autocomplete="username"
                autocapitalize="none"
                spellcheck="false"
                maxlength="20"
                @input="onUsernameInput"
              />
              <div class="username-status-icon">
                <AppSpinner v-if="usernameIsChecking" size="16px" color="white" />
                <AppIcon
                  v-else-if="usernameStatusType === 'success'"
                  name="check_circle"
                  size="18px"
                  style="color: var(--color-positive)"
                />
                <AppIcon
                  v-else-if="usernameStatusType === 'error'"
                  name="cancel"
                  size="18px"
                  style="color: var(--color-negative)"
                />
              </div>
            </div>
          </div>

          <p v-if="!usernameInput" class="username-rules-hint">
            {{ t('pages.usernamePicker.rulesHint') }}
          </p>

          <div class="feedback-area">
            <Transition name="fade" mode="out-in">
              <div v-if="usernameErrorMsg" key="err" class="error-text">{{ usernameErrorMsg }}</div>
              <div v-else-if="usernameStatusType === 'success'" key="ok" class="success-text">
                <AppIcon name="check_circle_outline" size="16px" />
                {{ t('pages.usernamePicker.available') }}
              </div>
            </Transition>
          </div>

          <Transition name="fade">
            <div v-if="usernameSuggestions.length > 0" class="username-suggestions">
              <p class="username-suggestions-label">
                {{ t('pages.usernamePicker.suggestionsLabel') }}
              </p>
              <div class="username-suggestions-list">
                <button
                  v-for="s in usernameSuggestions"
                  :key="s"
                  class="username-suggestion-chip"
                  @click="applyUsernameSuggestion(s)"
                >
                  @{{ s }}
                </button>
              </div>
            </div>
          </Transition>

          <AppButton
            :loading="authStore.isLoading"
            :disabled="usernameStatusType !== 'success'"
            @click="handleUsernameSubmit"
          >
            {{ t('pages.usernamePicker.confirm') }}
          </AppButton>
        </div>

        <!-- ── Success / welcome ──────────────────────────────────────────── -->
        <div v-else-if="mode === 'success'" key="success" class="form-block form-block--welcome">
          <div class="welcome-face-wrap">
            <svg class="welcome-face" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" fill="#FFD60A" />
              <ellipse cx="18" cy="48" rx="8" ry="5" fill="rgba(255,100,80,0.22)" />
              <ellipse cx="62" cy="48" rx="8" ry="5" fill="rgba(255,100,80,0.22)" />
              <ellipse class="face-eye" cx="28" cy="33" rx="4" ry="4.5" fill="#1c1c1e" />
              <ellipse class="face-eye" cx="52" cy="33" rx="4" ry="4.5" fill="#1c1c1e" />
              <path
                class="face-smile"
                d="M 22 50 Q 40 68 58 50"
                fill="none"
                stroke="#1c1c1e"
                stroke-width="3.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="welcome-copy">
            <h2 class="welcome-title">
              {{
                activeProvider === 'register'
                  ? t('pages.auth.successWelcomeNew')
                  : t('pages.auth.successWelcome')
              }}
            </h2>
            <p class="welcome-subtitle">{{ t('pages.auth.successSubtitle') }}</p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── Legal sheets ───────────────────────────────────────────────────── -->
    <LegalBottomSheet v-model:show="showLegalSheet" :type="legalSheetType" />

    <!-- ── Face ID prompt (post-login) ───────────────────────────────────── -->
    <AppBottomSheet v-model="showBiometricPrompt" seamless>
      <div class="biometric-sheet">
        <div class="biometric-icon">
          <AppIcon name="face" size="44px" style="color: #fff" />
        </div>
        <h3 class="biometric-title">{{ t('pages.auth.faceIdTitle') }}</h3>
        <p class="biometric-desc">{{ t('pages.auth.faceIdDesc') }}</p>
        <AppButton class="biometric-enable-btn" @click="enableBiometricAuth">
          {{ t('pages.auth.enableFaceId') }}
        </AppButton>
        <AppButton variant="ghost" @click="showBiometricPrompt = false">
          {{ t('pages.auth.notNow') }}
        </AppButton>
      </div>
    </AppBottomSheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import {
  useAuthStore,
  AuthService,
  UsernameService,
  getClientConfig,
  LegalBottomSheet,
} from '@synkos/client';
import { AppBottomSheet, AppIcon, AppSpinner, AppButton, AppCircularProgress } from '@synkos/ui';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const appConfig = getClientConfig();
const appName = appConfig.name;

// ── State ─────────────────────────────────────────────────────────────────────

const mode = ref<
  'social' | 'login' | 'register' | 'forgot' | 'reset' | 'verify' | 'username' | 'success'
>('social');
const transitionName = ref('slide-left');
const showPassword = ref(false);
const showBiometricPrompt = ref(false);
const showLegalSheet = ref(false);
const legalSheetType = ref<'terms' | 'privacy'>('terms');
const globalError = ref('');
const activeProvider = ref<'apple' | 'google' | 'email' | 'register' | null>(null);

const form = ref({ email: '', password: '' });
const errors = ref({ email: '', password: '' });

const forgotEmail = ref('');
const resetDigits = ref(['', '', '', '', '', '']);
const resetRefs: HTMLInputElement[] = [];
const resetSuccess = ref(false);
const resetStep = ref<'code' | 'password'>('code');
const resetStepTransition = ref('slide-left');
const resetCountdown = ref(900);
const resetCountdownTimer = ref<ReturnType<typeof setInterval> | null>(null);
const resetResendCooldown = ref(0);
const resetResendCooldownTimer = ref<ReturnType<typeof setInterval> | null>(null);

const verifyDigits = ref(['', '', '', '', '', '']);
const verifyRefs: HTMLInputElement[] = [];

const otpShake = ref(false);
function triggerOtpShake() {
  otpShake.value = false;
  void nextTick(() => {
    otpShake.value = true;
  });
}
const verifyResent = ref(false);
const verifyResendCooldown = ref(0);
const verifyResendCooldownTimer = ref<ReturnType<typeof setInterval> | null>(null);

const usernameInput = ref('');
const usernameIsChecking = ref(false);
const usernameStatusType = ref<'idle' | 'success' | 'error'>('idle');
const usernameErrorMsg = ref('');
const usernameSuggestions = ref<string[]>([]);
let usernameDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const usernameInputRef = ref<HTMLInputElement | null>(null);

const verifyCode = computed(() => verifyDigits.value.join(''));
const resetCode = computed(() => resetDigits.value.join(''));

const resetCountdownFormatted = computed(() => {
  const m = Math.floor(resetCountdown.value / 60);
  const s = resetCountdown.value % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
});

// ── Mode navigation ───────────────────────────────────────────────────────────

const modeOrder: Record<typeof mode.value, number> = {
  social: 0,
  login: 1,
  register: 2,
  forgot: 3,
  reset: 4,
  verify: 5,
  username: 6,
  success: 7,
};

async function goTo(next: typeof mode.value) {
  await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  if (mode.value === 'reset') stopResetCountdown();
  if (next === 'forgot') forgotEmail.value = form.value.email;
  transitionName.value = modeOrder[next] > modeOrder[mode.value] ? 'slide-left' : 'slide-right';
  globalError.value = '';
  errors.value = { email: '', password: '' };
  form.value = { email: '', password: '' };
  resetSuccess.value = false;
  mode.value = next;
}

// ── Computed ──────────────────────────────────────────────────────────────────

const canRegister = computed(
  () => form.value.email.includes('@') && form.value.password.length >= 8,
);

const passwordStrength = computed(() => {
  const p = form.value.password;
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return { level: 'weak', pct: 25 };
  if (score <= 2) return { level: 'fair', pct: 50 };
  if (score <= 3) return { level: 'good', pct: 75 };
  return { level: 'strong', pct: 100 };
});

// ── Validation ────────────────────────────────────────────────────────────────

function validatePassword() {
  const p = form.value.password;
  if (p && p.length < 8) errors.value.password = t('pages.auth.errors.passwordTooShort');
  else if (p && !/[A-Z]/.test(p)) errors.value.password = t('pages.auth.errors.passwordNeedsUpper');
  else if (p && !/[0-9]/.test(p))
    errors.value.password = t('pages.auth.errors.passwordNeedsNumber');
  else errors.value.password = '';
}

function validateLoginForm(): boolean {
  errors.value = { email: '', password: '' };
  if (!form.value.email || !form.value.email.includes('@')) {
    errors.value.email = t('pages.auth.errors.invalidEmail');
    return false;
  }
  if (!form.value.password) {
    errors.value.password = t('pages.auth.errors.passwordRequired');
    return false;
  }
  return true;
}

function validateRegisterForm(): boolean {
  errors.value = { email: '', password: '' };
  if (!form.value.email || !form.value.email.includes('@')) {
    errors.value.email = t('pages.auth.errors.invalidEmail');
    return false;
  }
  validatePassword();
  return !errors.value.password;
}

// ── Cooldown helpers ──────────────────────────────────────────────────────────

function startResendCooldown(
  cooldown: { value: number },
  timer: { value: ReturnType<typeof setInterval> | null },
  seconds = 60,
) {
  if (timer.value) clearInterval(timer.value);
  cooldown.value = seconds;
  timer.value = setInterval(() => {
    if (cooldown.value > 0) cooldown.value--;
    else {
      clearInterval(timer.value!);
      timer.value = null;
    }
  }, 1000);
}

function startResetCountdown(seconds = 900) {
  if (resetCountdownTimer.value) clearInterval(resetCountdownTimer.value);
  resetCountdown.value = seconds;
  resetCountdownTimer.value = setInterval(() => {
    if (resetCountdown.value > 0) resetCountdown.value--;
    else {
      clearInterval(resetCountdownTimer.value!);
      resetCountdownTimer.value = null;
    }
  }, 1000);
}

function stopResetCountdown() {
  if (resetCountdownTimer.value) {
    clearInterval(resetCountdownTimer.value);
    resetCountdownTimer.value = null;
  }
}

// ── OTP helpers ───────────────────────────────────────────────────────────────

function onOtpKeydown(e: KeyboardEvent, i: number, digits: string[], refs: HTMLInputElement[]) {
  if (/^[0-9]$/.test(e.key)) {
    (e.target as HTMLInputElement).value = '';
    return;
  }
  if (e.key === 'Backspace') {
    e.preventDefault();
    if (digits[i] !== '') digits[i] = '';
    else if (i > 0) {
      digits[i - 1] = '';
      refs[i - 1]?.focus();
    }
  } else if (e.key === 'ArrowLeft' && i > 0) {
    e.preventDefault();
    refs[i - 1]?.focus();
  } else if (e.key === 'ArrowRight' && i < digits.length - 1) {
    e.preventDefault();
    refs[i + 1]?.focus();
  }
}

function onOtpInput(
  e: Event,
  i: number,
  digits: string[],
  refs: HTMLInputElement[],
  onComplete?: () => void | Promise<void>,
) {
  const input = e.target as HTMLInputElement;
  const raw = input.value.replace(/[^0-9]/g, '');
  if (raw.length > 1) {
    const chars = raw.slice(0, 6).split('');
    chars.forEach((ch, idx) => {
      if (idx < digits.length) digits[idx] = ch;
    });
    void nextTick(() => {
      const nextEmpty = digits.findIndex((d) => d === '');
      const focusIdx = nextEmpty === -1 ? digits.length - 1 : nextEmpty;
      refs[focusIdx]?.focus();
      if (nextEmpty === -1 && onComplete) void onComplete();
    });
    return;
  }
  const val = raw.slice(-1);
  digits[i] = val;
  input.value = val;
  if (val && i < digits.length - 1) void nextTick(() => refs[i + 1]?.focus());
  else if (val && i === digits.length - 1 && onComplete) {
    if (digits.every((d) => d !== '')) void onComplete();
  }
}

function onOtpPaste(
  e: ClipboardEvent,
  digits: string[],
  refs: HTMLInputElement[],
  onComplete?: () => void | Promise<void>,
) {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') ?? '';
  const nums = text
    .replace(/[^0-9]/g, '')
    .slice(0, 6)
    .split('');
  nums.forEach((n, idx) => {
    if (idx < digits.length) digits[idx] = n;
  });
  void nextTick(() => {
    const nextEmpty = digits.findIndex((d) => d === '');
    const focusIdx = nextEmpty === -1 ? digits.length - 1 : nextEmpty;
    refs[focusIdx]?.focus();
    if (nextEmpty === -1 && onComplete) void onComplete();
  });
}

// ── Auth handlers ─────────────────────────────────────────────────────────────

async function handleEmailLogin() {
  if (!validateLoginForm()) {
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    return;
  }
  globalError.value = '';
  try {
    await authStore.loginEmail({ email: form.value.email, password: form.value.password });
    await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
    void afterAuth('email');
  } catch (err: unknown) {
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    const code = (err as { response?: { status?: number } })?.response?.status;
    globalError.value =
      code === 401
        ? t('pages.auth.errors.invalidCredentials')
        : code === 429
          ? t('pages.auth.errors.accountLocked')
          : t('pages.auth.errors.generic');
  }
}

function showLegal(type: 'terms' | 'privacy') {
  legalSheetType.value = type;
  showLegalSheet.value = true;
}

async function handleRegister() {
  if (!validateRegisterForm()) {
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    return;
  }
  globalError.value = '';
  try {
    await authStore.register({ email: form.value.email, password: form.value.password });
    await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
    void afterAuth('register');
  } catch (err: unknown) {
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    const code = (err as { response?: { status?: number } })?.response?.status;
    globalError.value =
      code === 409 ? t('pages.auth.errors.emailTaken') : t('pages.auth.errors.generic');
  }
}

async function handleGoogle() {
  await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  globalError.value = '';
  try {
    const { SocialLogin } = await import('@capgo/capacitor-social-login');
    await SocialLogin.initialize({
      google: {
        iOSClientId: import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID ?? '',
        webClientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ?? '',
      },
    });
    const result = await SocialLogin.login({
      provider: 'google',
      options: { scopes: ['profile', 'email'] },
    });
    if (result.result.responseType !== 'online')
      throw new Error('Google Sign-In offline response not supported');
    await authStore.loginGoogle({ idToken: result.result.idToken ?? '' });
    void afterAuth('google');
  } catch (err: unknown) {
    const msg = String((err as { message?: string })?.message ?? '');
    if (msg.includes('cancel') || msg.includes('Cancel') || msg.includes('12501')) return;
    globalError.value = t('pages.auth.errors.googleFailed');
  }
}

async function handleApple() {
  await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  globalError.value = '';
  try {
    const { SocialLogin } = await import('@capgo/capacitor-social-login');
    await SocialLogin.initialize({
      apple: { clientId: import.meta.env.VITE_APPLE_CLIENT_ID ?? '', redirectUrl: '' },
    });
    const result = await SocialLogin.login({
      provider: 'apple',
      options: {
        scopes: ['name', 'email'],
        nonce: Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(''),
      },
    });
    const profile = result.result.profile;
    const displayName = profile?.givenName
      ? `${profile.givenName} ${profile.familyName ?? ''}`.trim()
      : undefined;
    const appleEmail = profile?.email ?? undefined;
    await authStore.loginApple({
      idToken: result.result.idToken ?? '',
      ...(appleEmail ? { email: appleEmail } : {}),
      ...(displayName ? { displayName } : {}),
    });
    void afterAuth('apple');
  } catch (err: unknown) {
    const msg = String((err as { message?: string })?.message ?? '');
    if (
      msg.includes('cancel') ||
      msg.includes('Cancel') ||
      msg === 'The operation couldn’t be completed.'
    )
      return;
    globalError.value = t('pages.auth.errors.appleFailed');
  }
}

async function handleGuest() {
  await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  await authStore.continueAsGuest();
  void router.replace({ name: 'home' });
}

async function handleValidateResetCode() {
  if (resetCode.value.length !== 6) return;
  errors.value.email = '';
  globalError.value = '';
  authStore.isLoading = true;
  try {
    await AuthService.validateResetCode({ email: forgotEmail.value, code: resetCode.value });
    await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
    resetStepTransition.value = 'slide-left';
    resetStep.value = 'password';
  } catch {
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    errors.value.email = t('pages.auth.errors.resetFailed');
    triggerOtpShake();
    resetDigits.value = ['', '', '', '', '', ''];
    void nextTick(() => resetRefs[0]?.focus());
  } finally {
    authStore.isLoading = false;
  }
}

async function handleForgotPassword(force = false) {
  if (!forgotEmail.value.includes('@')) {
    errors.value.email = t('pages.auth.errors.invalidEmail');
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    return;
  }
  globalError.value = '';
  errors.value = { email: '', password: '' };
  authStore.isLoading = true;
  try {
    const dto = force
      ? { email: forgotEmail.value, force: true as const }
      : { email: forgotEmail.value };
    const { expiresAt, lastSentAt } = await AuthService.forgotPassword(dto);
    await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
    const secondsLeft = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
    const cooldownLeft = Math.max(
      0,
      60 - Math.floor((Date.now() - new Date(lastSentAt).getTime()) / 1000),
    );
    transitionName.value = 'slide-left';
    globalError.value = '';
    resetDigits.value = ['', '', '', '', '', ''];
    resetStep.value = 'code';
    form.value = { email: '', password: '' };
    mode.value = 'reset';
    startResetCountdown(secondsLeft);
    if (cooldownLeft > 0)
      startResendCooldown(resetResendCooldown, resetResendCooldownTimer, cooldownLeft);
  } catch (err: unknown) {
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    const status = (err as { response?: { status?: number } })?.response?.status;
    globalError.value =
      status === 429
        ? t('pages.auth.errors.forgotRateLimited')
        : t('pages.auth.errors.forgotFailed');
  } finally {
    authStore.isLoading = false;
  }
}

async function handleResetPassword() {
  globalError.value = '';
  errors.value = { email: '', password: '' };
  if (resetCode.value.length !== 6) {
    errors.value.email = t('pages.auth.errors.resetFailed');
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    return;
  }
  if (form.value.password.length < 8) {
    errors.value.password = t('pages.auth.errors.resetPasswordWeak');
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    return;
  }
  authStore.isLoading = true;
  try {
    await AuthService.resetPassword({
      email: forgotEmail.value,
      code: resetCode.value,
      newPassword: form.value.password,
    });
    await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
    stopResetCountdown();
    resetSuccess.value = true;
    setTimeout(() => {
      void goTo('login');
    }, 1800);
  } catch {
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    globalError.value = t('pages.auth.errors.resetFailed');
  } finally {
    authStore.isLoading = false;
  }
}

function handleResetBack() {
  if (resetStep.value === 'password') {
    resetStepTransition.value = 'slide-right';
    resetDigits.value = ['', '', '', '', '', ''];
    resetStep.value = 'code';
  } else {
    void goTo('forgot');
  }
}

async function handleVerifyEmail() {
  if (verifyCode.value.length !== 6) {
    errors.value.email = t('pages.auth.errors.verifyInvalid');
    triggerOtpShake();
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    return;
  }
  globalError.value = '';
  errors.value = { email: '', password: '' };
  try {
    await authStore.verifyEmail(authStore.user!.email, verifyCode.value);
    await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
    void afterAuth('register');
  } catch {
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    triggerOtpShake();
    globalError.value = t('pages.auth.errors.verifyFailed');
  }
}

async function handleVerifyBack() {
  await authStore.logout();
  globalError.value = '';
  errors.value = { email: '', password: '' };
  verifyDigits.value = ['', '', '', '', '', ''];
  mode.value = 'social';
}

async function handleResendVerification() {
  globalError.value = '';
  authStore.isLoading = true;
  try {
    await AuthService.sendVerificationEmail({ email: authStore.user!.email });
    await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
    verifyDigits.value = ['', '', '', '', '', ''];
    errors.value = { email: '', password: '' };
    verifyResent.value = true;
    setTimeout(() => {
      verifyResent.value = false;
    }, 3000);
    startResendCooldown(verifyResendCooldown, verifyResendCooldownTimer);
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    globalError.value =
      status === 429
        ? t('pages.auth.errors.verifyResendRateLimited')
        : t('pages.auth.errors.verifyResendFailed');
  } finally {
    authStore.isLoading = false;
  }
}

async function enableBiometricAuth() {
  await authStore.enableBiometric();
  showBiometricPrompt.value = false;
  void router.replace({ name: 'home' });
}

// ── Username picker ───────────────────────────────────────────────────────────

function onUsernameInput() {
  usernameStatusType.value = 'idle';
  usernameErrorMsg.value = '';
  usernameSuggestions.value = [];
  const raw = usernameInput.value.trim();
  if (!raw) {
    usernameIsChecking.value = false;
    return;
  }
  if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer);
  usernameIsChecking.value = true;
  usernameDebounceTimer = setTimeout(() => {
    void checkUsernameAvailability(raw);
  }, 400);
}

async function checkUsernameAvailability(raw: string) {
  try {
    const result = await UsernameService.check(raw);
    if (usernameInput.value.trim() !== raw) return;
    if (result.available) {
      usernameStatusType.value = 'success';
      usernameErrorMsg.value = '';
      usernameSuggestions.value = [];
    } else {
      usernameStatusType.value = 'error';
      usernameErrorMsg.value = result.errorMessage ?? t('pages.usernamePicker.errors.taken');
      usernameSuggestions.value = result.suggestions ?? [];
    }
  } catch {
    if (usernameInput.value.trim() !== raw) return;
    usernameStatusType.value = 'error';
    usernameErrorMsg.value = t('pages.usernamePicker.errors.checkFailed');
  } finally {
    if (usernameInput.value.trim() === raw) usernameIsChecking.value = false;
  }
}

function applyUsernameSuggestion(s: string) {
  usernameInput.value = s;
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  onUsernameInput();
}

async function handleUsernameSubmit() {
  if (usernameStatusType.value !== 'success' || authStore.isLoading) return;
  authStore.isLoading = true;
  try {
    await authStore.setUsername(usernameInput.value.trim());
    await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
    void continueAfterUsername();
  } catch (err: unknown) {
    await Haptics.notification({ type: NotificationType.Error }).catch(() => undefined);
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 409) {
      usernameStatusType.value = 'error';
      usernameErrorMsg.value = t('pages.usernamePicker.errors.taken');
      void checkUsernameAvailability(usernameInput.value.trim());
    } else {
      usernameErrorMsg.value = t('pages.usernamePicker.errors.generic');
    }
  } finally {
    authStore.isLoading = false;
  }
}

async function continueAfterUsername() {
  transitionName.value = 'slide-left';
  mode.value = 'success';
  await new Promise<void>((resolve) => setTimeout(resolve, 1800));
  if (authStore.biometricEnabled || authStore.biometricAsked) {
    void router.replace({ name: 'home' });
  } else {
    await authStore.markBiometricAsked();
    showBiometricPrompt.value = true;
  }
}

function afterAuth(provider: typeof activeProvider.value = 'email') {
  if (!authStore.user?.isEmailVerified) {
    verifyDigits.value = ['', '', '', '', '', ''];
    globalError.value = '';
    errors.value = { email: '', password: '' };
    transitionName.value = 'slide-left';
    mode.value = 'verify';
    return;
  }
  if (!authStore.user?.username) {
    activeProvider.value = provider;
    const base = (authStore.user?.displayName ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15);
    usernameInput.value = base.length >= 3 ? base : '';
    usernameStatusType.value = 'idle';
    usernameErrorMsg.value = '';
    usernameSuggestions.value = [];
    if (usernameInput.value) {
      usernameIsChecking.value = true;
      void checkUsernameAvailability(usernameInput.value);
    }
    transitionName.value = 'slide-left';
    mode.value = 'username';
    return;
  }
  activeProvider.value = provider;
  void continueAfterUsername();
}

function onFormAfterEnter() {
  if (mode.value === 'verify') verifyRefs[0]?.focus();
  if (mode.value === 'reset' && resetStep.value === 'code') resetRefs[0]?.focus();
  if (mode.value === 'username') usernameInputRef.value?.focus();
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    if (route.query.verify === '1') {
      verifyDigits.value = ['', '', '', '', '', ''];
      mode.value = 'verify';
    } else void router.replace({ name: 'home' });
  }
});
</script>

<style lang="scss" scoped>
// ── Root ──────────────────────────────────────────────────────────────────────
.auth-root {
  position: fixed;
  inset: 0;
  background: var(--auth-bg, #000);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ── Splash ────────────────────────────────────────────────────────────────────
.splash-overlay {
  position: absolute;
  inset: 0;
  background: var(--auth-bg, #000);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  z-index: 10;
}

.splash-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.splash-icon {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  background: var(--auth-icon-bg, linear-gradient(135deg, #1a1a2e, #16213e));
  border: 0.5px solid var(--auth-border, rgba(255, 255, 255, 0.12));
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-spinner {
  opacity: 0.5;
}

// ── Screen ────────────────────────────────────────────────────────────────────
.auth-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 24px env(safe-area-inset-bottom, 24px);
}

// ── Header ────────────────────────────────────────────────────────────────────
.auth-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: 24px;
  text-align: center;
}

.auth-app-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: var(--auth-icon-bg, linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%));
  border: 0.5px solid var(--auth-border, rgba(255, 255, 255, 0.14));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.app-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--auth-text-primary, rgba(255, 255, 255, 0.95));
  letter-spacing: -0.6px;
  margin: 0 0 6px 0;
}

.app-tagline {
  font-size: 15px;
  color: var(--auth-text-muted, rgba(235, 235, 245, 0.45));
  margin: 0;
  letter-spacing: -0.1px;
}

// ── Form block ────────────────────────────────────────────────────────────────
.form-block {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 420px;
  padding-bottom: max(24px, env(safe-area-inset-bottom, 24px));

  &--social {
    justify-content: flex-end;
  }
}

.form-subtitle {
  font-size: 14px;
  color: var(--auth-text-muted, rgba(235, 235, 245, 0.45));
  margin: 0 0 6px 0;
  line-height: 1.4;
}

// ── Social buttons ────────────────────────────────────────────────────────────
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
  cursor: pointer;
  transition:
    opacity 0.15s ease,
    transform 0.1s ease;
  -webkit-tap-highlight-color: transparent;

  &:active:not(:disabled) {
    opacity: 0.85;
    transform: scale(0.98);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.social-btn--apple {
  background: #fff;
  color: #000;
}

.social-btn--google {
  background: var(--auth-surface-1, rgba(255, 255, 255, 0.08));
  color: var(--auth-text-primary, rgba(255, 255, 255, 0.92));
  border: 0.5px solid var(--auth-border, rgba(255, 255, 255, 0.12));
}

.social-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

// ── OTP ───────────────────────────────────────────────────────────────────────
@keyframes otp-shake {
  0% {
    transform: translateX(0);
  }
  15% {
    transform: translateX(-6px);
  }
  30% {
    transform: translateX(5px);
  }
  45% {
    transform: translateX(-4px);
  }
  60% {
    transform: translateX(3px);
  }
  75% {
    transform: translateX(-2px);
  }
  90% {
    transform: translateX(1px);
  }
  100% {
    transform: translateX(0);
  }
}

.otp-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  &--shake {
    animation: otp-shake 0.45s ease;
  }
}

.otp-cell {
  flex: 1;
  min-width: 0;
  max-width: 52px;
  height: 56px;
  border-radius: 12px;
  background: var(--auth-surface-1, rgba(255, 255, 255, 0.07));
  color: var(--auth-text-primary, rgba(255, 255, 255, 0.92));
  border: 1px solid transparent;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  caret-color: transparent;
  outline: none;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
  -webkit-tap-highlight-color: transparent;

  &--filled {
    border-color: var(--auth-border-strong, rgba(255, 255, 255, 0.25));
    background: var(--auth-surface-2, rgba(255, 255, 255, 0.11));
  }

  &:focus {
    border-color: var(--auth-border-focus, rgba(255, 255, 255, 0.4));
    background: var(--auth-surface-focus, rgba(255, 255, 255, 0.13));
    caret-color: var(--auth-text-primary, rgba(255, 255, 255, 0.92));
  }
}

.otp-verifying {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

// ── Text fields ───────────────────────────────────────────────────────────────
.field-group {
  background: var(--auth-surface-1, rgba(255, 255, 255, 0.07));
  border: 0.5px solid var(--auth-border, rgba(255, 255, 255, 0.1));
  border-radius: 14px;
  overflow: hidden;
}

.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
  &--error {
    background: rgba(255, 69, 58, 0.06);
  }
}

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 14px 16px;
  font-size: 16px;
  color: var(--auth-text-primary, rgba(255, 255, 255, 0.92));
  letter-spacing: -0.2px;
  caret-color: var(--color-primary, #0a84ff);
  width: 100%;

  &::placeholder {
    color: var(--auth-text-subtle, rgba(235, 235, 245, 0.3));
  }

  &:-webkit-autofill {
    -webkit-text-fill-color: var(--auth-text-primary, rgba(255, 255, 255, 0.92));
    -webkit-box-shadow: 0 0 0 100px #111 inset;
    caret-color: var(--color-primary, #0a84ff);
  }
}

.field-eye {
  background: none;
  border: none;
  padding: 14px 16px 14px 0;
  color: var(--auth-text-subtle, rgba(235, 235, 245, 0.35));
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}

.field-separator {
  height: 0.5px;
  background: var(--auth-separator, rgba(255, 255, 255, 0.08));
  margin-left: 16px;
}

// ── Username picker ───────────────────────────────────────────────────────────
.username-field-wrap {
  display: flex;
  align-items: center;
  gap: 2px;

  &.field-wrap--success {
    background: rgba(34, 197, 94, 0.06);
  }
  &.field-wrap--error {
    background: rgba(239, 68, 68, 0.08);
  }
}

.username-at {
  font-size: 17px;
  color: var(--auth-text-muted, rgba(255, 255, 255, 0.4));
  font-weight: 500;
  flex-shrink: 0;
  padding-left: 16px;
  padding-right: 2px;
}

.username-status-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 22px;
  justify-content: center;
  padding-right: 14px;
}

.username-rules-hint {
  font-size: 12px;
  color: var(--auth-text-subtle, rgba(255, 255, 255, 0.3));
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

.username-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.username-suggestions-label {
  font-size: 12px;
  color: var(--auth-text-muted, rgba(255, 255, 255, 0.4));
  margin: 0;
}

.username-suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.username-suggestion-chip {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  color: #a5b4fc;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover,
  &:active {
    background: rgba(99, 102, 241, 0.28);
    border-color: rgba(99, 102, 241, 0.55);
  }
}

// ── Password strength ─────────────────────────────────────────────────────────
.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar {
  flex: 1;
  height: 3px;
  background: var(--auth-surface-1, rgba(255, 255, 255, 0.1));
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition:
    width 0.3s ease,
    background 0.3s ease;
  &--weak {
    background: #ff453a;
  }
  &--fair {
    background: #ff9f0a;
  }
  &--good {
    background: #30d158;
  }
  &--strong {
    background: #30d158;
  }
}

.strength-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1px;
  white-space: nowrap;
  &--weak {
    color: #ff453a;
  }
  &--fair {
    color: #ff9f0a;
  }
  &--good {
    color: #30d158;
  }
  &--strong {
    color: #30d158;
  }
}

// ── Feedback areas ────────────────────────────────────────────────────────────
.feedback-area {
  min-height: 44px;
  display: flex;
  align-items: center;
}

.success-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #30d158;
  letter-spacing: -0.1px;
}

.error-text {
  font-size: 13px;
  color: #ff453a;
  padding-left: 4px;
  letter-spacing: -0.1px;
}

.global-error {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 69, 58, 0.12);
  border: 0.5px solid rgba(255, 69, 58, 0.25);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: #ff453a;
  letter-spacing: -0.1px;
}

// ── Buttons ───────────────────────────────────────────────────────────────────
.forgot-btn {
  background: none;
  border: none;
  text-align: right;
  font-size: 13px;
  color: var(--auth-text-muted, rgba(235, 235, 245, 0.45));
  cursor: pointer;
  padding: 0;
  align-self: flex-end;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: -0.1px;
  &:active {
    opacity: 0.7;
  }
}

.switch-text {
  font-size: 14px;
  color: var(--auth-text-muted, rgba(235, 235, 245, 0.45));
  text-align: center;
  margin: 0;
}

.switch-link {
  background: none;
  border: none;
  color: var(--color-primary, #0a84ff);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.guest-btn {
  background: none;
  border: none;
  color: var(--auth-text-subtle, rgba(235, 235, 245, 0.35));
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
  text-align: center;
  width: 100%;
  -webkit-tap-highlight-color: transparent;
  letter-spacing: -0.1px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  color: var(--color-primary, #0a84ff);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  align-self: flex-start;
  -webkit-tap-highlight-color: transparent;
  margin-bottom: 8px;
}

.terms-text {
  font-size: 12px;
  color: var(--auth-text-subtle, rgba(235, 235, 245, 0.3));
  text-align: center;
  margin: 0;
  line-height: 1.5;
  .switch-link {
    font-size: 12px;
  }
}

// ── Reset two-step ────────────────────────────────────────────────────────────
.reset-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

// ── Verify footer ─────────────────────────────────────────────────────────────
.verify-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.verify-countdown {
  font-size: 13px;
  color: var(--auth-text-subtle, rgba(235, 235, 245, 0.4));
  margin: 0;
  text-align: center;
  letter-spacing: -0.1px;
  &--expired {
    color: #ff9f0a;
  }
}

.verify-resent {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #30d158;
  margin: 0;
}

// ── Biometric sheet ───────────────────────────────────────────────────────────
.biometric-sheet {
  background: var(--auth-sheet-bg, #1c1c1e);
  border-radius: 24px 24px 0 0;
  border-top: 0.5px solid var(--auth-border, rgba(255, 255, 255, 0.1));
  padding: 32px 24px max(32px, env(safe-area-inset-bottom, 32px));
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.biometric-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(10, 132, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.biometric-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--auth-text-primary, rgba(255, 255, 255, 0.95));
  margin: 0;
  letter-spacing: -0.4px;
}

.biometric-desc {
  font-size: 14px;
  color: var(--auth-text-muted, rgba(235, 235, 245, 0.45));
  margin: 0;
  line-height: 1.5;
}

.biometric-enable-btn {
  margin-top: 8px;
}

// ── Transitions ───────────────────────────────────────────────────────────────
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.28s ease;
}
.slide-left-enter-from {
  transform: translateX(32px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-32px);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(-32px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(32px);
  opacity: 0;
}

// ── Welcome success block ─────────────────────────────────────────────────────
@keyframes face-bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  55% {
    transform: scale(1.18);
    opacity: 1;
  }
  75% {
    transform: scale(0.93);
  }
  90% {
    transform: scale(1.04);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes eye-squint {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.12);
  }
}

@keyframes smile-draw {
  from {
    stroke-dashoffset: 55;
    opacity: 0;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes welcome-fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-block--welcome {
  justify-content: center;
  align-items: center;
  gap: 28px;
}

.welcome-face-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-face {
  width: 96px;
  height: 96px;
  filter: drop-shadow(0 8px 24px rgba(255, 214, 10, 0.35));
  animation: face-bounce-in 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

  .face-eye {
    transform-box: fill-box;
    transform-origin: center;
    animation: eye-squint 0.35s ease-in-out 0.75s both;
  }
  .face-smile {
    stroke-dasharray: 55;
    stroke-dashoffset: 55;
    animation: smile-draw 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
  }
}

.welcome-copy {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.welcome-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--auth-text-primary, rgba(255, 255, 255, 0.95));
  letter-spacing: -0.5px;
  margin: 0;
  animation: welcome-fade-up 0.4s ease 0.4s both;
}

.welcome-subtitle {
  font-size: 15px;
  color: var(--auth-text-muted, rgba(235, 235, 245, 0.45));
  margin: 0;
  letter-spacing: -0.1px;
  animation: welcome-fade-up 0.4s ease 0.55s both;
}
</style>
