export interface AppConfig {
  /** Human-readable app name surfaced in the UI (nav bar, login, about). */
  name: string;
  /** Semantic version shown in the About screen. */
  version: string;
  /** Native bundle/package identifier — must match capacitor.config.json. */
  bundleId: string;

  company: {
    name: string;
    legalName: string;
    country: string;
    jurisdiction: string;
  };

  /**
   * localStorage / Capacitor Preferences key names.
   * Prefix with a short app identifier to avoid collisions between apps on
   * the same device.
   */
  storageKeys: {
    settings: string;
    pushToken: string;
    pushTokenRegistered: string;
  };

  features: {
    /** Google OAuth sign-in button. */
    googleAuth: boolean;
    /** Apple Sign In (iOS only). */
    appleAuth: boolean;
    /** Face ID / Touch ID biometric sign-in. */
    faceId: boolean;
    /** Allow unauthenticated browsing as a guest. */
    guestMode: boolean;
    /** Push notifications via APNs (iOS) / FCM (Android). */
    pushNotifications: boolean;
    /** Extend with your own feature flags via module augmentation. */
    [key: string]: boolean;
  };

  links: {
    website: string;
    /** Email for legal / privacy inquiries. */
    contactEmail: string;
    /** Email for user support. */
    supportEmail: string;
    privacyPolicy: string;
    termsOfService: string;
    appStore: {
      ios: string;
      android: string;
    };
    community: string;
  };

  native: {
    ios: {
      contentInset: 'automatic' | 'never' | 'scrollable';
    };
    splashScreen: {
      backgroundColor: string;
      showSpinner: boolean;
      fadeOutDuration: number;
    };
    pushNotifications: {
      presentationOptions: ReadonlyArray<'badge' | 'sound' | 'alert'>;
    };
  };
}
