#!/usr/bin/env node
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { runPrompts } from './prompts.js';
import { scaffold } from './scaffold.js';

const VERSION = '0.1.0';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--version') || args.includes('-v')) {
    process.stdout.write(VERSION + '\n');
    process.exit(0);
  }

  const cliProjectName = args.find((a) => !a.startsWith('-'));

  try {
    const opts = await runPrompts(cliProjectName);

    const spinner = p.spinner();
    spinner.start('Scaffolding project…');

    try {
      scaffold(opts);
      spinner.stop('Project created!');
    } catch (err) {
      spinner.stop(pc.red('Scaffold failed'));
      throw err;
    }

    const pmRun = opts.packageManager === 'npm' ? 'npm run' : opts.packageManager;
    const cdPath = opts.outDir;

    p.note(
      [
        `  cd ${cdPath}`,
        opts.template !== 'frontend' ? `  ${pmRun} dev` : `  quasar dev`,
      ].join('\n'),
      'Next steps',
    );

    p.outro(pc.green('Happy hacking! 🚀'));
  } catch (err) {
    if (err instanceof Error) {
      p.cancel(pc.red(err.message));
    } else {
      p.cancel('An unexpected error occurred.');
    }
    process.exit(1);
  }
}

main();
