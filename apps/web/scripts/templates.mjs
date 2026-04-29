// Markdown render helpers for the docs sync pipeline.
// Pure functions: take structured data, return markdown strings.

const AUTOGEN_HEADER = '<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->';

const escapePipe = (s = '') => String(s).replace(/\|/g, '\\|');
const fenceTs = (code) => '```ts\n' + code.trim() + '\n```';
const fenceVue = (code) => '```vue\n' + code.trim() + '\n```';

const slugify = (name) =>
  name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

const formatType = (type) => {
  if (!type) return '—';
  if (typeof type === 'string') return `\`${type}\``;
  if (type.tsType?.raw) return `\`${type.tsType.raw}\``;
  // Union types come as { name: 'union', elements: [{ name: '"a"' }, ...] }
  if (type.name === 'union' && Array.isArray(type.elements)) {
    return '`' + type.elements.map((e) => e.name).join(' \\| ') + '`';
  }
  if (type.name === 'Array' && Array.isArray(type.elements)) {
    return '`' + type.elements.map((e) => e.name).join(' \\| ') + '[]`';
  }
  if (type.name) return `\`${type.name}\``;
  return '—';
};

const formatDefault = (value) => {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'object' && 'value' in value) value = value.value;
  if (typeof value === 'string' && value !== '') return `\`${value}\``;
  return value === '' ? '—' : `\`${String(value)}\``;
};

// ──────────────────────────────────────────────────────────────────────────────
// Component page
// ──────────────────────────────────────────────────────────────────────────────

export function renderComponentMd({ name, sourcePackage, info, demoComponent }) {
  const description = info.description?.trim() || '';
  const examples = info.tags?.examples?.map((e) => e.description) ?? [];
  const props = info.props ?? [];
  const events = info.events ?? [];
  const slots = info.slots ?? [];

  const frontmatter = [
    '---',
    `title: ${name}`,
    description ? `description: ${JSON.stringify(description)}` : null,
    '---',
  ]
    .filter(Boolean)
    .join('\n');

  const sections = [];

  sections.push(`> Imported from \`${sourcePackage}\``);

  if (description) {
    sections.push(description);
  }

  // Live preview — rendered by an auto-imported Vue component via MDC syntax.
  // Wrapped in <ClientOnly> because demos render real interactive components
  // (some with Teleport, gestures, or browser-only APIs) that don't SSR
  // cleanly. The wrapper renders nothing on the server and hydrates the
  // demo on the client only.
  if (demoComponent) {
    sections.push(`## Preview\n\n<ClientOnly>\n\n::${demoComponent}\n::\n\n</ClientOnly>`);
  }

  if (examples.length) {
    sections.push(
      '## Usage\n\n' +
        examples
          .map((code) => (code.trim().startsWith('<') ? fenceVue(code) : fenceTs(code)))
          .join('\n\n')
    );
  }

  if (props.length) {
    const rows = props
      .map((p) => {
        const required = p.required ? ' _(required)_' : '';
        const def = p.defaultValue ? formatDefault(p.defaultValue) : '—';
        return `| \`${p.name}\`${required} | ${formatType(p.type)} | ${def} | ${escapePipe(p.description || '—')} |`;
      })
      .join('\n');
    sections.push(
      '## Props\n\n' +
        '| Name | Type | Default | Description |\n' +
        '| --- | --- | --- | --- |\n' +
        rows
    );
  }

  if (events.length) {
    const rows = events
      .map((e) => {
        const payload = e.type?.names?.map((n) => `\`${n}\``).join(', ') ?? '—';
        return `| \`${e.name}\` | ${payload} | ${escapePipe(e.description || '—')} |`;
      })
      .join('\n');
    sections.push(
      '## Events\n\n' + '| Name | Payload | Description |\n' + '| --- | --- | --- |\n' + rows
    );
  }

  if (slots.length) {
    const rows = slots
      .map((s) => {
        const scope = s.scoped
          ? '`{ ' + (s.bindings ?? []).map((b) => b.name).join(', ') + ' }`'
          : '—';
        return `| \`${s.name}\` | ${scope} | ${escapePipe(s.description || '—')} |`;
      })
      .join('\n');
    sections.push(
      '## Slots\n\n' + '| Name | Scope | Description |\n' + '| --- | --- | --- |\n' + rows
    );
  }

  if (!props.length && !events.length && !slots.length && !description) {
    sections.push(
      'This component does not have a documented public API yet. ' +
        'Contributions welcome — see the [source]() and add JSDoc above props/emits/slots.'
    );
  }

  return [frontmatter, '', AUTOGEN_HEADER, '', sections.join('\n\n'), ''].join('\n');
}

