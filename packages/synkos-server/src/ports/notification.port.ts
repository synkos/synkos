/**
 * Contract that every push notification adapter must implement.
 *
 * The core only depends on this interface — never on a concrete provider (APNs, FCM, etc.).
 * Projects provide their implementation via setNotificationAdapter() in bootstrap/adapters.ts.
 */
export interface PushPayload {
  title: string;
  body: string;
  /** Custom data included in the notification payload */
  data?: Record<string, unknown>;
  /** Badge count */
  badge?: number;
  /** Notification sound — defaults to "default" */
  sound?: string;
}

export interface NotificationPort {
  /**
   * Sends a push notification to a single device token.
   * Resolves on success, rejects on provider error.
   */
  sendToDevice(token: string, payload: PushPayload): Promise<void>;

  /**
   * Sends the same notification to multiple device tokens in parallel.
   * Individual failures are logged but do NOT reject the returned promise.
   */
  sendToMany(tokens: string[], payload: PushPayload): Promise<void>;
}
