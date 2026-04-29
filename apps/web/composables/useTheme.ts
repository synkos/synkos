type Theme = 'dark' | 'light';

const THEME_KEY = 'synkos_theme';

export function useTheme() {
  const theme = useState<Theme>('synkos:theme', () => 'dark');

  function apply(next: Theme) {
    theme.value = next;
    if (import.meta.client) {
      document.documentElement.dataset.theme = next;
      localStorage.setItem(THEME_KEY, next);
    }
  }

  function toggle() {
    apply(theme.value === 'dark' ? 'light' : 'dark');
  }

  function init() {
    if (!import.meta.client) return;
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === 'dark' || stored === 'light') {
      apply(stored);
      return;
    }
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    apply(prefersLight ? 'light' : 'dark');
  }

  return { theme: readonly(theme), apply, toggle, init };
}
