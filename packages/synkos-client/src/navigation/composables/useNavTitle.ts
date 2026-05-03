import { onActivated, onDeactivated, onUnmounted } from 'vue';
import { setNavTitle } from '../internal/nav-state.js';

export function useNavTitle(title: string) {
  const owner = Symbol();
  const apply = () => setNavTitle(title, owner);
  const clear = () => setNavTitle(null, owner);

  apply();
  onActivated(apply);
  onDeactivated(clear);
  onUnmounted(clear);
}
