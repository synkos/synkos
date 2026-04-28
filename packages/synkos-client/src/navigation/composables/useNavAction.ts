import { onUnmounted } from 'vue';
import { setNavTrailing } from '../internal/nav-state.js';

export interface NavActionOptions {
  icon: string;
  label?: string;
  onClick: () => void;
}

export function useNavAction(options: NavActionOptions) {
  setNavTrailing(options);
  onUnmounted(() => setNavTrailing(null));
}
