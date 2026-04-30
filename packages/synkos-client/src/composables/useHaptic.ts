import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useSettingsStore } from '../stores/settings.store.js';

/**
 * Named haptic events mapped to the `@capacitor/haptics` primitive that best
 * matches the iOS Human Interface Guidelines for that interaction. Centralised
 * so the whole app speaks the same haptic vocabulary and the user's
 * `settings.haptics` preference is honoured everywhere.
 */
export type HapticEvent =
  | 'tab-switch' // light impact — UITabBar tap
  | 'nav-push' // light impact — UINavigationController push
  | 'nav-back' // light impact — UINavigationController pop / back gesture
  | 'select' // light impact — generic selection feedback
  | 'toggle' // light impact — UISwitch flipping
  | 'press' // medium impact — destructive / confirmation press
  | 'long-press' // medium impact — opens UIContextMenu
  | 'success' // notification — operation succeeded
  | 'warning' // notification — recoverable issue surfaced
  | 'error'; // notification — operation failed

const IMPACT_MAP: Record<
  Extract<
    HapticEvent,
    'tab-switch' | 'nav-push' | 'nav-back' | 'select' | 'toggle' | 'press' | 'long-press'
  >,
  ImpactStyle
> = {
  'tab-switch': ImpactStyle.Light,
  'nav-push': ImpactStyle.Light,
  'nav-back': ImpactStyle.Light,
  select: ImpactStyle.Light,
  toggle: ImpactStyle.Light,
  press: ImpactStyle.Medium,
  'long-press': ImpactStyle.Medium,
};

const NOTIFICATION_MAP: Record<Extract<HapticEvent, 'success' | 'warning' | 'error'>, NotificationType> = {
  success: NotificationType.Success,
  warning: NotificationType.Warning,
  error: NotificationType.Error,
};

/**
 * Centralised haptic feedback helper. Honours the user's
 * `settings.haptics` preference and silently swallows runtime errors so a
 * missing or unsupported plugin can't break a UI flow.
 *
 * @example
 * const haptic = useHaptic();
 * function onSave() {
 *   haptic.trigger('press');
 *   await save();
 *   haptic.trigger('success');
 * }
 */
export function useHaptic() {
  const settings = useSettingsStore();

  function trigger(event: HapticEvent): void {
    if (!settings.haptics) return;
    if (event in IMPACT_MAP) {
      const style = IMPACT_MAP[event as keyof typeof IMPACT_MAP];
      void Haptics.impact({ style }).catch(() => undefined);
      return;
    }
    if (event in NOTIFICATION_MAP) {
      const type = NOTIFICATION_MAP[event as keyof typeof NOTIFICATION_MAP];
      void Haptics.notification({ type }).catch(() => undefined);
    }
  }

  return { trigger };
}
