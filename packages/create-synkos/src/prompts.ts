import * as p from '@clack/prompts';
import pc from 'picocolors';
import type { PackageManager, ProjectOptions, TemplateType } from './types.js';

function isCancel(v: unknown): v is symbol {
  return typeof v === 'symbol';
}

function abortIfCancelled(value: unknown): asserts value {
  if (isCancel(value)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }
}

function toKebab(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function toDisplay(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function detectPackageManager(): PackageManager {
  const agent = process.env['npm_config_user_agent'] ?? '';
  if (agent.startsWith('pnpm')) return 'pnpm';
  if (agent.startsWith('yarn')) return 'yarn';
  if (agent.startsWith('bun')) return 'bun';
  return 'npm';
}

export async function runPrompts(cliProjectName?: string): Promise<ProjectOptions> {
  p.intro(pc.bgCyan(pc.black(' create-synkos ')));

  const projectName = cliProjectName
    ? toKebab(cliProjectName)
    : (() => {
        return undefined; // handled below
      })();

  const projectNameAnswer =
    projectName ??
    (await (async () => {
      const v = await p.text({
        message: 'Project name',
        placeholder: 'my-synkos-app',
        validate(val) {
          const k = toKebab(val);
          if (!k) return 'Project name cannot be empty';
          if (!/^[a-z][a-z0-9-]*$/.test(k)) return 'Use lowercase letters, numbers, and hyphens';
        },
      });
      abortIfCancelled(v);
      return toKebab(v as string);
    })());

  const template = await p.select<TemplateType>({
    message: 'Template',
    options: [
      { value: 'fullstack', label: 'Fullstack', hint: 'frontend + backend' },
      { value: 'frontend', label: 'Frontend only', hint: 'Quasar + Vue 3 + Capacitor' },
      { value: 'backend', label: 'Backend only', hint: 'Express + Mongoose + @synkos/server' },
    ],
  });
  abortIfCancelled(template);

  const needsMobile = (template as TemplateType) !== 'backend';
  const needsServer = (template as TemplateType) !== 'frontend';

  const appName = needsMobile
    ? await p.text({
        message: 'App display name',
        placeholder: toDisplay(projectNameAnswer),
        defaultValue: toDisplay(projectNameAnswer),
      })
    : toDisplay(projectNameAnswer);
  if (needsMobile) abortIfCancelled(appName);

  const bundleId = needsMobile
    ? await p.text({
        message: 'Bundle ID (iOS/Android)',
        placeholder: `com.company.${projectNameAnswer.replace(/-/g, '')}`,
        defaultValue: `com.company.${projectNameAnswer.replace(/-/g, '')}`,
        validate(val) {
          if (!/^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*){2,}$/.test(val.trim())) {
            return 'Must be a valid bundle ID (e.g. com.company.app)';
          }
        },
      })
    : '';
  if (needsMobile) abortIfCancelled(bundleId);

  const apiPortRaw = needsServer
    ? await p.text({
        message: 'API port',
        placeholder: '3001',
        defaultValue: '3001',
        validate(val) {
          const n = parseInt(val, 10);
          if (isNaN(n) || n < 1 || n > 65535) return 'Enter a valid port (1–65535)';
        },
      })
    : '3001';
  if (needsServer) abortIfCancelled(apiPortRaw);

  const detectedPm = detectPackageManager();
  const packageManager = await p.select<PackageManager>({
    message: 'Package manager',
    options: [
      { value: 'pnpm', label: 'pnpm', hint: detectedPm === 'pnpm' ? 'detected' : undefined },
      { value: 'npm', label: 'npm', hint: detectedPm === 'npm' ? 'detected' : undefined },
      { value: 'yarn', label: 'yarn', hint: detectedPm === 'yarn' ? 'detected' : undefined },
      { value: 'bun', label: 'bun', hint: detectedPm === 'bun' ? 'detected' : undefined },
    ],
    initialValue: detectedPm,
  });
  abortIfCancelled(packageManager);

  const initGit = await p.confirm({ message: 'Initialize git repository?', initialValue: true });
  abortIfCancelled(initGit);

  const installDeps = await p.confirm({
    message: `Install dependencies with ${packageManager as string}?`,
    initialValue: true,
  });
  abortIfCancelled(installDeps);

  return {
    projectName: projectNameAnswer,
    template: template as TemplateType,
    appName: typeof appName === 'string' ? appName : toDisplay(projectNameAnswer),
    bundleId: typeof bundleId === 'string' ? bundleId : '',
    apiPort: parseInt(typeof apiPortRaw === 'string' ? apiPortRaw : '3001', 10),
    packageManager: packageManager as PackageManager,
    initGit: initGit as boolean,
    installDeps: installDeps as boolean,
    outDir: projectNameAnswer,
  };
}
