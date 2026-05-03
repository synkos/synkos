import { onActivated, onDeactivated, onUnmounted } from 'vue';
import { setNavTrailing } from '../internal/nav-state.js';

export interface NavActionOptions {
  icon: string;
  label?: string;
  onClick: () => void;
}

export function useNavAction(options: NavActionOptions) {
  const owner = Symbol();
  const apply = () => setNavTrailing(options, owner);
  const clear = () => setNavTrailing(null, owner);

  apply();
  onActivated(apply);
  onDeactivated(clear);
  onUnmounted(clear);
}
