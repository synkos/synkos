import { useRouter } from 'vue-router';

/**
 * Pointer-event handlers that implement the iOS edge-swipe-back gesture:
 * a horizontal swipe starting within `edgeWidth` pixels of the left edge
 * pops the current route when the swipe passes the distance or velocity
 * threshold. Bind the returned handlers to the element that owns the page
 * area (typically the slide wrapper inside `MainLayout`).
 *
 * The composable does not animate the page mid-gesture — Vue Router's pop
 * + the standard `nav-push-back` transition handle the visual on release.
 * Mid-drag tracking (the page following the finger) is a future
 * enhancement; the gesture as-is is already discoverable and feels close
 * to native on real devices.
 *
 * @example
 * const edgeSwipe = useEdgeSwipeBack({ enabled: () => isSubRoute.value });
 * <div class="slide-wrapper" v-on="edgeSwipe.handlers">...</div>
 */
export interface UseEdgeSwipeBackOptions {
  /** How far from the left edge the gesture must start. Default `24` px. */
  edgeWidth?: number;
  /**
   * Fraction of the element width the swipe must cover to count as
   * complete on release. Default `0.5` (50%). Velocity can also trigger
   * completion below this distance — see `velocityThreshold`.
   */
  thresholdRatio?: number;
  /** Min release velocity (px/ms) to trigger pop below the distance threshold. Default `0.5`. */
  velocityThreshold?: number;
  /**
   * Returns whether the gesture is currently armed. Use this to gate the
   * gesture by route depth (e.g. only on sub-routes). Defaults to always on.
   */
  enabled?: () => boolean;
  /** Action to perform on completed swipe. Defaults to `router.back()`. */
  onSwipe?: () => void;
}

export interface EdgeSwipeBindings {
  pointerdown: (e: PointerEvent) => void;
  pointermove: (e: PointerEvent) => void;
  pointerup: (e: PointerEvent) => void;
  pointercancel: (e: PointerEvent) => void;
}

export function useEdgeSwipeBack(options: UseEdgeSwipeBackOptions = {}): {
  handlers: EdgeSwipeBindings;
} {
  const router = useRouter();
  const edgeWidth = options.edgeWidth ?? 24;
  const thresholdRatio = options.thresholdRatio ?? 0.5;
  const velocityThreshold = options.velocityThreshold ?? 0.5;
  const enabled = options.enabled ?? (() => true);
  const onSwipe = options.onSwipe ?? (() => router.back());

  // Per-pointer tracking: supports multi-touch without aliasing.
  type Track = { x: number; t: number; targetWidth: number };
  const active = new Map<number, Track>();

  function pointerdown(e: PointerEvent) {
    if (!enabled()) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const target = e.currentTarget as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    if (localX > edgeWidth) return;
    active.set(e.pointerId, { x: e.clientX, t: e.timeStamp, targetWidth: rect.width });
  }

  function pointermove(_e: PointerEvent) {
    // Reserved for future mid-drag visual tracking (page following finger).
    // The current implementation only acts on release, so move is a no-op.
  }

  function pointerup(e: PointerEvent) {
    const track = active.get(e.pointerId);
    if (!track) return;
    active.delete(e.pointerId);

    const dx = e.clientX - track.x;
    const dt = Math.max(1, e.timeStamp - track.t);
    const velocity = dx / dt;

    const distancePassed = dx > track.targetWidth * thresholdRatio;
    const velocityPassed = dx > 24 && velocity > velocityThreshold;

    if (distancePassed || velocityPassed) {
      onSwipe();
    }
  }

  function pointercancel(e: PointerEvent) {
    active.delete(e.pointerId);
  }

  return {
    handlers: { pointerdown, pointermove, pointerup, pointercancel },
  };
}
