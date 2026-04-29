// Extracts TypeScript public API from @synkos/client and @synkos/ui via TypeDoc
// and renders it as categorized markdown pages under content/en/docs/api/.

import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as td from 'typedoc';
import { renderApiCategoryMd, renderApiIndexMd } from './templates.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const OUT_DIR = resolve(__dirname, '../content/en/docs/api');

// ──────────────────────────────────────────────────────────────────────────────
// Categorization
// ──────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    slug: 'composables',
    title: 'Composables',
    description: 'Reactive primitives that drop into any component setup.',
    match: (name, kind) =>
      kind === td.ReflectionKind.Function &&
      /^use[A-Z]/.test(name) &&
      !['useAuthStore', 'useSettingsStore'].includes(name),
  },
  {
    slug: 'stores',
    title: 'Stores',
    description: 'Pinia stores managing cross-cutting state.',
    match: (name) => name === 'useAuthStore' || name === 'useSettingsStore',
  },
  {
    slug: 'services',
    title: 'Services',
    description: 'Stateless service objects for HTTP and platform integrations.',
    match: (name, kind) => {
      if (/(Service|service)$/.test(name)) return true;
      if (kind === td.ReflectionKind.Function && /^create(Api|ApiClient)/.test(name)) return true;
      if (name === 'getApiClient') return true;
      return false;
    },
  },
  {
    slug: 'router',
    title: 'Router',
    description: 'Factories and helpers for the Synkos navigation layer.',
    match: (name) =>
      ['createSynkosRouter', 'setupSynkosRouter', 'synkosSettingsRoutes'].includes(name),
  },
  {
    slug: 'boot',
    title: 'Boot factories',
    description: 'Factories used in your `boot/synkos.ts` to register the framework with Vue.',
    match: (name) => /^create.*Boot$/.test(name),
  },
  {
    slug: 'utilities',
    title: 'Utilities',
    description: 'Helper functions and runtime accessors.',
    match: (name, kind) => {
      if (kind === td.ReflectionKind.Function && ['getIcon', 'getClientConfig'].includes(name))
        return true;
      if (kind === td.ReflectionKind.Variable && ['icons', 'coreEnUS', 'coreEsES'].includes(name))
        return true;
      return false;
    },
  },
  {
    slug: 'types',
    title: 'Types',
    description: 'Public TypeScript type aliases and interfaces.',
    match: (_name, kind) =>
      kind === td.ReflectionKind.TypeAlias || kind === td.ReflectionKind.Interface,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Type stringification — convert a TypeDoc Type to a readable TS source string.
// ──────────────────────────────────────────────────────────────────────────────

function typeToString(type) {
  if (!type) return 'unknown';
  try {
    return type.toString();
  } catch {
    return 'unknown';
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Reflection → symbol payload (consumed by templates.renderApiCategoryMd)
// ──────────────────────────────────────────────────────────────────────────────

function commentText(comment) {
  if (!comment) return '';
  if (typeof comment.summary === 'string') return comment.summary;
  if (Array.isArray(comment.summary))
    return comment.summary
      .map((p) => p.text ?? '')
      .join('')
      .trim();
  return '';
}

function commentExamples(comment) {
  if (!comment?.blockTags) return [];
  return comment.blockTags
    .filter((t) => t.tag === '@example')
    .map((t) => (Array.isArray(t.content) ? t.content.map((p) => p.text ?? '').join('') : ''))
    .map((s) => s.trim())
    .filter(Boolean);
}

function reflectionToSymbol(refl) {
  const description = commentText(refl.comment);
  const tags = { example: commentExamples(refl.comment) };

  // Functions / methods
  if (refl.kind === td.ReflectionKind.Function && refl.signatures?.length) {
    const sig = refl.signatures[0];
    const params = (sig.parameters ?? [])
      .map((p) => {
        const opt = p.flags?.isOptional ? '?' : '';
        return `${p.name}${opt}: ${typeToString(p.type)}`;
      })
      .join(', ');
    const ret = typeToString(sig.type);
    return {
      name: refl.name,
      kind: 'function',
      signature: `function ${refl.name}(${params}): ${ret}`,
      description: description || commentText(sig.comment),
      tags: { example: tags.example.length ? tags.example : commentExamples(sig.comment) },
    };
  }

  // Classes
  if (refl.kind === td.ReflectionKind.Class) {
    const members = (refl.children ?? [])
      .filter((c) => !c.flags?.isPrivate && !c.flags?.isProtected)
      .filter(
        (c) =>
          c.kind === td.ReflectionKind.Property ||
          c.kind === td.ReflectionKind.Method ||
          c.kind === td.ReflectionKind.Accessor
      )
      .map((c) => {
        if (c.kind === td.ReflectionKind.Method && c.signatures?.length) {
          const sig = c.signatures[0];
          const params = (sig.parameters ?? [])
            .map((p) => `${p.name}${p.flags?.isOptional ? '?' : ''}: ${typeToString(p.type)}`)
            .join(', ');
          return {
            name: `${c.name}(${params})`,
            type: typeToString(sig.type),
            description: commentText(c.comment) || commentText(sig.comment),
          };
        }
        return {
          name: c.name,
          type: typeToString(c.type),
          description: commentText(c.comment),
        };
      });
    return {
      name: refl.name,
      kind: 'class',
      description,
      members,
      tags,
    };
  }

  // Type aliases / interfaces
  if (refl.kind === td.ReflectionKind.TypeAlias || refl.kind === td.ReflectionKind.Interface) {
    let signature;
    if (refl.kind === td.ReflectionKind.TypeAlias && refl.type) {
      signature = `type ${refl.name} = ${typeToString(refl.type)}`;
    } else if (refl.kind === td.ReflectionKind.Interface) {
      const members = (refl.children ?? [])
        .map((c) => `  ${c.name}${c.flags?.isOptional ? '?' : ''}: ${typeToString(c.type)}`)
        .join('\n');
      signature = `interface ${refl.name} {\n${members}\n}`;
    }
    return {
      name: refl.name,
      kind: refl.kind === td.ReflectionKind.Interface ? 'interface' : 'type',
      signature,
      description,
      tags,
    };
  }

  // Variables (constants, exported objects)
  if (refl.kind === td.ReflectionKind.Variable) {
    return {
      name: refl.name,
      kind: 'const',
      signature: `const ${refl.name}: ${typeToString(refl.type)}`,
      description,
      tags,
    };
  }

  return {
    name: refl.name,
    kind: 'symbol',
    description,
    tags,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Main extraction
// ──────────────────────────────────────────────────────────────────────────────

async function bootstrap(entryPoints, tsconfig) {
  const app = await td.Application.bootstrapWithPlugins({
    entryPoints,
    tsconfig,
    excludePrivate: true,
    excludeProtected: true,
    excludeInternal: true,
    skipErrorChecking: true,
    logLevel: 'Warn',
    readme: 'none',
  });
  return app;
}

export async function extractApi() {
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const allReflections = [];

  // Project 1: @synkos/client
  {
    const app = await bootstrap(
      [resolve(REPO_ROOT, 'packages/synkos-client/src/index.ts')],
      resolve(REPO_ROOT, 'packages/synkos-client/tsconfig.json')
    );
    const project = await app.convert();
    if (project) allReflections.push(...(project.children ?? []));
  }

  // Project 2: @synkos/ui
  {
    const app = await bootstrap(
      [resolve(REPO_ROOT, 'packages/synkos-ui/src/index.ts')],
      resolve(REPO_ROOT, 'packages/synkos-ui/tsconfig.json')
    );
    const project = await app.convert();
    if (project) allReflections.push(...(project.children ?? []));
  }

  // Skip Vue components — they're documented on the components page.
  const exclude = new Set(['MainLayout', 'AuthLayout', 'SynkosApp']);
  // Also skip anything that came from a .vue source.
  const tsReflections = allReflections.filter((r) => {
    if (exclude.has(r.name)) return false;
    const sources = r.sources ?? [];
    return !sources.some((s) => s.fileName?.endsWith('.vue'));
  });

  // Group by category
  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    reflections: tsReflections.filter((r) => cat.match(r.name, r.kind)),
  }));

  // Render each non-empty category
  const writtenCategories = [];
  for (const cat of grouped) {
    if (!cat.reflections.length) continue;
    const symbols = cat.reflections
      .map(reflectionToSymbol)
      .sort((a, b) => a.name.localeCompare(b.name));
    const md = renderApiCategoryMd({
      category: cat,
      description: cat.description,
      symbols,
    });
    writeFileSync(resolve(OUT_DIR, `${cat.slug}.md`), md, 'utf8');
    writtenCategories.push({
      slug: cat.slug,
      title: cat.title,
      description: cat.description,
      count: symbols.length,
    });
  }

  // Index page
  writeFileSync(resolve(OUT_DIR, 'index.md'), renderApiIndexMd(writtenCategories), 'utf8');

  // Manifest for the Vue side
  const manifestDir = resolve(__dirname, '../assets/generated');
  mkdirSync(manifestDir, { recursive: true });
  writeFileSync(
    resolve(manifestDir, 'api.manifest.json'),
    JSON.stringify(writtenCategories, null, 2),
    'utf8'
  );

  return writtenCategories;
}
