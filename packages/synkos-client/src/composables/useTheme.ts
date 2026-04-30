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
  void syncNativeStatusBar(resolved);
}

// Sync the native iOS / Android status bar style with the resolved theme so
// the system icons stay legible. Dark theme → light icons; light theme → dark
// icons. The plugin is loaded via dynamic import so apps without
// `@capacitor/status-bar` installed (web, simple SPAs) just get a no-op.
async function syncNativeStatusBar(resolved: 'light' | 'dark'): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const [{ Capacitor }, { StatusBar, Style }] = await Promise.all([
      import('@capacitor/core'),
      import('@capacitor/status-bar'),
    ]);
    if (!Capacitor.isNativePlatform()) return;
    await StatusBar.setStyle({ style: resolved === 'dark' ? Style.Dark : Style.Light });
  } catch {
    // Plugin not installed or platform unsupported — leave the system
    // status bar alone. This is the expected path on web.
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
