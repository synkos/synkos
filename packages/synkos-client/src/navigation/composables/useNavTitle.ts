import { onUnmounted } from 'vue';
import { setNavTitle } from '../internal/nav-state.js';

export function useNavTitle(title: string) {
  setNavTitle(title);
  onUnmounted(() => setNavTitle(null));
}
