import { ref, computed } from 'vue';

export function useSheetDrag() {
  const sheetTranslateY = ref(0);
  const sheetSnapping = ref(false);
  let dragStartY = 0;

  const sheetDragStyle = computed(() => ({
    transform: `translateY(${sheetTranslateY.value}px)`,
    transition: sheetSnapping.value
      ? 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'none',
  }));

  function onDragStart(e: TouchEvent) {
    dragStartY = e.touches[0]!.clientY;
    sheetSnapping.value = false;
  }

  function onDragMove(e: TouchEvent) {
    const delta = e.touches[0]!.clientY - dragStartY;
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
