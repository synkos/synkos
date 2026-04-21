import { ref, computed } from 'vue';

/**
 * Rubber-band drag behaviour for bottom sheets.
 * Produces an exponentially-damped vertical displacement so dragging
 * feels native (iOS-like) without the sheet actually dismissing.
 */
export function useSheetDrag() {
  const sheetTranslateY = ref(0);
  const sheetSnapping = ref(false);
  let dragStartY = 0;

  // Spring curve used both for drag-release and bounce-in
  const sheetDragStyle = computed(() => ({
    transform: `translateY(${sheetTranslateY.value}px)`,
    transition: sheetSnapping.value ? 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
  }));

  function onDragStart(e: TouchEvent) {
    dragStartY = e.touches[0]!.clientY;
    sheetSnapping.value = false;
  }

  function onDragMove(e: TouchEvent) {
    const delta = e.touches[0]!.clientY - dragStartY;
    // Exponential rubber band: f(Δ) = MAX × (1 − e^(−|Δ| / k))
    //   MAX → displacement ceiling in px
    //   k   → decay constant; raise to make the base speed slower
    const MAX = 20;
    const k = 55;
    const damped = Math.sign(delta) * MAX * (1 - Math.exp(-Math.abs(delta) / k));
    sheetTranslateY.value = damped;
  }

  function onDragEnd() {
    sheetSnapping.value = true;
    sheetTranslateY.value = 0;
  }

  return { sheetDragStyle, onDragStart, onDragMove, onDragEnd };
}
