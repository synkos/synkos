import { EventEmitter } from 'events';
import { createLogger } from '@/utils/logger';

// ── Event map ─────────────────────────────────────────────────────────────────

/**
 * All events emitted by core services, grouped by domain.
 *
 * Extend this map from a project via declaration merging in
 * `bootstrap/listeners.ts` if the project needs custom events:
 *
 * @example
 * declare module "@/events/core-events" {
 *   interface CoreEventMap {
 *     "game:match_completed": { userId: string; score: number };
 *   }
 * }
 */
export interface CoreEventMap {
  // ── User lifecycle ───────────────────────────────────────────────────────────

  /** Fired once after a new user document is created, regardless of auth provider. */
  'user:registered': {
    userId: string;
    email: string;
    provider: 'local' | 'google' | 'apple';
  };

  /** Fired on every successful authentication (login or OAuth). */
  'user:login': {
    userId: string;
    provider: 'local' | 'google' | 'apple';
  };

  /** Fired when a single device session is revoked. */
  'user:logout': {
    userId: string;
  };

  /** Fired when all sessions for a user are revoked at once. */
  'user:logout_all': {
    userId: string;
  };

  /** Fired when the user successfully verifies their email address. */
  'user:email_verified': {
    userId: string;
    email: string;
  };

  /** Fired when the user successfully resets their password via OTP. */
  'user:password_reset': {
    userId: string;
  };

  // ── Profile mutations ────────────────────────────────────────────────────────

  /** Fired when the display name is updated. */
  'user:name_changed': {
    userId: string;
    newName: string;
  };

  /** Fired the first time a user sets their username (onboarding). */
  'user:username_set': {
    userId: string;
    username: string;
  };

  /** Fired when an existing username is replaced with a new one. */
  'user:username_changed': {
    userId: string;
    newUsername: string;
  };

  /** Fired when an avatar image is uploaded or replaced. */
  'user:photo_updated': {
    userId: string;
    avatarUrl: string;
  };

  /** Fired when the avatar is removed (falls back to default). */
  'user:photo_removed': {
    userId: string;
  };

  /** Fired when the user changes their password via the profile settings. */
  'user:password_changed': {
    userId: string;
  };

  // ── Account lifecycle ────────────────────────────────────────────────────────

  /** Fired when the user requests account deletion (30-day grace period begins). */
  'user:deletion_requested': {
    userId: string;
    scheduledAt: Date;
  };

  /** Fired when a pending deletion is cancelled during the grace period. */
  'user:deletion_cancelled': {
    userId: string;
  };

  /** Fired after all user data has been permanently removed from the database. */
  'user:deleted': {
    userId: string;
  };
}

// ── Listener type ─────────────────────────────────────────────────────────────

type Listener<T> = (payload: T) => void | Promise<void>;

// ── Event bus ─────────────────────────────────────────────────────────────────

class CoreEventBus {
  private readonly emitter = new EventEmitter();
  private readonly log = createLogger('events');

  /**
   * Wrap the raw listener so that:
   *  - Async listener errors are caught and logged (never crash the process).
   *  - Sync listener errors are also caught and logged.
   *
   * Uses a WeakMap so the original reference can be used to unsubscribe with off().
   */
  private readonly wrapped = new WeakMap<Listener<unknown>, (payload: unknown) => void>();

  on<K extends keyof CoreEventMap>(event: K, listener: Listener<CoreEventMap[K]>): this {
    const safeListener = (payload: unknown) => {
      try {
        const result = (listener as Listener<unknown>)(payload);
        if (result instanceof Promise) {
          result.catch((err) => this.log.error({ err, event }, 'Async event listener threw'));
        }
      } catch (err) {
        this.log.error({ err, event }, 'Sync event listener threw');
      }
    };

    this.wrapped.set(listener as Listener<unknown>, safeListener);
    this.emitter.on(event as string, safeListener);
    return this;
  }

  once<K extends keyof CoreEventMap>(event: K, listener: Listener<CoreEventMap[K]>): this {
    const safeListener = (payload: unknown) => {
      try {
        const result = (listener as Listener<unknown>)(payload);
        if (result instanceof Promise) {
          result.catch((err) => this.log.error({ err, event }, 'Async once-listener threw'));
        }
      } catch (err) {
        this.log.error({ err, event }, 'Sync once-listener threw');
      }
    };

    this.emitter.once(event as string, safeListener);
    return this;
  }

  off<K extends keyof CoreEventMap>(event: K, listener: Listener<CoreEventMap[K]>): this {
    const safeListener = this.wrapped.get(listener as Listener<unknown>);
    if (safeListener) {
      this.emitter.off(event as string, safeListener);
      this.wrapped.delete(listener as Listener<unknown>);
    }
    return this;
  }

  /**
   * Emit an event synchronously.
   * All registered listeners run before this returns.
   * Async listeners run in the background — errors are logged, never thrown.
   */
  emit<K extends keyof CoreEventMap>(event: K, payload: CoreEventMap[K]): void {
    this.emitter.emit(event as string, payload);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const coreEvents = new CoreEventBus();
