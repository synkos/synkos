import { spawn } from 'child_process';
import { mkdirSync, writeFileSync, chmodSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const [, , command, target] = process.argv;

if (command === 'dev' && target === 'ios') {
  devIos();
} else {
  process.stderr.write(
    `synkos: unknown command "${[command, target].filter(Boolean).join(' ')}"\n` +
      'Available commands:\n' +
      '  synkos dev ios\n'
  );
  process.exit(1);
}

function devIos(): void {
  // Quasar's open-ide.js opens App.xcodeproj instead of App.xcworkspace because
  // readdirSync returns xcodeproj first alphabetically. We inject a PATH wrapper
  // that intercepts the `open` call and redirects .xcodeproj → .xcworkspace.
  const tmpDir = join(tmpdir(), `synkos-ios-${process.pid}`);
  mkdirSync(tmpDir, { recursive: true });

  writeFileSync(
    join(tmpDir, 'open'),
    '#!/bin/bash\n' +
      'for arg in "$@"; do\n' +
      '  if [[ "$arg" == *.xcodeproj ]]; then\n' +
      '    workspace="${arg%.xcodeproj}.xcworkspace"\n' +
      '    if [[ -d "$workspace" ]]; then\n' +
      '      exec /usr/bin/open "$workspace"\n' +
      '    fi\n' +
      '    break\n' +
      '  fi\n' +
      'done\n' +
      'exec /usr/bin/open "$@"\n'
  );
  chmodSync(join(tmpDir, 'open'), 0o755);

  const child = spawn('quasar', ['dev', '-m', 'capacitor', '-T', 'ios'], {
    env: { ...process.env, PATH: `${tmpDir}:${process.env.PATH}` },
    stdio: 'inherit',
    shell: true,
  });

  const cleanup = () => {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      void e;
    }
  };

  child.on('exit', (code) => {
    cleanup();
    process.exit(code ?? 0);
  });

  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
}