// ──────────────────────────────────────────────────────────────────────────────
// Components index
// ──────────────────────────────────────────────────────────────────────────────

export function renderComponentsIndexMd(_manifest) {
  // The catalog itself is rendered by the auto-imported `<ComponentsCatalog>`
  // Vue component, which reads the JSON manifest at runtime. Keep this page
  // small — only the frontmatter + intro + the MDC mount point.
  const frontmatter = [
    '---',
    'title: Components',
    'description: The full Synkos component catalog, organized by category with visual previews.',
    '---',
  ].join('\n');

  return [
    frontmatter,
    '',
    AUTOGEN_HEADER,
    '',
    'Every component below ships with `@synkos/ui` or `@synkos/client`. Click any card to see props, slots, events and a live preview.',
    '',
    '::ComponentsCatalog',
    '::',
    '',
  ].join('\n');
}

// ──────────────────────────────────────────────────────────────────────────────
// API category page
// ──────────────────────────────────────────────────────────────────────────────

export function renderApiCategoryMd({ category, description, symbols }) {
  const frontmatter = [
    '---',
    `title: ${category.title}`,
    `description: ${JSON.stringify(description)}`,
    '---',
  ].join('\n');

  const sections = symbols.map((s) => renderSymbol(s)).join('\n\n---\n\n');

  return [frontmatter, '', AUTOGEN_HEADER, '', description, '', sections, ''].join('\n');
}

function renderSymbol(sym) {
  const { name, kind, signature, description, tags, members } = sym;
  const parts = [`## ${name}`];

  if (kind) parts.push(`<small>${kind}</small>`);

  if (description) parts.push(description);

  if (signature) parts.push(fenceTs(signature));

  if (members?.length) {
    const rows = members
      .map(
        (m) =>
          `| \`${m.name}\` | ${m.type ? '`' + m.type + '`' : '—'} | ${escapePipe(m.description || '—')} |`
      )
      .join('\n');
    parts.push(
      '**Members**\n\n' + '| Name | Type | Description |\n' + '| --- | --- | --- |\n' + rows
    );
  }

  if (tags?.example?.length) {
    parts.push('**Example**\n\n' + tags.example.map((e) => fenceTs(e)).join('\n\n'));
  }

  return parts.join('\n\n');
}

// ──────────────────────────────────────────────────────────────────────────────
// API index
// ──────────────────────────────────────────────────────────────────────────────

export function renderApiIndexMd(categories) {
  const frontmatter = [
    '---',
    'title: API Reference',
    'description: TypeScript reference for @synkos/client and @synkos/ui.',
    '---',
  ].join('\n');

  const items = categories
    .map(
      (c) =>
        `- [${c.title}](/docs/api/${c.slug}) — ${c.description}${c.count ? ` _(${c.count} symbols)_` : ''}`
    )
    .join('\n');

  return [
    frontmatter,
    '',
    AUTOGEN_HEADER,
    '',
    'Auto-generated from TypeScript declarations in `@synkos/client` and `@synkos/ui`. Refer to the source for the most up-to-date version.',
    '',
    '> The API reference is only available in English. Localized versions of the conceptual guides are in [`/docs/guide`](/docs/guide/routing).',
    '',
    items,
    '',
  ].join('\n');
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers exported for other modules
// ──────────────────────────────────────────────────────────────────────────────

export { AUTOGEN_HEADER, slugify };
