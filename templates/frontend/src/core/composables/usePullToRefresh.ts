import { ref, computed, onMounted } from 'vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const INDICATOR_H = 52;
const THRESHOLD = 46; // visual px to trigger (~85px raw drag with resistance)

type PullState = 'idle' | 'pulling' | 'refreshing';

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const pullState = ref<PullState>('idle');
  const pullY = ref(0);
  const isSnapping = ref(false);

  let scrollEl: HTMLElement | null = null;
  let startY = 0;

  function applyResistance(raw: number): number {
    return (INDICATOR_H + 28) * (1 - Math.exp(-raw / 90));
  }

  const wrapperStyle = computed(() => {
    if (pullState.value === 'idle' && !isSnapping.value) return {};
    const settling = pullState.value === 'refreshing' || isSnapping.value;
    return {
      transform: `translateY(${pullY.value}px)`,
      transition: settling ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
      willChange: 'transform',
    };
  });

  const arrowStyle = computed(() => ({
    transform: `rotate(${Math.min((pullY.value / THRESHOLD) * 180, 180)}deg)`,
    opacity: String(Math.min(1, pullY.value / (THRESHOLD * 0.4))),
  }));

  function onTouchStart(e: TouchEvent) {
    if (pullState.value === 'refreshing') return;
    startY = e.touches[0]?.clientY ?? 0;
  }

  function onTouchMove(e: TouchEvent) {
    if (pullState.value === 'refreshing') return;
    if (!scrollEl || scrollEl.scrollTop > 0) return;
    const touch = e.touches[0];
    if (!touch) return;
    const delta = touch.clientY - startY;
    if (delta <= 0) {
      if (pullState.value === 'pulling') snapBack();
      return;
    }
    pullState.value = 'pulling';
    pullY.value = applyResistance(delta);
  }

  function onTouchEnd() {
    if (pullState.value !== 'pulling') return;
    if (pullY.value >= THRESHOLD) {
      void triggerRefresh();
    } else {
      snapBack();
    }
  }

  function onTouchCancel() {
    if (pullState.value === 'pulling') snapBack();
  }

  function snapBack() {
    isSnapping.value = true;
    pullState.value = 'idle';
    pullY.value = 0;
    setTimeout(() => {
      isSnapping.value = false;
    }, 320);
  }

  async function triggerRefresh() {
    void Haptics.impact({ style: ImpactStyle.Medium });
    pullState.value = 'refreshing';
    pullY.value = INDICATOR_H;
    await Promise.all([onRefresh(), new Promise<void>((r) => setTimeout(r, 1000))]);
    snapBack();
  }

  onMounted(() => {
    scrollEl = document.querySelector('.slide-wrapper') as HTMLElement;
  });

  return {
    pullState,
    wrapperStyle,
    arrowStyle,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
  };
}
