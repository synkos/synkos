import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import type { PackageManager, ProjectOptions, TemplateType } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATE_DIR = path.resolve(__dirname, '../templates');

const DOTFILE_RENAMES: Record<string, string> = {
  gitignore: '.gitignore',
  dockerignore: '.dockerignore',
  'env.example': '.env.example',
};

const VARS_IN_CONTENT = new Set([
  'package.json',
  'app.config.ts',
  'capacitor.config.json',
  'env.example',
  '.env.example',
  'tsconfig.json',
]);

function shouldProcessContent(filename: string): boolean {
  return VARS_IN_CONTENT.has(filename);
}

function replaceVars(content: string, opts: ProjectOptions): string {
  return content
    .replace(/\{\{PROJECT_NAME\}\}/g, opts.projectName)
    .replace(/\{\{APP_NAME\}\}/g, opts.appName)
    .replace(/\{\{BUNDLE_ID\}\}/g, opts.bundleId)
    .replace(/\{\{API_PORT\}\}/g, String(opts.apiPort))
    .replace(/\{\{PROJECT_DESCRIPTION\}\}/g, `${opts.appName} — built with Synkos`);
}

function copyTemplate(srcDir: string, destDir: string, opts: ProjectOptions): void {
  fs.mkdirSync(destDir, { recursive: true });

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const destName = DOTFILE_RENAMES[entry.name] ?? entry.name;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, destName);

    if (entry.isDirectory()) {
      copyTemplate(srcPath, destPath, opts);
    } else {
      if (shouldProcessContent(destName)) {
        const raw = fs.readFileSync(srcPath, 'utf8');
        fs.writeFileSync(destPath, replaceVars(raw, opts), 'utf8');
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

function getInstallCmd(pm: PackageManager): string {
  switch (pm) {
    case 'pnpm':
      return 'pnpm install';
    case 'yarn':
      return 'yarn';
    case 'bun':
      return 'bun install';
    default:
      return 'npm install';
  }
}

export function scaffold(opts: ProjectOptions): void {
  const { outDir, template, initGit, installDeps, packageManager } = opts;

  if (fs.existsSync(outDir)) {
    throw new Error(`Directory "${outDir}" already exists.`);
  }

  const templatesToCopy: TemplateType[] =
    template === 'fullstack' ? ['frontend', 'backend'] : [template];

  if (template === 'fullstack') {
    fs.mkdirSync(outDir, { recursive: true });
    for (const t of templatesToCopy) {
      const src = path.join(TEMPLATE_DIR, t);
      const dest = path.join(outDir, t);
      copyTemplate(src, dest, opts);
    }
    // root package.json for fullstack monorepo-like workspace
    const rootPkg = {
      name: opts.projectName,
      version: '0.1.0',
      private: true,
      scripts: {
        'dev:frontend': 'cd frontend && quasar dev',
        'dev:backend': 'cd backend && npm run dev',
        dev: 'concurrently "npm run dev:frontend" "npm run dev:backend"',
      },
    };
    fs.writeFileSync(
      path.join(outDir, 'package.json'),
      JSON.stringify(rootPkg, null, 2) + '\n',
      'utf8'
    );
  } else {
    const src = path.join(TEMPLATE_DIR, template);
    copyTemplate(src, outDir, opts);
  }

  if (initGit) {
    try {
      execSync('git init', { cwd: outDir, stdio: 'ignore' });
      execSync('git add -A', { cwd: outDir, stdio: 'ignore' });
      execSync('git commit -m "chore: initial scaffold via create-synkos"', {
        cwd: outDir,
        stdio: 'ignore',
      });
    } catch {
      // git may not be available — non-fatal
    }
  }

  if (installDeps) {
    const cmd = getInstallCmd(packageManager);
    if (template === 'fullstack') {
      execSync(cmd, { cwd: path.join(outDir, 'frontend'), stdio: 'inherit' });
      execSync(cmd, { cwd: path.join(outDir, 'backend'), stdio: 'inherit' });
    } else {
      execSync(cmd, { cwd: outDir, stdio: 'inherit' });
    }
  }
}
