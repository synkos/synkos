import * as fs from 'node:fs';
import * as path from 'node:path';

// We deliberately avoid `import type { UserConfig } from 'vite'` here so the
// helper compiles cleanly against any Vite major (Quasar 2 uses 6, future
// Quasar may use 7+). The structural type below covers only the fields we
// touch and is assignable from real `UserConfig` in any modern Vite.
interface ViteConfShape {
  resolve?: {
    preserveSymlinks?: boolean;
    dedupe?: string[];
  };
  optimizeDeps?: {
    include?: string[];
  };
  server?: {
    warmup?: {
      clientFiles?: string[];
    };
  };
}

/**
 * Synkos's Vite helpers — single source of truth for the dependency-pre-
 * bundle list and tab-page warmup logic that every Synkos app needs in its
 * `quasar.config.ts`. Without these, Vite discovers tab pages and Capacitor
 * plugins on first navigation, triggers a dep optimization re-run and the
 * dev server reloads — visible to the user as a white flash on the first
 * tab change. The flash is the symptom every Synkos consumer hits, so the
 * fix lives in the framework.
 *
 * Apps wire it up with one call inside Quasar's `extendViteConf`:
 *
 * @example
 * import { synkosExtendViteConf } from 'synkos/vite'
 *
 * build: {
 *   extendViteConf(viteConf) {
 *     synkosExtendViteConf(viteConf)
 *   }
 * }
 */

/**
 * Vite `optimizeDeps.include` entries that every Synkos app needs.
 * Skipping any of these makes Vite discover them lazily, which on first
 * navigation triggers a dep optimization re-run + page reload.
 */
export const SYNKOS_OPTIMIZE_DEPS: readonly string[] = [
  // Workspace symlinks: Vite skips them by default, which breaks
  // cssInjectedByJs side-effects.
  '@synkos/ui',
  '@synkos/client',

  // vue-i18n must be pre-bundled as a unit to prevent the
  // `@vue/shared → @vue/runtime-core` circular dependency from resolving
  // out-of-order ("isFunction is not a function" at startup).
  'vue-i18n',
  '@intlify/core-base',
  '@intlify/shared',
  '@intlify/message-compiler',
  '@vue/devtools-api',

  // Capacitor plugins: every one of these is dynamic-imported by Synkos
  // somewhere; declaring them up front avoids the first-navigation reload.
  '@capacitor/core',
  '@capacitor/haptics',
  '@capacitor/app',
  '@capacitor/preferences',
  '@capacitor/splash-screen',
  '@capacitor/push-notifications',
  '@capacitor/keyboard',
  '@capacitor/status-bar',
];

/**
 * Vite `resolve.dedupe` entries that guarantee a single instance of each
 * shared singleton across workspace packages — without this Pinia and Vue
 * can resolve to two different paths and break activePinia / app injection.
 */
export const SYNKOS_DEDUPE: readonly string[] = ['vue', 'vue-router', 'pinia', 'vue-i18n'];

interface WarmupOptions {
  /** Project root (where `package.json` lives). Defaults to `process.cwd()`. */
  root?: string;
  /** Extra files to add on top of the auto-discovered ones. */
  extraFiles?: string[];
}

/**
 * Auto-discovers tab pages from the conventional `src/features/<area>/pages/<X>Page.vue`
 * layout (plus the well-known auth & profile pages) and returns the list
 * suitable for `server.warmup.clientFiles`. Pre-transforming these at dev
 * server startup eliminates the chunk-discovery reload flash that shows up
 * the first time the user changes tabs.
 *
 * If your repo doesn't follow the convention or a feature lives elsewhere,
 * pass extra paths via `extraFiles`.
 */
export function synkosWarmupFiles(opts: WarmupOptions = {}): string[] {
  const root = opts.root ?? process.cwd();
  const found = new Set<string>();

  // Conventional auth & profile pages.
  const conventional = [
    './src/pages/auth/LoginPage.vue',
    './src/pages/auth/UsernamePage.vue',
    './src/pages/settings/ProfilePage.vue',
  ];
  for (const rel of conventional) {
    if (fileExists(path.join(root, rel))) found.add(rel);
  }

  // Auto-discover anything matching `src/features/*/pages/*Page.vue`.
  const featuresRoot = path.join(root, 'src/features');
  if (directoryExists(featuresRoot)) {
    for (const feature of safeReadDir(featuresRoot)) {
      if (!feature.isDirectory()) continue;
      const pagesDir = path.join(featuresRoot, feature.name, 'pages');
      if (!directoryExists(pagesDir)) continue;
      for (const f of safeReadDir(pagesDir)) {
        if (f.isFile() && f.name.endsWith('Page.vue')) {
          found.add(`./src/features/${feature.name}/pages/${f.name}`);
        }
      }
    }
  }

  for (const extra of opts.extraFiles ?? []) {
    found.add(extra);
  }

  return Array.from(found);
}

interface ExtendOptions {
  /** Extra packages to add to `optimizeDeps.include`. */
  extraOptimizeDeps?: string[];
  /** Extra entries to add to `resolve.dedupe`. */
  extraDedupe?: string[];
  /** Extra files to pre-transform on dev server startup. */
  extraWarmupFiles?: string[];
  /** Override the project root used to discover tab pages. Defaults to `process.cwd()`. */
  root?: string;
}

/**
 * Applies Synkos's recommended Vite settings to a Vite config object.
 * Mutates `viteConf` in place so it slots straight into Quasar's
 * `extendViteConf` callback — which is exactly the integration point
 * every Synkos app already has.
 */
export function synkosExtendViteConf(viteConf: ViteConfShape, opts: ExtendOptions = {}): void {
  if (!viteConf.resolve) viteConf.resolve = {};
  viteConf.resolve.preserveSymlinks = true;
  viteConf.resolve.dedupe = uniq([
    ...(viteConf.resolve.dedupe ?? []),
    ...SYNKOS_DEDUPE,
    ...(opts.extraDedupe ?? []),
  ]);

  if (!viteConf.optimizeDeps) viteConf.optimizeDeps = {};
  viteConf.optimizeDeps.include = uniq([
    ...(viteConf.optimizeDeps.include ?? []),
    ...SYNKOS_OPTIMIZE_DEPS,
    ...(opts.extraOptimizeDeps ?? []),
  ]);

  if (!viteConf.server) viteConf.server = {};
  const existingWarmup = viteConf.server.warmup?.clientFiles ?? [];
  viteConf.server.warmup = {
    ...(viteConf.server.warmup ?? {}),
    clientFiles: uniq([
      ...existingWarmup,
      ...synkosWarmupFiles({ root: opts.root, extraFiles: opts.extraWarmupFiles }),
    ]),
  };
}

// ── helpers ────────────────────────────────────────────────────────────────────

function fileExists(absPath: string): boolean {
  try {
    return fs.statSync(absPath).isFile();
  } catch {
    return false;
  }
}

function directoryExists(absPath: string): boolean {
  try {
    return fs.statSync(absPath).isDirectory();
  } catch {
    return false;
  }
}

function safeReadDir(absPath: string): fs.Dirent[] {
  try {
    return fs.readdirSync(absPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
