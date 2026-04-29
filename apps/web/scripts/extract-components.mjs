// Extracts component metadata from .vue files exported by @synkos/ui and
// @synkos/client and renders them as markdown pages under content/en/docs/components/.

import { readFileSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as docgenParse } from 'vue-docgen-api';
import { renderComponentMd, renderComponentsIndexMd, slugify } from './templates.mjs';

const DEMOS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../components');

/** Returns the MDC component tag (`AppButtonDemo`) if a demo exists, else null. */
function findDemo(componentName) {
  const file = resolve(DEMOS_DIR, `${componentName}Demo.vue`);
  return existsSync(file) ? `${componentName}Demo` : null;
}

// vue-docgen-api does not attach JSDoc comments inside `<script setup>` to the
// component itself (no explicit default export to anchor on). As a fallback we
// parse the SFC ourselves and extract the first JSDoc block that appears at
// the top of the script setup, before any code statements.
function extractScriptSetupJsdoc(filePath) {
  const src = readFileSync(filePath, 'utf8');
  const setupMatch = src.match(/<script\b[^>]*\bsetup\b[^>]*>([\s\S]*?)<\/script>/);
  if (!setupMatch) return { description: '', examples: [] };
  const body = setupMatch[1];
  const jsdocMatch = body.match(/^\s*\/\*\*([\s\S]*?)\*\//);
  if (!jsdocMatch) return { description: '', examples: [] };
  const inner = jsdocMatch[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim();

  // Split off @example and other block tags from the leading description.
  const tagSplit = inner.split(/\n@/);
  const description = tagSplit[0].trim();
  const examples = [];
  for (let i = 1; i < tagSplit.length; i++) {
    const segment = tagSplit[i];
    const m = segment.match(/^(\w+)\s+([\s\S]+)$/);
    if (!m) continue;
    const [, tagName, content] = m;
    if (tagName === 'example' && content) examples.push(content.trim());
  }
  return { description, examples };
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const OUT_DIR = resolve(__dirname, '../content/en/docs/components');

// Categorization heuristic: derived from the source file path.
// Falls back to "Other" if no folder hint is found.
function categorize(absolutePath) {
  const rel = relative(REPO_ROOT, absolutePath);
  if (rel.includes('/components/actions/')) return 'Actions';
  if (rel.includes('/components/layout/')) return 'Layout';
  if (rel.includes('/components/lists/')) return 'Lists';
  if (rel.includes('/components/forms/')) return 'Forms';
  if (rel.includes('/components/feedback/')) return 'Feedback';
  if (rel.includes('/components/overlays/')) return 'Overlays';
  if (rel.includes('/components/media/')) return 'Media';
  if (rel.includes('/components/navigation/')) return 'Navigation';
  if (rel.includes('/components/auth/')) return 'Auth';
  if (rel.includes('/navigation/layouts/')) return 'Layout';
  if (rel.includes('/vue/components/')) return 'Other';
  if (rel.includes('/vue/SynkosApp')) return 'Layout';
  return 'Other';
}

// Parse an `index.ts` for `export { default as Foo } from './path/Foo.vue'`
// and `export { default as Foo } from './path/Foo.vue';` (synkos-client uses .vue.js? no, just .vue here).
function findVueExports(indexPath) {
  const source = readFileSync(indexPath, 'utf8');
  const lines = source.split('\n');
  const re = /export\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from\s+['"]([^'"]+\.vue)['"]\s*;?\s*$/;
  const out = [];
  for (const line of lines) {
    const m = line.match(re);
    if (!m) continue;
    const [, name, relImport] = m;
    const abs = resolve(dirname(indexPath), relImport);
    out.push({ name, file: abs });
  }
  return out;
}

export async function extractComponents() {
  const sources = [
    {
      pkg: '@synkos/ui',
      indexPath: resolve(REPO_ROOT, 'packages/synkos-ui/src/index.ts'),
    },
    {
      pkg: '@synkos/client',
      indexPath: resolve(REPO_ROOT, 'packages/synkos-client/src/index.ts'),
    },
  ];

  // Wipe and recreate the output dir to drop stale entries.
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const manifest = [];

  for (const source of sources) {
    const exports = findVueExports(source.indexPath);
    for (const exp of exports) {
      try {
        const info = await docgenParse(exp.file);
        // Fallback: pick up component-level description + @example from the
        // first JSDoc inside the <script setup> block.
        if (!info.description) {
          const fb = extractScriptSetupJsdoc(exp.file);
          if (fb.description) info.description = fb.description;
          if (fb.examples.length) {
            info.tags = info.tags ?? {};
            info.tags.examples = fb.examples.map((e) => ({ description: e }));
          }
        }
        const slug = slugify(exp.name);
        const demoComponent = findDemo(exp.name);
        const md = renderComponentMd({
          name: exp.name,
          sourcePackage: source.pkg,
          info,
          demoComponent,
        });
        writeFileSync(resolve(OUT_DIR, `${slug}.md`), md, 'utf8');
        manifest.push({
          name: exp.name,
          slug,
          sourcePackage: source.pkg,
          category: categorize(exp.file),
          shortDescription: (info.description || '').split('\n')[0].trim(),
        });
      } catch (err) {
        console.warn(`[sync:docs] could not parse ${exp.name} (${exp.file}): ${err.message}`);
      }
    }
  }

  // Sort each category alphabetically.
  manifest.sort((a, b) => a.name.localeCompare(b.name));

  // Write index.md
  writeFileSync(resolve(OUT_DIR, 'index.md'), renderComponentsIndexMd(manifest), 'utf8');

  // Write a JSON manifest the Vue side can import for sidebar/listing.
  const manifestDir = resolve(__dirname, '../assets/generated');
  mkdirSync(manifestDir, { recursive: true });
  writeFileSync(
    resolve(manifestDir, 'components.manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  return manifest;
}
