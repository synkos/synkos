import { ref, shallowRef } from 'vue';

export interface NavTrailingAction {
  icon: string;
  label?: string;
  onClick: () => void;
}

export const navTrailingAction = shallowRef<NavTrailingAction | null>(null);
export const navTitleOverride = ref<string | null>(null);

/**
 * Active Vue `<transition>` name applied to the route swap inside MainLayout.
 * Owned by the router guard set up in `setupSynkosRouter` / `createSynkosRouter`,
 * which computes the direction by comparing tab indices on every navigation.
 *
 * Default `'tab-fade'` so the very first mount (deep link, cold start) doesn't
 * slide-from-right as if it had come from a previous tab.
 */
export const tabTransitionName = ref<string>('tab-fade');

// ── Owner tracking ─────────────────────────────────────────────────────────
//
// Vue's `<router-view>` swap mounts the new component (running its `setup`)
// BEFORE unmounting the old one. Without owner-checked clears, the leaving
// page's `onUnmounted` would blank a title the entering page just set.
//
// Each call site (a `useNavTitle()` instance, an `AppPageLargeTitle`) passes
// a `Symbol` token. `setX(null, owner)` only clears if `owner` still matches
// — late cleanups from a leaving component become no-ops.
let titleOwner: symbol | null = null;
let trailingOwner: symbol | null = null;

export function setNavTrailing(action: NavTrailingAction | null, owner?: symbol) {
  if (action === null) {
    if (owner !== undefined && trailingOwner !== owner) return;
    navTrailingAction.value = null;
    trailingOwner = null;
    return;
  }
  navTrailingAction.value = action;
  trailingOwner = owner ?? null;
}

export function setNavTitle(title: string | null, owner?: symbol) {
  if (title === null) {
    if (owner !== undefined && titleOwner !== owner) return;
    navTitleOverride.value = null;
    titleOwner = null;
    return;
  }
  navTitleOverride.value = title;
  titleOwner = owner ?? null;
}

export function setTabTransitionName(name: string) {
  tabTransitionName.value = name;
}
