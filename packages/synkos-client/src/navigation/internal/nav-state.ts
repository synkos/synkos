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

export function setNavTrailing(action: NavTrailingAction | null) {
  navTrailingAction.value = action;
}

export function setNavTitle(title: string | null) {
  navTitleOverride.value = title;
}

export function setTabTransitionName(name: string) {
  tabTransitionName.value = name;
}
