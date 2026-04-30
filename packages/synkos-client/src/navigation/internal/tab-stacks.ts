import { ref, type Ref } from 'vue';

// ── Per-tab navigation stacks ──────────────────────────────────────────────
//
// iOS UITabBarController gives every tab its own UINavigationController stack.
// Switching from /projects/123 → /workers → /projects lands you back on
// /projects/123 (top of the projects stack), not on the projects list. Vue
// Router's history is global, not per-tab, so we mirror the iOS model with a
// reactive map of `tabRootPath → ordered array of paths visited inside that
// stack`.
//
// Disabled by default for backwards compatibility. Apps opt in via
// `setupSynkosRouter({ stackNavigation: true })`. When enabled:
//
// - A forward navigation appends to the active tab's stack.
// - A navigation to a path already present in the stack truncates the stack
//   to that path (back navigation).
// - `MainLayout.goBack()` and `useEdgeSwipeBack` pop the active tab's stack
//   and `router.replace()` to the new top instead of using
//   `router.back()` — back-navigation becomes tab-local rather than global.
// - Switching to a previously-visited tab restores the stack's top.
//
// The map is held in a `ref` so a public `useTabStack()` composable can
// expose it reactively (depth indicators, breadcrumbs, …) without any
// component having to subscribe to a custom event.

let _enabled = false;

const stacks = ref<Map<string, string[]>>(new Map());

export function enableTabStacks(): void {
  _enabled = true;
}

export function isTabStacksEnabled(): boolean {
  return _enabled;
}

/**
 * Records a navigation under `tabPath`'s stack. Idempotent for the top of
 * the stack, truncates on re-entry to a previously-visited path, appends
 * otherwise.
 */
export function recordTabNavigation(tabPath: string, currentPath: string): void {
  if (!_enabled) return;
  const stack = stacks.value.get(tabPath) ?? [];
  const top = stack[stack.length - 1];
  if (top === currentPath) return;

  let next: string[];
  const existingIdx = stack.indexOf(currentPath);
  if (existingIdx >= 0) {
    next = stack.slice(0, existingIdx + 1);
  } else {
    next = [...stack, currentPath];
  }

  const m = new Map(stacks.value);
  m.set(tabPath, next);
  stacks.value = m;
}

/** Returns the deepest path stored in the tab's stack, or undefined when empty / disabled. */
export function getTabStackTop(tabPath: string): string | undefined {
  if (!_enabled) return undefined;
  const stack = stacks.value.get(tabPath);
  return stack && stack.length > 0 ? stack[stack.length - 1] : undefined;
}

/**
 * Pops the top of the tab's stack and returns the new top. Returns null
 * (and leaves the stack untouched) when there's nothing to pop — the stack
 * has only the root entry, the tab isn't tracked yet, or the feature is
 * disabled.
 */
export function popTabStack(tabPath: string): string | null {
  if (!_enabled) return null;
  const stack = stacks.value.get(tabPath);
  if (!stack || stack.length <= 1) return null;
  const next = stack.slice(0, -1);
  const m = new Map(stacks.value);
  m.set(tabPath, next);
  stacks.value = m;
  return next[next.length - 1] ?? null;
}

/** Read-only view of a tab's stack, root first. Empty array when disabled. */
export function getTabStack(tabPath: string): readonly string[] {
  return stacks.value.get(tabPath) ?? [];
}

/** Clears one tab's stack, or all of them if `tabPath` is omitted. */
export function clearTabStack(tabPath?: string): void {
  if (!tabPath) {
    stacks.value = new Map();
    return;
  }
  const m = new Map(stacks.value);
  m.delete(tabPath);
  stacks.value = m;
}

/** Reactive ref consumed by the public `useTabStack()` composable. */
export function useTabStacksRef(): Ref<Map<string, string[]>> {
  return stacks;
}
