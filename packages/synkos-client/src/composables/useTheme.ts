export type AppTheme = 'light' | 'dark' | 'system';

// Module-level media query — single listener, no per-component cleanup needed
const mql =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

let _activeTheme: AppTheme = 'system';

function getSystemResolved(): 'light' | 'dark' {
  return mql?.matches ? 'dark' : 'light';
}

function applyToDOM(resolved: 'light' | 'dark') {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = resolved;
  }
}

mql?.addEventListener('change', () => {
  if (_activeTheme === 'system') {
    applyToDOM(getSystemResolved());
  }
});

function applyTheme(theme: AppTheme) {
  _activeTheme = theme;
  applyToDOM(theme === 'system' ? getSystemResolved() : theme);
}

export function useTheme() {
  return { applyTheme };
}
