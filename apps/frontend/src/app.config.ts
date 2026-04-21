/**
 * Global App Configuration
 *
 * Single source of truth for app identity and cross-cutting settings.
 * When building a new app from this template, only this file (and src/features/)
 * needs to change to rebrand the app.
 *
 * What lives here:
 *   • App name, version, bundle ID
 *   • Company info used in legal documents
 *   • Storage key prefix (avoids collisions between apps on the same device)
 *   • Feature flags (auth providers, biometrics, optional UX features)
 *   • Native Capacitor settings documented for reference
 *   • External links (support, legal docs, app stores)
 *
 * What does NOT live here:
 *   • Localized UI strings → src/i18n/
 *   • Colors, fonts, spacing → src/css/
 *   • Route definitions → src/router/routes/
 *   • Native bundle ID / icon / splash config → src-capacitor/capacitor.config.json
 */

// ─────────────────────────────────────────────────────────────────────────────
// Type
// ─────────────────────────────────────────────────────────────────────────────

interface AppConfig {
  /** Human-readable app name surfaced throughout the UI (nav bar, login, about, etc.). */
  name: string;
  /** Semantic version string shown in the About screen and settings drawer. */
  version: string;
  /**
   * Native bundle/package identifier.
   * Must match `appId` in src-capacitor/capacitor.config.json and the Xcode project.
   */
  bundleId: string;

  /** Company details used in legal documents and the About screen. */
  company: {
    name: string;
    legalName: string;
    country: string;
    jurisdiction: string;
  };

  /**
   * localStorage / Capacitor Preferences key names.
   * Change these when cloning the template for a new app so multiple apps
   * installed on the same device do not accidentally share persisted state.
   */
  storageKeys: {
    settings: string;
    pushToken: string;
    pushTokenRegistered: string;
  };

  /**
   * Feature flags.
   * Disabling a flag hides or no-ops the feature without deleting code,
   * making it easy to ship a stripped-down version or A/B test features.
   */
  features: {
    /** Google OAuth sign-in button. Requires a Google client ID in capacitor.config.json. */
    googleAuth: boolean;
    /** Apple Sign In (iOS only). Requires an active Apple Developer membership. */
    appleAuth: boolean;
    /** Face ID / Touch ID biometric sign-in after the first successful login. */
    faceId: boolean;
    /** Allow unauthenticated browsing as a guest (no account required). */
    guestMode: boolean;
    /** Push notifications via APNs (iOS) / FCM (Android). */
    pushNotifications: boolean;
    /** Example feature flag — replace with your app's features. */
    exampleFeature: boolean;
  };

  /**
   * External URLs used in the About screen, legal sheets, support flows, and
   * the "Rate the app" row.
   */
  links: {
    website: string;
    /** Email address for legal / privacy inquiries. */
    contactEmail: string;
    /** Email address for user support. */
    supportEmail: string;
    privacyPolicy: string;
    termsOfService: string;
    appStore: {
      /** iOS App Store product page URL (used for "Rate the app"). */
      ios: string;
      /** Google Play Store URL. */
      android: string;
    };
    /** Optional community link (Discord, Reddit, etc.). */
    community: string;
  };

  /**
   * Capacitor plugin defaults (JS-side reference).
   * The authoritative native config is src-capacitor/capacitor.config.json —
   * keep both files in sync, or drive the native config from here via a build script.
   */
  native: {
    ios: {
      contentInset: 'automatic' | 'never' | 'scrollable';
    };
    splashScreen: {
      backgroundColor: string;
      showSpinner: boolean;
      /** Duration of the splash fade-out animation in milliseconds. */
      fadeOutDuration: number;
    };
    pushNotifications: {
      /** Which notification presentation options are shown when the app is in the foreground. */
      presentationOptions: ReadonlyArray<'badge' | 'sound' | 'alert'>;
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

export const appConfig: AppConfig = {
  // ── Identity ───────────────────────────────────────────────────────────────
  name: '{{APP_NAME}}',
  version: '1.0.0',
  bundleId: '{{BUNDLE_ID}}',

  // ── Company ────────────────────────────────────────────────────────────────
  company: {
    name: '{{APP_NAME}}',
    legalName: '{{APP_NAME}}',
    country: '',
    jurisdiction: '',
  },

  // ── Storage keys ───────────────────────────────────────────────────────────
  // Prefix with a short app identifier to prevent key collisions between apps on the same device.
  storageKeys: {
    settings: '{{PROJECT_NAME}}-settings',
    pushToken: '{{PROJECT_NAME}}-push-token',
    pushTokenRegistered: '{{PROJECT_NAME}}-push-token-registered',
  },

  // ── Feature flags ──────────────────────────────────────────────────────────
  features: {
    googleAuth: true,
    appleAuth: true,
    faceId: true,
    guestMode: false,
    pushNotifications: true,
    exampleFeature: false,
  },

  // ── Links ──────────────────────────────────────────────────────────────────
  links: {
    website: 'https://example.com',
    contactEmail: 'legal@example.com',
    supportEmail: 'support@example.com',
    privacyPolicy: 'https://example.com/privacy',
    termsOfService: 'https://example.com/terms',
    appStore: {
      ios: '', // fill in after publishing to the App Store
      android: '', // fill in after publishing to Google Play
    },
    community: '',
  },

  // ── Native / Capacitor ─────────────────────────────────────────────────────
  // Mirror of src-capacitor/capacitor.config.json — update both files together.
  native: {
    ios: {
      contentInset: 'never',
    },
    splashScreen: {
      backgroundColor: '#000000',
      showSpinner: false,
      fadeOutDuration: 250,
    },
    pushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};
