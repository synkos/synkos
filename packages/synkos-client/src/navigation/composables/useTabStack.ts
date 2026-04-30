import { computed, type ComputedRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getTabConfig } from '../internal/tab-config.js';
import {
  isTabStacksEnabled,
  popTabStack,
  useTabStacksRef,
} from '../internal/tab-stacks.js';

/**
 * Reactive view over the active tab's navigation stack. Use it to render
 * stack-depth-aware UI (a breadcrumb trail, a "back to top" button that
 * unwinds the whole stack at once) or to drive programmatic pops.
 *
 * Requires `setupSynkosRouter({ stackNavigation: true })`. With stack
 * navigation disabled, `stack` is always `[]`, `canPop` is always
 * `false`, and `pop()` falls back to a classic `router.back()`.
 *
 * @example
 * <script setup lang="ts">
 * import { useTabStack } from '@synkos/client'
 * const { stack, canPop, depth, pop } = useTabStack()
 * </script>
 *
 * <template>
 *   <p>Depth in this tab: {{ depth }}</p>
 *   <AppButton :disabled="!canPop" @click="pop">Back</AppButton>
 * </template>
 */
export interface UseTabStackResult {
  /** Paths in the active tab's stack, root first. Empty when disabled. */
  stack: ComputedRef<readonly string[]>;
  /** True iff there's at least one entry above the root. */
  canPop: ComputedRef<boolean>;
  /** How deep we are inside the active tab — `0` at root, `n` after `n` pushes. */
  depth: ComputedRef<number>;
  /**
   * Pops one entry off the active tab's stack and navigates to the new
   * top. Falls back to `router.back()` when stack navigation is
   * disabled or there's nothing in the stack to pop.
   */
  pop(): void;
}

export function useTabStack(): UseTabStackResult {
  const route = useRoute();
  const router = useRouter();
  const stacksRef = useTabStacksRef();

  const currentTabPath = computed<string>(() => {
    const tabs = getTabConfig();
    let best = '';
    let bestLen = -1;
    for (const t of tabs) {
      if (t.path === '/') {
        if ((route.path === '/' || route.path === '') && bestLen < 0) {
          best = '/';
          bestLen = 0;
        }
        continue;
      }
      if (route.path === t.path || route.path.startsWith(t.path + '/')) {
        if (t.path.length > bestLen) {
          best = t.path;
          bestLen = t.path.length;
        }
      }
    }
    return best;
  });

  const stack = computed<readonly string[]>(
    () => stacksRef.value.get(currentTabPath.value) ?? []
  );
  const canPop = computed(() => stack.value.length > 1);
  const depth = computed(() => Math.max(0, stack.value.length - 1));

  function pop(): void {
    void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);

    if (isTabStacksEnabled() && currentTabPath.value) {
      const newTop = popTabStack(currentTabPath.value);
      if (newTop !== null) {
        void router.replace(newTop);
        return;
      }
    }

    void router.back();
  }

  return { stack, canPop, depth, pop };
}
