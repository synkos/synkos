// ── Per-tab navigation history ─────────────────────────────────────────────
//
// iOS UITabBarController gives every tab its own UINavigationController stack,
// so switching from /projects/123 → /workers → /projects lands you back on
// /projects/123, not on the projects list. Vue Router's history is global,
// not per-tab, so we mirror the iOS behaviour with a tiny in-memory map of
// `tabPath → deepest visited path within that tab`.
//
// Disabled by default for backwards compatibility (current behaviour is
// "tap a tab and you always land on its root"). Apps opt in via
// `setupSynkosRouter({ preserveTabHistory: true })`.

const tabHistory = new Map<string, string>();
let _enabled = false;

export function enableTabHistory(): void {
  _enabled = true;
}

export function isTabHistoryEnabled(): boolean {
  return _enabled;
}

/** Records that `currentPath` is the deepest path visited in `tabPath`'s stack. */
export function recordTabPath(tabPath: string, currentPath: string): void {
  if (!_enabled) return;
  tabHistory.set(tabPath, currentPath);
}

/** Returns the stored deep path for a tab, or undefined if none / not enabled. */
export function getStoredTabPath(tabPath: string): string | undefined {
  if (!_enabled) return undefined;
  return tabHistory.get(tabPath);
}

/** Clears history for one tab, or all tabs if `tabPath` is omitted. */
export function clearTabHistory(tabPath?: string): void {
  if (tabPath) tabHistory.delete(tabPath);
  else tabHistory.clear();
}
