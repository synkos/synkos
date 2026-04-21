export type TemplateType = 'fullstack' | 'frontend' | 'backend';
export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export interface ProjectOptions {
  projectName: string;
  template: TemplateType;
  appName: string;
  bundleId: string;
  apiPort: number;
  packageManager: PackageManager;
  initGit: boolean;
  installDeps: boolean;
  outDir: string;
}
