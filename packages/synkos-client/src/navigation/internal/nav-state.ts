import { ref, shallowRef } from 'vue';

export interface NavTrailingAction {
  icon: string;
  label?: string;
  onClick: () => void;
}

export const navTrailingAction = shallowRef<NavTrailingAction | null>(null);
export const navTitleOverride = ref<string | null>(null);

export function setNavTrailing(action: NavTrailingAction | null) {
  navTrailingAction.value = action;
}

export function setNavTitle(title: string | null) {
  navTitleOverride.value = title;
}
